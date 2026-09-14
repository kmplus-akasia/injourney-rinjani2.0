import { useState, useMemo } from "react";
import { Layout } from "../../components/shell/Layout";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Circle,
  Calendar,
  Users,
  Target,
  Search,
  Filter,
  FileText,
  CalendarCheck,
  TrendingUp,
  Building2
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { mockPositions, getCandidatesForPosition } from "../../data/mockTalentData";
import type { Position as TalentPosition } from "../../types/talent";
import { SuccessorBenchmarkPanel, SuccessorCandidate } from "../../components/SuccessorBenchmarkPanel";
import { TalentDayScheduleModal } from "../../components/TalentDayScheduleModal";
import { BeritaAcaraGenerator } from "../../components/BeritaAcaraGenerator";

interface Position extends TalentPosition {
  hasSuccessionPlan?: boolean;
  successors?: {
    primary?: { id: string; name: string; };
    secondary?: { id: string; name: string; };
    tertiary?: { id: string; name: string; };
  };
  talentDayScheduled?: boolean;
  beritaAcaraGenerated?: boolean;
}

type KanbanColumn = "vacant" | "vacant-soon" | "to-review" | "filled";

export function SuccessionPlanning() {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");

  // Modal states
  const [showSuccessorModal, setShowSuccessorModal] = useState(false);
  const [showTalentDayModal, setShowTalentDayModal] = useState(false);
  const [showBeritaAcaraModal, setShowBeritaAcaraModal] = useState(false);

  // Succession plan data
  const [successionPlans, setSuccessionPlans] = useState<Record<string, any>>({});

  const columns: { id: KanbanColumn; title: string; icon: any; color: string }[] = [
    { id: "vacant", title: "Vacant", icon: AlertTriangle, color: "text-red-600" },
    { id: "vacant-soon", title: "Vacant Soon", icon: Clock, color: "text-orange-600" },
    { id: "to-review", title: "To Review", icon: Circle, color: "text-yellow-600" },
    { id: "filled", title: "Filled", icon: CheckCircle2, color: "text-green-600" },
  ];

  // Enhanced positions with succession plan status
  const enhancedPositions: Position[] = useMemo(() => {
    return mockPositions.map(pos => ({
      ...pos,
      hasSuccessionPlan: !!successionPlans[pos.id],
      successors: successionPlans[pos.id]?.successors,
      talentDayScheduled: !!successionPlans[pos.id]?.talentDay,
      beritaAcaraGenerated: !!successionPlans[pos.id]?.beritaAcara,
    }));
  }, [successionPlans]);

  // Filter positions
  const filteredPositions = useMemo(() => {
    return enhancedPositions.filter(pos => {
      const matchesSearch = pos.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pos.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment = filterDepartment === "all" || pos.department === filterDepartment;
      const matchesRisk = filterRisk === "all" || pos.risk === filterRisk;
      
      return matchesSearch && matchesDepartment && matchesRisk;
    });
  }, [enhancedPositions, searchQuery, filterDepartment, filterRisk]);

  const getColumnPositions = (columnId: KanbanColumn) => {
    return filteredPositions.filter(pos => pos.status === columnId);
  };

  const handleSelectSuccessors = (position: Position) => {
    setSelectedPosition(position);
    setShowSuccessorModal(true);
  };

  const handleSuccessorConfirm = (data: {
    primary: string | null;
    secondary: string | null;
    tertiary: string | null;
    notes: string;
  }) => {
    if (!selectedPosition) return;

    const candidates = getCandidatesForPosition(selectedPosition.id);
    
    const getPrimaryInfo = data.primary ? {
      id: data.primary,
      name: candidates.find(c => c.id === data.primary)?.name || "",
      position: candidates.find(c => c.id === data.primary)?.currentPosition || "",
      readiness: candidates.find(c => c.id === data.primary)?.readiness || ""
    } : undefined;

    const getSecondaryInfo = data.secondary ? {
      id: data.secondary,
      name: candidates.find(c => c.id === data.secondary)?.name || "",
      position: candidates.find(c => c.id === data.secondary)?.currentPosition || "",
      readiness: candidates.find(c => c.id === data.secondary)?.readiness || ""
    } : undefined;

    const getTertiaryInfo = data.tertiary ? {
      id: data.tertiary,
      name: candidates.find(c => c.id === data.tertiary)?.name || "",
      position: candidates.find(c => c.id === data.tertiary)?.currentPosition || "",
      readiness: candidates.find(c => c.id === data.tertiary)?.readiness || ""
    } : undefined;

    setSuccessionPlans(prev => ({
      ...prev,
      [selectedPosition.id]: {
        ...prev[selectedPosition.id],
        successors: {
          primary: getPrimaryInfo,
          secondary: getSecondaryInfo,
          tertiary: getTertiaryInfo,
        },
        notes: data.notes,
        updatedAt: new Date(),
      }
    }));

    toast.success(`Successors selected for ${selectedPosition.title}`);
    setShowSuccessorModal(false);
  };

  const handleScheduleTalentDay = (position: Position) => {
    if (!successionPlans[position.id]?.successors?.primary) {
      toast.error("Please select successors first before scheduling Talent Day");
      return;
    }
    setSelectedPosition(position);
    setShowTalentDayModal(true);
  };

  const handleTalentDayConfirm = (talentDayData: any) => {
    if (!selectedPosition) return;

    setSuccessionPlans(prev => ({
      ...prev,
      [selectedPosition.id]: {
        ...prev[selectedPosition.id],
        talentDay: talentDayData,
      }
    }));

    toast.success(`Talent Day scheduled for ${selectedPosition.title}`);
    setShowTalentDayModal(false);
  };

  const handleGenerateBeritaAcara = (position: Position) => {
    if (!successionPlans[position.id]?.successors?.primary) {
      toast.error("Please select successors first before generating Berita Acara");
      return;
    }
    setSelectedPosition(position);
    setShowBeritaAcaraModal(true);
  };

  const handleDownloadBeritaAcara = () => {
    toast.success("Berita Acara downloaded successfully");
    if (selectedPosition) {
      setSuccessionPlans(prev => ({
        ...prev,
        [selectedPosition.id]: {
          ...prev[selectedPosition.id],
          beritaAcara: {
            generated: true,
            generatedAt: new Date(),
          }
        }
      }));
    }
  };

  const handlePrintBeritaAcara = () => {
    window.print();
    toast.success("Print dialog opened");
  };

  // Convert candidates to SuccessorCandidate format with competency data
  const getSuccessorCandidates = (positionId: string): SuccessorCandidate[] => {
    const candidates = getCandidatesForPosition(positionId);
    
    // Helper to determine cluster based on scores (matching TalentMapping logic)
    const getClusterId = (performance: number, capacity: number): string => {
      let p = "l";
      let c = "l";
      // Performance (0-120)
      if (performance >= 100) p = "h";
      else if (performance >= 80) p = "m";
      // Capacity (0-100)
      if (capacity >= 80) c = "h";
      else if (capacity >= 60) c = "m";
      return `${p}-${c}`;
    };

    const getClusterName = (id: string): string => {
      const map: Record<string, string> = {
        "h-h": "High Potential",
        "h-m": "Promotable",
        "h-l": "Solid Contributor",
        "m-h": "Promotable",
        "m-m": "Promotable",
        "m-l": "Solid Contributor",
        "l-h": "Sleeping Tiger",
        "l-m": "Sleeping Tiger",
        "l-l": "Unfit"
      };
      return map[id] || "Unclassified";
    };

    // Mock competency data based on guidelines (for VP HCBP position)
    const mockCompetencies = [
      // Candidate 1: Budi Santoso (80% match) - has gaps in 4 competencies
      {
        globalBusinessSavvy: 1,
        leadingChange: 2,
        drivingInnovation: 1,
        buildingPartnership: 2,
        strategicOrientation: 2,
        customerFocus: 2,
        drivingExecution: 2,
        digitalLeadership: 1,
        managingDiversity: 2,
        developingOrgCapabilities: 1,
      },
      // Candidate 2: Siti Rahayu (120% match) - exceeds in 4 competencies
      {
        globalBusinessSavvy: 2,
        leadingChange: 3,
        drivingInnovation: 2,
        buildingPartnership: 3,
        strategicOrientation: 2,
        customerFocus: 3,
        drivingExecution: 2,
        digitalLeadership: 2,
        managingDiversity: 3,
        developingOrgCapabilities: 2,
      },
      // Candidate 3: Ahmad Fauzi (115% match) - exceeds in 3 competencies
      {
        globalBusinessSavvy: 2,
        leadingChange: 2,
        drivingInnovation: 3,
        buildingPartnership: 2,
        strategicOrientation: 3,
        customerFocus: 2,
        drivingExecution: 3,
        digitalLeadership: 2,
        managingDiversity: 2,
        developingOrgCapabilities: 2,
      },
      // Candidate 4: Default competencies
      {
        globalBusinessSavvy: 2,
        leadingChange: 2,
        drivingInnovation: 2,
        buildingPartnership: 2,
        strategicOrientation: 2,
        customerFocus: 2,
        drivingExecution: 2,
        digitalLeadership: 1,
        managingDiversity: 2,
        developingOrgCapabilities: 2,
      },
      // Candidate 5: Default competencies
      {
        globalBusinessSavvy: 1,
        leadingChange: 2,
        drivingInnovation: 2,
        buildingPartnership: 2,
        strategicOrientation: 2,
        customerFocus: 2,
        drivingExecution: 2,
        digitalLeadership: 2,
        managingDiversity: 1,
        developingOrgCapabilities: 2,
      },
    ];

    return candidates.map((c, idx) => {
      // Ensure EQS data is present, otherwise use fallback logic or defaults for demo
      const hasEqs = c.eqs && c.eqs.total > 0;
      const fallbackScore = 85 + (Math.random() * 10); // Random 85-95
      
      const eqsTotal = hasEqs ? c.eqs!.total : fallbackScore;
      const perf = hasEqs ? c.eqs!.performance : (fallbackScore + 5); 
      const cap = hasEqs ? c.eqs!.competency : (fallbackScore - 5);
      
      const clusterId = getClusterId(perf, cap);
      
      return {
        id: c.id,
        name: c.name,
        employeeId: c.employeeId,
        avatar: c.avatar,
        currentPosition: c.currentPosition,
        department: c.currentDepartment,
        performanceScore: perf,
        capacityScore: cap,
        readinessScore: hasEqs ? (c.eqs!.performance || 85) : 85,
        experienceScore: c.experience.yearsInCompany * 10,
        yearsInCompany: c.experience.yearsInCompany,
        education: c.education.highest,
        keyStrengths: c.keyStrengths,
        developmentAreas: c.developmentAreas,
        eqsScore: eqsTotal,
        rank: c.rank || idx + 1,
        competencies: mockCompetencies[idx] || mockCompetencies[3],
        clusterId: clusterId,
        clusterName: getClusterName(clusterId),
      };
    });
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "critical": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set(mockPositions.map(p => p.department));
    return Array.from(depts);
  }, []);

  // Summary stats
  const stats = useMemo(() => {
    return {
      totalPositions: filteredPositions.length,
      withSuccessionPlan: filteredPositions.filter(p => p.hasSuccessionPlan).length,
      talentDayScheduled: filteredPositions.filter(p => p.talentDayScheduled).length,
      criticalVacant: filteredPositions.filter(p => p.risk === "critical" && p.status === "vacant").length,
    };
  }, [filteredPositions]);

  return (
    <Layout breadcrumbs={[
      { label: "Talent Management", href: "/talent" },
      { label: "Succession Planning" }
    ]}>
      <div className="p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1>Succession Planning Dashboard</h1>
              <p className="text-muted-foreground mt-2" style={{ fontSize: 'var(--text-sm)' }}>
                Kelola succession planning untuk posisi-posisi strategis
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>Total Positions</p>
                    <h4>{stats.totalPositions}</h4>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>With Succession Plan</p>
                    <h4>{stats.withSuccessionPlan}</h4>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <CalendarCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>Talent Day Scheduled</p>
                    <h4>{stats.talentDayScheduled}</h4>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={stats.criticalVacant > 0 ? "border-red-200 bg-red-50" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    stats.criticalVacant > 0 ? "bg-red-100" : "bg-muted"
                  }`}>
                    <AlertTriangle className={`w-5 h-5 ${stats.criticalVacant > 0 ? "text-red-600" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className={`${stats.criticalVacant > 0 ? "text-red-600" : "text-muted-foreground"}`} style={{ fontSize: 'var(--text-xs)' }}>
                      Critical Vacant
                    </p>
                    <h4 className={stats.criticalVacant > 0 ? "text-red-700" : ""}>{stats.criticalVacant}</h4>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search positions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterRisk} onValueChange={setFilterRisk}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risks</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Kanban Board */}
          <div className="grid grid-cols-4 gap-4">
            {columns.map((column) => {
              const Icon = column.icon;
              const positions = getColumnPositions(column.id);

              return (
                <div key={column.id} className="space-y-4">
                  {/* Column Header */}
                  <Card className="bg-muted">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-5 h-5 ${column.color}`} />
                          <h4>{column.title}</h4>
                        </div>
                        <Badge variant="secondary">{positions.length}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Position Cards */}
                  <ScrollArea className="h-[calc(100vh-500px)]">
                    <div className="space-y-3 pr-4">
                      {positions.map((position) => (
                        <Card
                          key={position.id}
                          className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${
                            position.hasSuccessionPlan ? "bg-green-50" : ""
                          }`}
                          style={{
                            borderLeftColor: 
                              position.risk === "critical" ? "#dc2626" :
                              position.risk === "high" ? "#ea580c" :
                              position.risk === "medium" ? "#ca8a04" :
                              "#16a34a"
                          }}
                        >
                          <CardContent className="p-4 space-y-3">
                            <div>
                              <h4 style={{ fontSize: 'var(--text-sm)' }}>{position.title}</h4>
                              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>{position.department}</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={getRiskBadgeVariant(position.risk)} style={{ fontSize: 'var(--text-xs)' }}>
                                {position.risk.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" style={{ fontSize: 'var(--text-xs)' }}>
                                {position.level}
                              </Badge>
                              {position.hasSuccessionPlan && (
                                <Badge variant="default" className="gap-1" style={{ fontSize: 'var(--text-xs)' }}>
                                  <CheckCircle2 className="w-3 h-3" />
                                  Plan Set
                                </Badge>
                              )}
                            </div>

                            {position.vacancyDate && (
                              <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                                <Calendar className="w-3 h-3" />
                                {new Date(position.vacancyDate).toLocaleDateString()}
                              </div>
                            )}

                            {position.hasSuccessionPlan && position.successors?.primary && (
                              <div className="pt-2 border-t border-border">
                                <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-xs)' }}>Primary Successor:</p>
                                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                                  {position.successors.primary.name}
                                </p>
                              </div>
                            )}

                            <div className="pt-2 border-t border-border flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                                  <Users className="w-3 h-3" />
                                  {position.candidateCount} candidates
                                </div>
                                {position.talentDayScheduled && (
                                  <Badge variant="outline" className="gap-1">
                                    <CalendarCheck className="w-3 h-3" />
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex flex-col gap-1">
                                <Button 
                                  variant={position.hasSuccessionPlan ? "outline" : "default"}
                                  size="sm"
                                  onClick={() => handleSelectSuccessors(position)}
                                  className="w-full text-xs h-8"
                                >
                                  {position.hasSuccessionPlan ? "Edit Successors" : "Select Successors"}
                                </Button>
                                
                                {position.hasSuccessionPlan && (
                                  <>
                                    <Button 
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleScheduleTalentDay(position)}
                                      className="w-full text-xs h-8 gap-1"
                                    >
                                      <Calendar className="w-3 h-3" />
                                      {position.talentDayScheduled ? "View" : "Schedule"} Talent Day
                                    </Button>
                                    
                                    <Button 
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleGenerateBeritaAcara(position)}
                                      className="w-full text-xs h-8 gap-1"
                                    >
                                      <FileText className="w-3 h-3" />
                                      {position.beritaAcaraGenerated ? "View" : "Generate"} Berita Acara
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {positions.length === 0 && (
                        <Card className="border-dashed">
                          <CardContent className="p-8 text-center">
                            <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>No positions</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Successor Selection Modal */}
      {selectedPosition && (
        <SuccessorBenchmarkPanel
          open={showSuccessorModal}
          onOpenChange={setShowSuccessorModal}
          positionTitle={selectedPosition.title}
          positionId={selectedPosition.id}
          candidates={getSuccessorCandidates(selectedPosition.id)}
          onConfirm={handleSuccessorConfirm}
        />
      )}

      {/* Talent Day Schedule Modal */}
      {selectedPosition && successionPlans[selectedPosition.id]?.successors && (
        <TalentDayScheduleModal
          open={showTalentDayModal}
          onOpenChange={setShowTalentDayModal}
          positionTitle={selectedPosition.title}
          successors={successionPlans[selectedPosition.id].successors}
          onConfirm={handleTalentDayConfirm}
        />
      )}

      {/* Berita Acara Generator */}
      {selectedPosition && successionPlans[selectedPosition.id]?.successors && (
        <BeritaAcaraGenerator
          open={showBeritaAcaraModal}
          onOpenChange={setShowBeritaAcaraModal}
          data={{
            positionTitle: selectedPosition.title,
            positionDepartment: selectedPosition.department,
            positionLevel: selectedPosition.level,
            successors: successionPlans[selectedPosition.id].successors,
            talentDay: successionPlans[selectedPosition.id].talentDay,
            decisionDate: successionPlans[selectedPosition.id].updatedAt || new Date(),
            decisionBy: "Dewi Kartika",
            notes: successionPlans[selectedPosition.id].notes,
          }}
          onDownload={handleDownloadBeritaAcara}
          onPrint={handlePrintBeritaAcara}
        />
      )}
    </Layout>
  );
}
