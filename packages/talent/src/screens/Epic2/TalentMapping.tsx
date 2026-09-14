import { useState, useMemo, useCallback } from "react";
import { Layout } from "../../components/shell/Layout";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { AlertCircle, TrendingUp, Users, ArrowUpRight, RotateCcw, Download, History, Star } from "lucide-react";
import { toast } from "sonner";
import {
  NineBoxSidePanel,
  type Employee as SidePanelEmployee,
} from "../../components/NineBoxSidePanel";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  getEmployeesByLevel,
  getCalibrationStatus,
  JOB_LEVELS,
  COMPANIES,
  CLASSIFICATION_PERIODS,
  type NineBoxEmployee,
  type CalibrationStatus,
} from "../../data/mock9BoxData";
import {
  NINE_BOX_CELLS,
  NINE_BOX_CELL_BY_ID,
  getCellByPerformancePotential,
  getOfficialCluster,
  BOX_LIMITS,
  type NineBoxCellId,
  type NineBoxCellMeta,
  type OfficialCluster,
  type PerformanceBand,
  type PotentialBand,
} from "../../lib/talent/nineBoxClusters";

type ViewMode = "grid" | "list";

interface AuditEntry {
  employeeId: string;
  actor: string;
  fromCell: NineBoxCellId | "";
  toCell: NineBoxCellId;
  reason: string;
  at: string;
}

const DEFAULT_COMPANY = "pt-api";
const DEFAULT_LEVEL = "bod-2";
const DEFAULT_PERIOD = "2025";
const CALIBRATOR = "Talent Committee — HCBP Facilitator";

function pct(count: number, total: number): number {
  if (total === 0) return 0;
  return (count / total) * 100;
}

function countByOfficialCluster(employees: NineBoxEmployee[], name: OfficialCluster): number {
  return employees.filter((e) => e.cluster && getOfficialCluster(e.cluster) === name).length;
}

function exportCohortCsv(employees: NineBoxEmployee[], period: string, company: string, level: string) {
  const headers = [
    "id",
    "nik",
    "name",
    "position",
    "department",
    "company",
    "cell",
    "cluster",
    "performanceScore",
    "potentialScore",
    "isTopTalent",
    "dataGaps",
    "period",
  ];
  const rows = employees.map((e) =>
    [
      e.id,
      e.nik,
      e.name,
      e.position,
      e.department,
      e.company,
      e.cluster || "",
      e.cluster ? getOfficialCluster(e.cluster) ?? "" : "",
      e.performanceScore,
      e.capacityScore,
      e.isTopTalent ? "yes" : "no",
      (e.dataGaps ?? []).join("|"),
      period,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `talent-classification-${company}-${level}-${period}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function statusBadgeVariant(status: CalibrationStatus): string {
  if (status === "Published") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "Calibrated") return "bg-primary/10 text-primary border-primary/20";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

export function TalentMapping() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedCluster, setSelectedCluster] = useState<NineBoxCellMeta | null>(null);
  const [showEmployeeList, setShowEmployeeList] = useState(false);
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyEmployee, setHistoryEmployee] = useState<NineBoxEmployee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<NineBoxEmployee | null>(null);
  const [calibrationReason, setCalibrationReason] = useState("");
  const [newCluster, setNewCluster] = useState<NineBoxCellId | "">("");
  const [selectedLevel, setSelectedLevel] = useState(DEFAULT_LEVEL);
  const [selectedCompany, setSelectedCompany] = useState(DEFAULT_COMPANY);
  const [selectedPeriod, setSelectedPeriod] = useState(DEFAULT_PERIOD);
  const [rosterOverrides, setRosterOverrides] = useState<Record<string, NineBoxEmployee>>({});
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);

  const baseRoster = useMemo(
    () => getEmployeesByLevel(selectedLevel, selectedCompany, selectedPeriod),
    [selectedLevel, selectedCompany, selectedPeriod],
  );

  const roster = useMemo(() => {
    return baseRoster.map((emp) => rosterOverrides[emp.id] ?? emp);
  }, [baseRoster, rosterOverrides]);

  const classified = useMemo(() => roster.filter((e) => e.cluster && !(e.dataGaps?.length)), [roster]);
  const dataGaps = useMemo(() => roster.filter((e) => (e.dataGaps?.length ?? 0) > 0), [roster]);

  const calibrationStatus = useMemo(
    () => getCalibrationStatus(selectedPeriod, selectedCompany, selectedLevel),
    [selectedPeriod, selectedCompany, selectedLevel],
  );

  const employeesByCell = useMemo(() => {
    const map: Record<NineBoxCellId, NineBoxEmployee[]> = {
      "h-h": [],
      "h-m": [],
      "h-l": [],
      "m-h": [],
      "m-m": [],
      "m-l": [],
      "l-h": [],
      "l-m": [],
      "l-l": [],
    };
    for (const emp of classified) {
      if (emp.cluster) map[emp.cluster as NineBoxCellId].push(emp);
    }
    return map;
  }, [classified]);

  const totalEmployees = classified.length;

  const highPotentialCount = countByOfficialCluster(classified, "High Potential");
  const promotableCount = countByOfficialCluster(classified, "Promotable");
  const highFlyerCount = highPotentialCount + promotableCount;
  const sleepingTigerCount = countByOfficialCluster(classified, "Sleeping Tiger");
  const unfitCount = countByOfficialCluster(classified, "Unfit");

  const highFlyerPercentage = pct(highFlyerCount, totalEmployees);
  const sleepingTigerPercentage = pct(sleepingTigerCount, totalEmployees);
  const unfitPercentage = pct(unfitCount, totalEmployees);

  const alerts = {
    unfit: unfitPercentage > 5,
    sleepingTiger: sleepingTigerPercentage > 10,
    highFlyer: highFlyerPercentage < 10 && totalEmployees > 0,
  };

  const handleReset = useCallback(() => {
    setSelectedCompany(DEFAULT_COMPANY);
    setSelectedLevel(DEFAULT_LEVEL);
    setSelectedPeriod(DEFAULT_PERIOD);
    setRosterOverrides({});
    setAuditTrail([]);
    setViewMode("grid");
    setShowEmployeeList(false);
    setSelectedCluster(null);
    toast.success("Filters reset to default cohort");
  }, []);

  const handleExport = useCallback(() => {
    exportCohortCsv(roster, selectedPeriod, selectedCompany, selectedLevel);
    toast.success("Cohort exported as CSV");
  }, [roster, selectedPeriod, selectedCompany, selectedLevel]);

  const handleClusterClick = (cluster: NineBoxCellMeta) => {
    setSelectedCluster(cluster);
    setShowEmployeeList(true);
  };

  const handleCalibrateClick = (employee: SidePanelEmployee | NineBoxEmployee) => {
    const full = roster.find((e) => e.id === employee.id) ?? null;
    setSelectedEmployee(full);
    setNewCluster("");
    setCalibrationReason("");
    setShowCalibrationModal(true);
  };

  const handleShowHistory = (employee: NineBoxEmployee) => {
    setHistoryEmployee(employee);
    setShowHistoryModal(true);
  };

  const confirmCalibration = () => {
    if (!selectedEmployee || !newCluster) return;
    if (!calibrationReason.trim()) {
      toast.error("Justification is required for calibration");
      return;
    }

    const fromCell = (selectedEmployee.cluster || "") as NineBoxCellId | "";
    const now = new Date().toISOString().slice(0, 10);
    const fromName = fromCell ? getOfficialCluster(fromCell) ?? fromCell : "Unclassified";
    const toMeta = NINE_BOX_CELL_BY_ID[newCluster];

    const updated: NineBoxEmployee = {
      ...selectedEmployee,
      cluster: newCluster,
      dataGaps: undefined,
      isOverridden: true,
      overrideInfo: {
        originalBox: String(fromName),
        reason: calibrationReason.trim(),
        overriddenBy: CALIBRATOR,
        overriddenDate: now,
      },
      priorPeriod: selectedEmployee.priorPeriod ?? (fromCell ? { period: "2024", cluster: fromCell as NineBoxCellId } : undefined),
    };

    setRosterOverrides((prev) => ({ ...prev, [updated.id]: updated }));
    setAuditTrail((prev) => [
      {
        employeeId: updated.id,
        actor: CALIBRATOR,
        fromCell,
        toCell: newCluster,
        reason: calibrationReason.trim(),
        at: new Date().toISOString(),
      },
      ...prev,
    ]);

    toast.success(`Calibrated ${updated.name} → ${toMeta.name}`);
    setShowCalibrationModal(false);
    setCalibrationReason("");
    setNewCluster("");
    setSelectedEmployee(null);
  };

  const convertToSidePanelEmployees = (cellId: NineBoxCellId): SidePanelEmployee[] => {
    return (employeesByCell[cellId] ?? []).map((emp) => ({
      id: emp.id,
      name: emp.name,
      position: emp.position,
      department: emp.department,
      company: emp.company,
      performanceScore: emp.performanceScore,
      potentialScore: emp.capacityScore,
      isOverridden: emp.isOverridden,
      overrideInfo: emp.overrideInfo,
      email: `${emp.nik.toLowerCase()}@company.com`,
      isTopTalent: emp.isTopTalent,
      priorPeriod: emp.priorPeriod
        ? {
            period: emp.priorPeriod.period,
            cell: emp.priorPeriod.cluster,
            clusterName: getOfficialCluster(emp.priorPeriod.cluster) ?? emp.priorPeriod.cluster,
          }
        : undefined,
      onHistoryClick: () => handleShowHistory(emp),
    }));
  };

  const renderCell = (performance: PerformanceBand, potential: PotentialBand) => {
    const cluster = getCellByPerformancePotential(performance, potential);
    if (!cluster) return null;
    const employees = employeesByCell[cluster.id] ?? [];
    const count = employees.length;

    return (
      <button
        type="button"
        key={cluster.id}
        className={`${cluster.colorClass} rounded-lg border border-transparent hover:border-white/20 cursor-pointer transition-shadow hover:shadow-lg overflow-hidden text-left w-full`}
        onClick={() => handleClusterClick(cluster)}
      >
        <div className="p-4 h-[180px] flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-base font-semibold ${cluster.textColorClass}`}>{cluster.name}</p>
            <span className={`text-[10px] font-medium uppercase tracking-wide opacity-80 ${cluster.textColorClass}`}>
              {cluster.id.toUpperCase()}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 content-start flex-1 py-2">
            {employees.slice(0, 12).map((emp) => {
              const initials = emp.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <div
                  key={emp.id}
                  className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/10 shadow-sm relative"
                  title={emp.name}
                >
                  <span className="text-[10px] font-bold">{initials}</span>
                  {emp.isTopTalent ? (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-300 border border-white" />
                  ) : null}
                </div>
              );
            })}
            {count > 12 && (
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/10">
                <span className="text-[10px] font-bold">+{count - 12}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Users className={`w-4 h-4 ${cluster.textColorClass} opacity-80`} />
            <p className={`text-sm font-bold ${cluster.textColorClass}`}>{count} people</p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-heading font-semibold text-foreground">Talent Classification</h1>
            <p className="text-muted-foreground">
              Performance × Potential 9-Box with five official clusters (BPR-TM-002)
            </p>
          </div>
          <Badge className={`border px-3 py-1.5 text-sm font-medium w-fit ${statusBadgeVariant(calibrationStatus)}`}>
            {calibrationStatus} · Period {selectedPeriod}
          </Badge>
        </div>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Period:</span>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-[120px] bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSIFICATION_PERIODS.map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="h-6 w-px bg-border hidden md:block" />

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Company/Unit:</span>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="w-[200px] bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANIES.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="h-6 w-px bg-border hidden md:block" />

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Job Level:</span>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-[200px] bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_LEVELS.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:ml-auto flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-background hover:bg-muted hover:text-foreground"
                  onClick={handleReset}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-background hover:bg-muted hover:text-foreground"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {dataGaps.length > 0 && (
          <Card className="border-amber-200 bg-amber-50 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    Data gaps — {dataGaps.length} employee{dataGaps.length === 1 ? "" : "s"} missing inputs
                  </p>
                  <p className="text-sm text-amber-800 mt-1">
                    Classification draft excludes these people until Performance and Potential buckets are complete.
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto rounded-md border border-amber-200 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Missing</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataGaps.map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">{emp.name}</TableCell>
                        <TableCell>{emp.position}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {(emp.dataGaps ?? []).map((gap) => (
                              <Badge key={gap} variant="outline" className="capitalize border-amber-300 text-amber-800">
                                {gap}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Classified</p>
                  <h3 className="text-2xl font-semibold text-foreground">{totalEmployees}</h3>
                  {dataGaps.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">{dataGaps.length} with gaps</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`border-border shadow-sm ${
              alerts.highFlyer ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/60">
                  {alerts.highFlyer ? (
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                  ) : (
                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium mb-1 ${alerts.highFlyer ? "text-amber-700" : "text-emerald-700"}`}>
                    Talent Pool (HP + Promotable)
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h3 className={`text-2xl font-semibold ${alerts.highFlyer ? "text-amber-700" : "text-emerald-700"}`}>
                      {highFlyerCount}
                    </h3>
                    <span className={`text-xs ${alerts.highFlyer ? "text-amber-700/80" : "text-emerald-700/80"}`}>
                      ({highFlyerPercentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`border-border shadow-sm ${
              alerts.sleepingTiger ? "bg-amber-50 border-amber-200" : "bg-primary/10 border-primary/20"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/60">
                  {alerts.sleepingTiger ? (
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                  ) : (
                    <Users className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium mb-1 ${alerts.sleepingTiger ? "text-amber-700" : "text-primary"}`}>
                    Sleeping Tigers
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h3 className={`text-2xl font-semibold ${alerts.sleepingTiger ? "text-amber-700" : "text-primary"}`}>
                      {sleepingTigerCount}
                    </h3>
                    <span className={`text-xs ${alerts.sleepingTiger ? "text-amber-700/80" : "text-primary/80"}`}>
                      ({sleepingTigerPercentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`border-border shadow-sm ${alerts.unfit ? "bg-red-50 border-red-200" : "bg-muted border-border"}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/60">
                  <AlertCircle className={`w-6 h-6 ${alerts.unfit ? "text-red-500" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className={`text-sm font-medium mb-1 ${alerts.unfit ? "text-red-700" : "text-muted-foreground"}`}>
                    Unfit
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h3 className={`text-2xl font-semibold ${alerts.unfit ? "text-red-700" : "text-muted-foreground"}`}>
                      {unfitCount}
                    </h3>
                    <span className={`text-xs ${alerts.unfit ? "text-red-700/80" : "text-muted-foreground"}`}>
                      ({unfitPercentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border shadow-sm">
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-xl font-heading font-semibold text-foreground">Talent Distribution Matrix</h3>
                  <p className="text-muted-foreground mt-1">
                    Click a box to review employees or calibrate. Top Talent is marked separately from High Potential.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className="bg-card hover:bg-muted hover:text-foreground"
                >
                  {viewMode === "grid" ? "List View" : "Grid View"}
                </Button>
              </div>

              {viewMode === "grid" ? (
                <div className="relative pl-[48px]">
                  <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-[40px]">
                    <div className="flex flex-col items-center gap-4 h-full justify-center">
                      <ArrowUpRight className="w-5 h-5 text-muted-foreground -rotate-45" />
                      <p
                        className="text-sm font-medium text-muted-foreground whitespace-nowrap"
                        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                      >
                        Performance (Excellent → Below)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {(["Low", "Medium", "High"] as PotentialBand[]).map((potential) =>
                      renderCell("High", potential),
                    )}
                    {(["Low", "Medium", "High"] as PotentialBand[]).map((potential) =>
                      renderCell("Medium", potential),
                    )}
                    {(["Low", "Medium", "High"] as PotentialBand[]).map((potential) =>
                      renderCell("Low", potential),
                    )}
                  </div>

                  <div className="flex items-center justify-center mt-6 gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Potential (Low → High)</p>
                    <ArrowUpRight className="w-5 h-5 text-muted-foreground rotate-45" />
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Cell</TableHead>
                        <TableHead>Cluster</TableHead>
                        <TableHead>Top Talent</TableHead>
                        <TableHead>Gaps</TableHead>
                        <TableHead>Perf</TableHead>
                        <TableHead>Potential</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roster.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                            No employees in this cohort.
                          </TableCell>
                        </TableRow>
                      ) : (
                        roster.map((emp) => {
                          const clusterName = emp.cluster ? getOfficialCluster(emp.cluster) : null;
                          return (
                            <TableRow key={emp.id}>
                              <TableCell className="font-medium">{emp.name}</TableCell>
                              <TableCell>{emp.position}</TableCell>
                              <TableCell>{emp.cluster ? emp.cluster.toUpperCase() : "—"}</TableCell>
                              <TableCell>{clusterName ?? "Unclassified"}</TableCell>
                              <TableCell>
                                {emp.isTopTalent ? (
                                  <Badge className="bg-amber-50 text-amber-800 border-amber-200 gap-1">
                                    <Star className="w-3 h-3" />
                                    Top Talent
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground text-sm">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {(emp.dataGaps?.length ?? 0) > 0 ? (
                                  <div className="flex gap-1 flex-wrap">
                                    {emp.dataGaps!.map((g) => (
                                      <Badge key={g} variant="outline" className="capitalize text-amber-800 border-amber-300">
                                        {g}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">—</span>
                                )}
                              </TableCell>
                              <TableCell>{emp.dataGaps?.includes("performance") ? "—" : emp.performanceScore}</TableCell>
                              <TableCell>{emp.dataGaps?.includes("potential") ? "—" : emp.capacityScore}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => handleShowHistory(emp)}
                                    disabled={!emp.priorPeriod && !auditTrail.some((a) => a.employeeId === emp.id)}
                                  >
                                    <History className="w-4 h-4" />
                                    History
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCalibrateClick(emp)}
                                    disabled={calibrationStatus === "Published"}
                                  >
                                    Calibrate
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {auditTrail.length > 0 && (
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 space-y-3">
              <h3 className="text-lg font-heading font-semibold text-foreground">Calibration audit trail</h3>
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditTrail.map((entry) => {
                      const emp = roster.find((e) => e.id === entry.employeeId);
                      return (
                        <TableRow key={`${entry.employeeId}-${entry.at}`}>
                          <TableCell className="whitespace-nowrap text-sm">
                            {new Date(entry.at).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium">{emp?.name ?? entry.employeeId}</TableCell>
                          <TableCell>
                            {entry.fromCell
                              ? `${getOfficialCluster(entry.fromCell)} (${entry.fromCell.toUpperCase()})`
                              : "Unclassified"}
                          </TableCell>
                          <TableCell>
                            {getOfficialCluster(entry.toCell)} ({entry.toCell.toUpperCase()})
                          </TableCell>
                          <TableCell className="text-sm">{entry.actor}</TableCell>
                          <TableCell className="text-sm max-w-xs">{entry.reason}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedCluster && (
        <NineBoxSidePanel
          open={showEmployeeList}
          onOpenChange={setShowEmployeeList}
          boxName={selectedCluster.name}
          boxDescription={selectedCluster.description}
          boxColor={selectedCluster.colorClass}
          employees={convertToSidePanelEmployees(selectedCluster.id)}
          limits={BOX_LIMITS[selectedCluster.id]}
          onCalibrateClick={handleCalibrateClick}
        />
      )}

      <Dialog open={showCalibrationModal} onOpenChange={setShowCalibrationModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Calibrate Employee</DialogTitle>
            <DialogDescription>
              Adjust the 9-box placement for{" "}
              <span className="font-medium text-foreground">{selectedEmployee?.name}</span>. Justification is
              required (BR-TC-008).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-lg border border-border">
                {selectedEmployee?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  {selectedEmployee?.name}
                  {selectedEmployee?.isTopTalent ? (
                    <Badge className="bg-amber-50 text-amber-800 border-amber-200 gap-1">
                      <Star className="w-3 h-3" />
                      Top Talent
                    </Badge>
                  ) : null}
                </h4>
                <p className="text-sm text-muted-foreground">{selectedEmployee?.position}</p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-cluster">New Classification</Label>
              <Select value={newCluster} onValueChange={(v) => setNewCluster(v as NineBoxCellId)}>
                <SelectTrigger id="new-cluster" className="bg-background">
                  <SelectValue placeholder="Select new 9-box cell" />
                </SelectTrigger>
                <SelectContent>
                  {NINE_BOX_CELLS.map((cluster) => (
                    <SelectItem key={cluster.id} value={cluster.id}>
                      {cluster.name} ({cluster.id.toUpperCase()} · {cluster.performanceLabel} ×{" "}
                      {cluster.potentialLabel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">Justification (required)</Label>
              <Textarea
                id="reason"
                placeholder="Provide a reason for this calibration..."
                className="resize-none bg-background"
                rows={3}
                value={calibrationReason}
                onChange={(e) => setCalibrationReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCalibrationModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmCalibration} disabled={!newCluster || !calibrationReason.trim()}>
              Confirm Calibration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Movement history</DialogTitle>
            <DialogDescription>
              9-Box and cluster movement for{" "}
              <span className="font-medium text-foreground">{historyEmployee?.name}</span> (BR-TC-010).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {historyEmployee?.priorPeriod ? (
              <div className="rounded-lg border border-border p-4 space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Period {historyEmployee.priorPeriod.period}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {getOfficialCluster(historyEmployee.priorPeriod.cluster)} (
                  {historyEmployee.priorPeriod.cluster.toUpperCase()})
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No prior period on file.</p>
            )}
            <div className="rounded-lg border border-border p-4 space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Period {selectedPeriod} (current)
              </p>
              <p className="text-sm font-semibold text-foreground">
                {historyEmployee?.cluster
                  ? `${getOfficialCluster(historyEmployee.cluster)} (${historyEmployee.cluster.toUpperCase()})`
                  : "Unclassified (data gap)"}
              </p>
              {historyEmployee?.isOverridden && historyEmployee.overrideInfo ? (
                <p className="text-xs text-amber-700 mt-2">
                  Calibrated by {historyEmployee.overrideInfo.overriddenBy} on{" "}
                  {historyEmployee.overrideInfo.overriddenDate}: {historyEmployee.overrideInfo.reason}
                </p>
              ) : null}
            </div>
            {historyEmployee &&
              auditTrail
                .filter((a) => a.employeeId === historyEmployee.id)
                .map((entry) => (
                  <div key={entry.at} className="rounded-lg border border-border p-3 text-sm">
                    <p className="font-medium text-foreground">
                      {entry.fromCell ? getOfficialCluster(entry.fromCell) : "Unclassified"} →{" "}
                      {getOfficialCluster(entry.toCell)}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {new Date(entry.at).toLocaleString()} · {entry.actor}
                    </p>
                    <p className="mt-1">{entry.reason}</p>
                  </div>
                ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHistoryModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
