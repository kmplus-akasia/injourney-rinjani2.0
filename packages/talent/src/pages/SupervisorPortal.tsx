import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  FileText,
  PieChart,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import { Layout } from "../components/shell/Layout";
import {
  Button,
  DescriptionDetails,
  DescriptionList,
  DescriptionListItem,
  DescriptionTerm,
  DetailPanel,
  DetailPanelContent,
  DetailPanelDescription,
  DetailPanelFooter,
  DetailPanelHeader,
  DetailPanelTitle,
  EmptyState,
  FilterRail,
  List,
  ListItem,
  ListItemContent,
  ListItemDescription,
  ListItemMeta,
  ListItemTitle,
  PageHeader,
  SearchInput,
  SectionPanel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
  StatCardGroup,
  StatusBadge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
} from "@rinjani/shared-ui";

import {
  actionCategoryLabels,
  clusterLabels,
  eqsBandLabels,
  getActionItemsForAssignment,
  getBacklogForAssignment,
  getInsightsForAssignment,
  getMembersForAssignment,
  myTeamAssignments,
  type EqsBand,
  type MyTeamActionCategory,
  type MyTeamAssignment,
  type MyTeamMember,
  type NineBoxCell,
  type TalentCluster,
  type Urgency,
} from "../data/mockMyTeamData";
import { NINE_BOX_CELLS, type NineBoxCellId } from "../lib/talent/nineBoxClusters";

type SupervisorTab = "dashboard" | "team-profile" | "team-insights";
type RosterSort = "name" | "grade" | "eqs" | "cluster";
type BacklogSort = "newest" | "oldest" | "urgency";

const DEFAULT_TAB: SupervisorTab = "dashboard";
const DEFAULT_ASSIGNMENT_ID = myTeamAssignments.find((assignment) => assignment.is_primary)?.id ?? myTeamAssignments[0]?.id ?? "";

const actionCategoryOrder: MyTeamActionCategory[] = [
  "idp_pending_approval",
  "aspiration_pending_review",
  "assessment_pending",
  "team_members_flagged",
];

const CELL_TONE: Record<NineBoxCellId, string> = {
  "h-l": "border-blue-600 bg-blue-500 text-white",
  "h-m": "border-emerald-600 bg-emerald-500 text-white",
  "h-h": "border-emerald-700 bg-emerald-600 text-white",
  "m-l": "border-blue-600 bg-blue-500 text-white",
  "m-m": "border-emerald-600 bg-emerald-500 text-white",
  "m-h": "border-emerald-600 bg-emerald-500 text-white",
  "l-l": "border-red-600 bg-red-500 text-white",
  "l-m": "border-teal-600 bg-teal-500 text-white",
  "l-h": "border-teal-600 bg-teal-500 text-white",
};

const nineBoxMatrix: Array<{
  id: Exclude<NineBoxCell, null>;
  label: string;
  cluster: TalentCluster;
  performance: "High" | "Medium" | "Low";
  capacity: "Low" | "Medium" | "High";
  toneClasses: string;
}> = NINE_BOX_CELLS.map((cell) => ({
  id: cell.id,
  label: cell.name,
  cluster: cell.talentClusterSlug,
  performance: cell.performance,
  capacity: cell.potential,
  toneClasses: CELL_TONE[cell.id],
}));

function isValidTab(value: string | null): value is SupervisorTab {
  return value === "dashboard" || value === "team-profile" || value === "team-insights";
}

function formatShortDate(value: string | null | undefined) {
  if (!value) {
    return "Belum tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatRelativeDate(value: string | null | undefined) {
  if (!value) {
    return "Tanpa tanggal";
  }

  const diff = Date.now() - new Date(value).getTime();
  const days = Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));

  if (days < 30) {
    return `${days} hari lalu`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} bulan lalu`;
  }

  return formatShortDate(value);
}

function getAssignmentBadgeVariant(assignment: MyTeamAssignment) {
  if (assignment.assignment_type === "definitif") return "info";
  if (assignment.assignment_type === "project_assignment") return "warning";
  return "success";
}

function getUrgencyVariant(urgency: Urgency) {
  if (urgency === "high") return "destructive";
  if (urgency === "medium") return "warning";
  return "neutral";
}

function getClusterVariant(cluster: TalentCluster) {
  switch (cluster) {
    case "9box_high_potential":
      return "success";
    case "9box_promotable":
      return "info";
    case "9box_solid_contributor":
      return "neutral";
    case "9box_sleeping_tiger":
      return "warning";
    case "9box_unfit":
      return "destructive";
    default:
      return "neutral";
  }
}

function getBandVariant(band: EqsBand) {
  switch (band) {
    case "highly_qualified":
      return "success";
    case "qualified":
      return "info";
    case "needs_development":
      return "warning";
    case "not_recommended":
      return "destructive";
    default:
      return "neutral";
  }
}

function getRiskVariant(risk: MyTeamMember["risk_profile"]) {
  if (risk === "flight_risk") return "warning";
  if (risk === "high_risk") return "destructive";
  if (risk === "medium_risk") return "warning";
  if (risk === "low_risk") return "success";
  return "neutral";
}

function getTrendLabel(value: number) {
  if (value > 0) return `+${value} vs periode lalu`;
  if (value < 0) return `${value} vs periode lalu`;
  return "Stabil";
}

function getBacklogTypeLabel(type: MyTeamActionCategory) {
  switch (type) {
    case "idp_pending_approval":
      return "IDP";
    case "aspiration_pending_review":
      return "Aspirasi";
    case "assessment_pending":
      return "Assessment";
    case "team_members_flagged":
      return "Flag";
    default:
      return type;
  }
}

export default function SupervisorPortal() {
  const [searchParams] = useSearchParams();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(DEFAULT_ASSIGNMENT_ID);
  const [activeTab, setActiveTab] = useState<SupervisorTab>(DEFAULT_TAB);
  const [activeActionCategory, setActiveActionCategory] = useState<MyTeamActionCategory>("idp_pending_approval");
  const [rosterSearch, setRosterSearch] = useState("");
  const [rosterSort, setRosterSort] = useState<RosterSort>("name");
  const [selectedNineBoxCell, setSelectedNineBoxCell] = useState<NineBoxCell>(null);
  const [eqsFilter, setEqsFilter] = useState<EqsBand>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [backlogTypeFilter, setBacklogTypeFilter] = useState<"all" | MyTeamActionCategory>("all");
  const [backlogSort, setBacklogSort] = useState<BacklogSort>("newest");

  useEffect(() => {
    const assignmentParam = searchParams.get("assignment");
    if (assignmentParam && myTeamAssignments.some((assignment) => assignment.id === assignmentParam)) {
      setSelectedAssignmentId(assignmentParam);
    }

    const tabParam = searchParams.get("tab");
    if (isValidTab(tabParam)) {
      setActiveTab(tabParam);
    }

    const employeeParam = searchParams.get("employee");
    if (employeeParam) {
      setSelectedEmployeeId(employeeParam);
    }
  }, [searchParams]);

  const selectedAssignment = useMemo(
    () => myTeamAssignments.find((assignment) => assignment.id === selectedAssignmentId) ?? myTeamAssignments[0],
    [selectedAssignmentId],
  );

  const members = useMemo(() => getMembersForAssignment(selectedAssignment.id), [selectedAssignment.id]);
  const actionItems = useMemo(() => getActionItemsForAssignment(selectedAssignment.id), [selectedAssignment.id]);
  const backlogItems = useMemo(() => getBacklogForAssignment(selectedAssignment.id), [selectedAssignment.id]);
  const insights = useMemo(() => getInsightsForAssignment(selectedAssignment.id), [selectedAssignment.id]);

  const actionCounts = useMemo(
    () =>
      Object.fromEntries(actionCategoryOrder.map((category) => [category, actionItems[category].length])) as Record<
        MyTeamActionCategory,
        number
      >,
    [actionItems],
  );

  useEffect(() => {
    if (actionCounts[activeActionCategory] > 0) {
      return;
    }

    const nextCategory = actionCategoryOrder.find((category) => actionCounts[category] > 0) ?? "idp_pending_approval";
    setActiveActionCategory(nextCategory);
  }, [activeActionCategory, actionCounts]);

  const totalActions = actionCategoryOrder.reduce((total, category) => total + actionCounts[category], 0);

  const filteredBacklog = useMemo(() => {
    const scoped = backlogItems.filter((item) => backlogTypeFilter === "all" || item.type === backlogTypeFilter);

    return [...scoped].sort((left, right) => {
      if (backlogSort === "urgency") {
        const priority: Record<Urgency, number> = { high: 0, medium: 1, normal: 2 };
        return priority[left.urgency] - priority[right.urgency];
      }

      const leftValue = new Date(left.created_at).getTime();
      const rightValue = new Date(right.created_at).getTime();
      return backlogSort === "oldest" ? leftValue - rightValue : rightValue - leftValue;
    });
  }, [backlogItems, backlogSort, backlogTypeFilter]);

  const filteredMembers = useMemo(() => {
    const search = rosterSearch.toLowerCase();
    const scoped = members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(search) ||
        member.nik.toLowerCase().includes(search) ||
        member.position_title.toLowerCase().includes(search);

      return matchesSearch;
    });

    return [...scoped].sort((left, right) => {
      if (rosterSort === "grade") return right.grade_jabatan - left.grade_jabatan;
      if (rosterSort === "eqs") return (right.eqs_score ?? -1) - (left.eqs_score ?? -1);
      if (rosterSort === "cluster") return (clusterLabels[left.talent_cluster ?? "9box_solid_contributor"] ?? "").localeCompare(clusterLabels[right.talent_cluster ?? "9box_solid_contributor"] ?? "");
      return left.name.localeCompare(right.name);
    });
  }, [members, rosterSearch, rosterSort]);

  useEffect(() => {
    if (filteredMembers.length === 0) {
      setSelectedEmployeeId(null);
      return;
    }

    if (!selectedEmployeeId || !members.some((member) => member.employee_id === selectedEmployeeId)) {
      setSelectedEmployeeId(filteredMembers[0].employee_id);
    }
  }, [filteredMembers, members, selectedEmployeeId]);

  const selectedMember = useMemo(
    () => members.find((member) => member.employee_id === selectedEmployeeId) ?? filteredMembers[0] ?? null,
    [filteredMembers, members, selectedEmployeeId],
  );

  const activeActionItems = actionItems[activeActionCategory];
  const flaggedCount = members.filter((member) => member.is_flagged).length;
  const nineBoxCellsWithCounts = useMemo(
    () =>
      nineBoxMatrix.map((cell) => ({
        ...cell,
        count: members.filter((member) => member.nine_box_cell === cell.id).length,
      })),
    [members],
  );
  const selectedNineBoxMeta = useMemo(
    () => nineBoxMatrix.find((cell) => cell.id === selectedNineBoxCell) ?? null,
    [selectedNineBoxCell],
  );
  const selectedNineBoxMembers = useMemo(
    () => (selectedNineBoxCell ? members.filter((member) => member.nine_box_cell === selectedNineBoxCell) : []),
    [members, selectedNineBoxCell],
  );
  const scoredMembers = useMemo(
    () =>
      [...members]
        .filter((member) => member.eqs_score !== null)
        .sort((left, right) => (right.eqs_score ?? 0) - (left.eqs_score ?? 0)),
    [members],
  );
  const displayedEqsMembers = useMemo(
    () => (eqsFilter ? scoredMembers.filter((member) => member.eqs_band === eqsFilter) : scoredMembers),
    [eqsFilter, scoredMembers],
  );

  return (
    <Layout
      breadcrumbs={[
        { label: "My Talent Journey", href: "/talent" },
        { label: "My Team" },
      ]}
    >
      <div className="min-h-screen bg-muted/50">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <PageHeader
            variant="workspace"
            eyebrow="My Talent Journey"
            title="My Team"
            description="Ringkasan action items, profil tim, dan insight talent berdasarkan konteks posisi yang Anda pimpin."
            badge={<StatusBadge variant={getAssignmentBadgeVariant(selectedAssignment)}>{selectedAssignment.label}</StatusBadge>}
            actions={
              <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                {myTeamAssignments.length > 1 ? (
                  <Select value={selectedAssignment.id} onValueChange={setSelectedAssignmentId}>
                    <SelectTrigger className="w-full min-w-[18rem] md:w-[22rem]" size="sm">
                      <SelectValue placeholder="Pilih konteks posisi" />
                    </SelectTrigger>
                    <SelectContent>
                      {myTeamAssignments.map((assignment) => (
                        <SelectItem key={assignment.id} value={assignment.id}>
                          {assignment.position_title} • {assignment.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
                <Button asChild variant="outline">
                  <Link to="/talent/talent-review">
                    <Sparkles className="size-4" />
                    Open Talent Review
                  </Link>
                </Button>
              </div>
            }
          />

          <StatCardGroup>
            <button type="button" className="text-left" onClick={() => { setActiveTab("dashboard"); setActiveActionCategory("idp_pending_approval"); }}>
              <StatCard
                label="IDP Pending Approval"
                value={actionCounts.idp_pending_approval}
                description="IDP bawahan yang menunggu tindakan Anda."
                icon={<ClipboardCheck className="size-6" />}
                tone={actionCounts.idp_pending_approval > 0 ? "warning" : "neutral"}
              />
            </button>
            <button type="button" className="text-left" onClick={() => { setActiveTab("dashboard"); setActiveActionCategory("aspiration_pending_review"); }}>
              <StatCard
                label="Aspiration Pending Review"
                value={actionCounts.aspiration_pending_review}
                description="Aspirasi yang masih perlu ditinjau di Team Aspiration."
                icon={<Target className="size-6" />}
                tone={actionCounts.aspiration_pending_review > 0 ? "info" : "neutral"}
              />
            </button>
            <button type="button" className="text-left" onClick={() => { setActiveTab("dashboard"); setActiveActionCategory("assessment_pending"); }}>
              <StatCard
                label="360 Assessment Pending"
                value={actionCounts.assessment_pending}
                description="Penugasan assessor yang masih aktif untuk tim Anda."
                icon={<PieChart className="size-6" />}
                tone={actionCounts.assessment_pending > 0 ? "info" : "neutral"}
              />
            </button>
            <button type="button" className="text-left" onClick={() => { setActiveTab("dashboard"); setActiveActionCategory("team_members_flagged"); }}>
              <StatCard
                label="Team Members Flagged"
                value={actionCounts.team_members_flagged}
                description="Bawahan yang membutuhkan perhatian segera."
                icon={<ShieldAlert className="size-6" />}
                tone={actionCounts.team_members_flagged > 0 ? "destructive" : "neutral"}
              />
            </button>
          </StatCardGroup>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SupervisorTab)}>
            <FilterRail
              title="Workspace"
              description={`${selectedAssignment.position_title} • ${members.length} direct report${members.length === 1 ? "" : "s"}`}
            >
              <TabsList className="h-auto flex-wrap justify-start gap-2 rounded-2xl bg-muted/80 p-1">
                <TabsTrigger value="dashboard" className="rounded-xl px-4 py-2">
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="team-profile" className="rounded-xl px-4 py-2">
                  Team Profile
                </TabsTrigger>
                <TabsTrigger value="team-insights" className="rounded-xl px-4 py-2">
                  Team Insights
                </TabsTrigger>
              </TabsList>
            </FilterRail>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                <SectionPanel
                  title="Action Required"
                  description="Klik kartu untuk melihat daftar detail dan buka modul terkait dari item yang dipilih."
                  actions={<StatusBadge variant={totalActions > 0 ? "warning" : "success"}>{totalActions} open item{totalActions === 1 ? "" : "s"}</StatusBadge>}
                >
                  {totalActions === 0 ? (
                    <EmptyState title="Tidak ada action item yang tertunda" description="Seluruh action item tim pada konteks posisi ini sudah tertangani." />
                  ) : (
                    <div className="space-y-5">
                      <div className="flex flex-wrap gap-2">
                        {actionCategoryOrder.map((category) => (
                          <Button
                            key={category}
                            type="button"
                            size="sm"
                            variant={activeActionCategory === category ? "primary" : "outline"}
                            onClick={() => setActiveActionCategory(category)}
                          >
                            {actionCategoryLabels[category]}
                            <StatusBadge className="ml-1" variant={actionCounts[category] > 0 ? getUrgencyVariant(category === "team_members_flagged" ? "high" : "normal") : "neutral"}>
                              {actionCounts[category]}
                            </StatusBadge>
                          </Button>
                        ))}
                      </div>

                      {activeActionItems.length === 0 ? (
                        <EmptyState
                          title={`Tidak ada item untuk ${actionCategoryLabels[activeActionCategory]}`}
                          description="Kategori ini kosong pada konteks posisi yang sedang dipilih."
                        />
                      ) : (
                        <List className="rounded-2xl border-border/80 shadow-none">
                          {activeActionItems.map((item) => (
                            <ListItem key={item.id} className="items-center gap-4">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                {activeActionCategory === "idp_pending_approval" ? (
                                  <ClipboardCheck className="size-5" />
                                ) : activeActionCategory === "aspiration_pending_review" ? (
                                  <Target className="size-5" />
                                ) : activeActionCategory === "assessment_pending" ? (
                                  <PieChart className="size-5" />
                                ) : (
                                  <ShieldAlert className="size-5" />
                                )}
                              </div>
                              <ListItemContent>
                                <ListItemTitle>{item.employee_name}</ListItemTitle>
                                <ListItemDescription>{item.description}</ListItemDescription>
                              </ListItemContent>
                              <ListItemMeta className="flex min-w-[7.5rem] flex-col items-end gap-2 text-right">
                                <StatusBadge variant={getUrgencyVariant(item.urgency)}>{item.urgency}</StatusBadge>
                                <span>{formatRelativeDate(item.deadline ?? item.submitted_at)}</span>
                                <Button asChild size="sm" variant="ghost">
                                  <Link to={item.deep_link}>
                                    Buka
                                    <ArrowUpRight className="size-4" />
                                  </Link>
                                </Button>
                              </ListItemMeta>
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </div>
                  )}
                </SectionPanel>

                <SectionPanel
                  title="Quick Links"
                  description="Akses modul operasional tanpa keluar dari konteks line manager."
                >
                  <div className="grid gap-3">
                    <Link to="/talent/idp" className="rounded-2xl border border-border bg-muted/40 p-4 transition-colors hover:bg-muted">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <ClipboardCheck className="size-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">Development Plan</p>
                          <p className="text-sm leading-6 text-muted-foreground">Review IDP aktif, approval queue, dan progress pengembangan tim.</p>
                        </div>
                      </div>
                    </Link>
                    <Link to="/talent/career-aspiration" className="rounded-2xl border border-border bg-muted/40 p-4 transition-colors hover:bg-muted">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Target className="size-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">Career Aspiration</p>
                          <p className="text-sm leading-6 text-muted-foreground">Lanjutkan review aspirasi tim dari ringkasan action items yang tampil di sini.</p>
                        </div>
                      </div>
                    </Link>
                    <Link to="/talent/360-assessment" className="rounded-2xl border border-border bg-muted/40 p-4 transition-colors hover:bg-muted">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <PieChart className="size-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">360 Assessment</p>
                          <p className="text-sm leading-6 text-muted-foreground">Isi penilaian yang ditugaskan dan cek hasil assessment terbaru tim.</p>
                        </div>
                      </div>
                    </Link>
                    <Link to="/talent/talent-review" className="rounded-2xl border border-border bg-muted/40 p-4 transition-colors hover:bg-muted">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <FileText className="size-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">Talent Review</p>
                          <p className="text-sm leading-6 text-muted-foreground">Buka workspace talent review untuk usulan, shortlist, dan periodic review.</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </SectionPanel>
              </div>

              <SectionPanel
                title="Backlog"
                description="Daftar kronologis seluruh outstanding item pada konteks posisi yang sedang dipilih."
                contentClassName="space-y-5 pt-4"
              >
                <FilterRail className="border-none bg-muted/40 px-0 py-0 shadow-none" actionsClassName="w-full">
                  <div className="flex flex-1 flex-wrap gap-3">
                    <Select value={backlogTypeFilter} onValueChange={(value) => setBacklogTypeFilter(value as "all" | MyTeamActionCategory)}>
                      <SelectTrigger className="w-full md:w-56" size="sm">
                        <SelectValue placeholder="Filter backlog" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Tipe</SelectItem>
                        {actionCategoryOrder.map((category) => (
                          <SelectItem key={category} value={category}>
                            {actionCategoryLabels[category]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={backlogSort} onValueChange={(value) => setBacklogSort(value as BacklogSort)}>
                      <SelectTrigger className="w-full md:w-52" size="sm">
                        <SelectValue placeholder="Sort backlog" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Terbaru</SelectItem>
                        <SelectItem value="oldest">Terlama</SelectItem>
                        <SelectItem value="urgency">Urgency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </FilterRail>

                {filteredBacklog.length === 0 ? (
                  <EmptyState title="Tidak ada item backlog yang sesuai filter" description="Ubah filter backlog untuk menampilkan item lain pada konteks posisi ini." />
                ) : (
                  <List className="rounded-2xl border-border/80 shadow-none">
                    {filteredBacklog.map((item) => (
                      <ListItem key={item.id} className="items-center gap-4">
                        <StatusBadge variant={getUrgencyVariant(item.urgency)}>{getBacklogTypeLabel(item.type)}</StatusBadge>
                        <ListItemContent>
                          <ListItemTitle>{item.employee_name}</ListItemTitle>
                          <ListItemDescription>{item.description}</ListItemDescription>
                        </ListItemContent>
                        <ListItemMeta className="flex min-w-[10rem] flex-col items-end gap-1 text-right">
                          <span>{formatRelativeDate(item.created_at)}</span>
                          {item.deadline ? <span className={cn("font-medium", new Date(item.deadline) < new Date() ? "text-destructive" : "")}>Deadline {formatShortDate(item.deadline)}</span> : null}
                          <Button asChild size="sm" variant="ghost">
                            <Link to={item.deep_link}>
                              Buka
                              <ArrowUpRight className="size-4" />
                            </Link>
                          </Button>
                        </ListItemMeta>
                      </ListItem>
                    ))}
                  </List>
                )}
              </SectionPanel>
            </TabsContent>

            <TabsContent value="team-profile" className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <SectionPanel
                  title="Team Profile"
                  description="Cari anggota tim, urutkan roster, lalu buka detail profil untuk melihat status talent terkini."
                  contentClassName="space-y-6 pt-4"
                >
                  <FilterRail className="border-none bg-muted/40 px-0 py-0 shadow-none" actionsClassName="w-full">
                    <SearchInput
                      aria-label="Cari anggota tim"
                      className="w-full md:min-w-[18rem] md:flex-1"
                      placeholder="Cari nama, NIK, atau jabatan..."
                      value={rosterSearch}
                      onChange={(event) => setRosterSearch(event.target.value)}
                      onClear={() => setRosterSearch("")}
                    />
                    <Select value={rosterSort} onValueChange={(value) => setRosterSort(value as RosterSort)}>
                      <SelectTrigger className="w-full md:w-52" size="sm">
                        <SelectValue placeholder="Urutkan roster" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Nama</SelectItem>
                        <SelectItem value="grade">Grade</SelectItem>
                        <SelectItem value="eqs">EQS Score</SelectItem>
                        <SelectItem value="cluster">9-Box Cluster</SelectItem>
                      </SelectContent>
                    </Select>
                  </FilterRail>

                  {filteredMembers.length === 0 ? (
                    <EmptyState
                      title="Tidak ada anggota tim yang sesuai"
                      description="Coba ubah kata kunci pencarian untuk menampilkan anggota tim lain."
                      action={
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setRosterSearch("");
                          }}
                        >
                          Reset Search
                        </Button>
                      }
                    />
                  ) : (
                    <List className="rounded-2xl border-border/80 shadow-none">
                      {filteredMembers.map((member) => (
                        <ListItem key={member.employee_id} className="items-center gap-4">
                          <button
                            type="button"
                            className={cn(
                              "flex flex-1 items-center gap-4 rounded-2xl px-1 py-1 text-left transition-colors",
                              selectedMember?.employee_id === member.employee_id ? "bg-primary/5" : "",
                            )}
                            onClick={() => setSelectedEmployeeId(member.employee_id)}
                          >
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                              <Users className="size-5" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-foreground">{member.name}</p>
                                {member.talent_cluster ? <StatusBadge variant={getClusterVariant(member.talent_cluster)}>{clusterLabels[member.talent_cluster]}</StatusBadge> : <StatusBadge variant="neutral">Belum tersedia</StatusBadge>}
                                {member.eqs_band ? <StatusBadge variant={getBandVariant(member.eqs_band)}>{eqsBandLabels[member.eqs_band]}</StatusBadge> : null}
                              </div>
                              <p className="text-sm leading-6 text-muted-foreground">{member.position_title} • Grade {member.grade_jabatan} / {member.band_jabatan}</p>
                            </div>
                          </button>
                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <p className="text-sm font-semibold text-foreground">{member.eqs_score !== null ? member.eqs_score.toFixed(2) : "N/A"}</p>
                            {member.risk_profile ? <StatusBadge variant={getRiskVariant(member.risk_profile)}>{member.risk_profile.replace("_", " ")}</StatusBadge> : null}
                          </div>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </SectionPanel>

                <DetailPanel className="sticky top-6 self-start rounded-[24px] border-border/80">
                  {selectedMember ? (
                    <>
                      <DetailPanelHeader>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <DetailPanelTitle className="text-xl">{selectedMember.name}</DetailPanelTitle>
                            <DetailPanelDescription>{selectedMember.position_title}</DetailPanelDescription>
                          </div>
                          <StatusBadge variant={selectedMember.is_flagged ? "destructive" : "success"}>
                            {selectedMember.is_flagged ? "Needs attention" : "Stable"}
                          </StatusBadge>
                        </div>
                      </DetailPanelHeader>

                      <DetailPanelContent className="gap-5">
                        <div className="rounded-2xl border border-border bg-muted/25 p-4">
                          <p className="text-sm font-semibold text-foreground">Profile Summary</p>
                          <DescriptionList className="mt-3 gap-3">
                            <DescriptionListItem>
                              <DescriptionTerm>NIK</DescriptionTerm>
                              <DescriptionDetails>{selectedMember.nik}</DescriptionDetails>
                            </DescriptionListItem>
                            <DescriptionListItem>
                              <DescriptionTerm>Grade / Band</DescriptionTerm>
                              <DescriptionDetails>
                                Grade {selectedMember.grade_jabatan} / {selectedMember.band_jabatan}
                              </DescriptionDetails>
                            </DescriptionListItem>
                            <DescriptionListItem>
                              <DescriptionTerm>Unit</DescriptionTerm>
                              <DescriptionDetails>{selectedMember.organization_name}</DescriptionDetails>
                            </DescriptionListItem>
                            <DescriptionListItem>
                              <DescriptionTerm>Hire Date</DescriptionTerm>
                              <DescriptionDetails>{formatShortDate(selectedMember.hire_date)}</DescriptionDetails>
                            </DescriptionListItem>
                          </DescriptionList>
                        </div>

                        <div className="rounded-2xl border border-border bg-muted/25 p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {selectedMember.talent_cluster ? <StatusBadge variant={getClusterVariant(selectedMember.talent_cluster)}>{clusterLabels[selectedMember.talent_cluster]}</StatusBadge> : <StatusBadge variant="neutral">9-box belum tersedia</StatusBadge>}
                            {selectedMember.eqs_band ? <StatusBadge variant={getBandVariant(selectedMember.eqs_band)}>{eqsBandLabels[selectedMember.eqs_band]}</StatusBadge> : <StatusBadge variant="neutral">EQS belum dihitung</StatusBadge>}
                            {selectedMember.risk_profile ? <StatusBadge variant={getRiskVariant(selectedMember.risk_profile)}>{selectedMember.risk_profile.replace("_", " ")}</StatusBadge> : null}
                          </div>
                          <div className="mt-4 flex items-end justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-foreground">EQS Score</p>
                              <p className="text-3xl font-bold tracking-tight text-foreground">{selectedMember.eqs_score !== null ? selectedMember.eqs_score.toFixed(2) : "N/A"}</p>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              <p>Talent Pool {selectedMember.talent_pool_status ?? "Belum tersedia"}</p>
                              <p>{selectedMember.company_name}</p>
                            </div>
                          </div>
                          <div className="mt-4 grid gap-2">
                            {selectedMember.eqs_components.length > 0 ? (
                              selectedMember.eqs_components.map((component) => (
                                <div key={component.component_type} className="rounded-2xl border border-border bg-card px-3 py-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-foreground">{component.component_type === "tes" ? "TES" : component.component_type.charAt(0).toUpperCase() + component.component_type.slice(1)}</span>
                                    <span className="text-muted-foreground">{component.weighted_value.toFixed(2)}</span>
                                  </div>
                                  <p className="mt-1 text-xs text-muted-foreground">Raw score {component.raw_value.toFixed(1)} • bobot {component.weight}%</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">Breakdown EQS belum tersedia untuk bawahan ini.</p>
                            )}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-muted/25 p-4">
                          <p className="text-sm font-semibold text-foreground">Career Aspiration</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {selectedMember.aspirations.has_aspiration
                              ? `${selectedMember.aspirations.total_aspirations} aspirasi dari seluruh sumber, ${selectedMember.aspirations.pending_review_count} pending review.`
                              : "Belum ada aspirasi yang tercatat."}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-border bg-muted/25 p-4">
                          <p className="text-sm font-semibold text-foreground">Development Plan</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Status {selectedMember.idp.status.replace("_", " ")} • {selectedMember.idp.completed_hours}/{selectedMember.idp.total_hours} jam terselesaikan • {selectedMember.idp.completed_activities}/{selectedMember.idp.activity_count} aktivitas selesai.
                          </p>
                        </div>

                        <div className="rounded-2xl border border-border bg-muted/25 p-4">
                          <p className="text-sm font-semibold text-foreground">360 Assessment</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {selectedMember.latest_assessment
                              ? `${selectedMember.latest_assessment.cycle_name} • ${selectedMember.latest_assessment.overall_score.toFixed(1)}/${selectedMember.latest_assessment.overall_max_score}`
                              : "Belum ada hasil 360 Assessment yang dipublikasikan."}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-border bg-muted/25 p-4">
                          <p className="text-sm font-semibold text-foreground">Job Applications</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {selectedMember.applications.length > 0
                              ? `${selectedMember.applications.length} aplikasi aktif, status terbaru ${selectedMember.applications[0].status}.`
                              : "Tidak ada aplikasi Job Tender aktif."}
                          </p>
                        </div>
                      </DetailPanelContent>

                      <DetailPanelFooter>
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/talent/career-aspiration?employee=${selectedMember.employee_id}`}>Lihat Aspiration</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/talent/idp?employee=${selectedMember.employee_id}`}>Lihat IDP</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/talent/360-assessment?employee=${selectedMember.employee_id}`}>Lihat 360 Assessment</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/talent/explore?employee=${selectedMember.employee_id}`}>Lihat Job Tender</Link>
                        </Button>
                      </DetailPanelFooter>
                    </>
                  ) : (
                    <EmptyState title="Pilih anggota tim" description="Klik salah satu anggota pada roster untuk membuka detail profil talent." />
                  )}
                </DetailPanel>
              </div>
            </TabsContent>

            <TabsContent value="team-insights" className="space-y-6">
              <StatCardGroup>
                <StatCard
                  label="Total Subordinates"
                  value={insights.total_subordinates}
                  description="Jumlah direct report dalam konteks posisi yang dipilih."
                  icon={<Users className="size-6" />}
                  tone="info"
                />
                <StatCard
                  label="Average EQS"
                  value={insights.eqs_distribution.average_score.toFixed(2)}
                  description={`${insights.eqs_distribution.calculated_count} anggota sudah memiliki EQS score.`}
                  icon={<TrendingUp className="size-6" />}
                  tone="neutral"
                />
                <StatCard
                  label="IDP Completion"
                  value={`${insights.idp_completion.completion_rate}%`}
                  description={`${insights.idp_completion.by_status.approved} IDP approved dari ${insights.idp_completion.total_subordinates} anggota tim.`}
                  icon={<ClipboardCheck className="size-6" />}
                  tone="success"
                />
                <StatCard
                  label="Aspiration Coverage"
                  value={`${insights.aspiration_coverage.coverage_rate}%`}
                  description={`${insights.aspiration_coverage.with_aspiration} anggota sudah memiliki aspirasi.`}
                  icon={<Target className="size-6" />}
                  tone="info"
                />
              </StatCardGroup>

              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <SectionPanel title="9-Box Distribution" description="Matrix mengikuti mapping dan palette dari Talent Classification. Klik box untuk melihat anggota di cell tersebut.">
                  <div className="space-y-5">
                    <div className="overflow-x-auto">
                      <div className="min-w-[52rem]">
                        <div className="mb-3 grid grid-cols-[6rem_repeat(3,minmax(0,1fr))] gap-3">
                          <div />
                          <div className="rounded-xl bg-muted px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Potential Low</div>
                          <div className="rounded-xl bg-muted px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Potential Medium</div>
                          <div className="rounded-xl bg-muted px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Potential High</div>
                        </div>
                        <div className="grid gap-3">
                          {(["High", "Medium", "Low"] as const).map((performance) => (
                            <div key={performance} className="grid grid-cols-[6rem_repeat(3,minmax(0,1fr))] gap-3">
                              <div className="flex items-center justify-center rounded-2xl bg-muted px-3 py-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                Performance {performance}
                              </div>
                              {nineBoxCellsWithCounts
                                .filter((cell) => cell.performance === performance)
                                .map((cell) => {
                                  const isActive = selectedNineBoxCell === cell.id;
                                  return (
                                    <button
                                      key={cell.id}
                                      type="button"
                                      className={cn(
                                        "flex min-h-[9.5rem] flex-col justify-between rounded-[24px] border p-4 text-left shadow-sm transition-transform hover:-translate-y-0.5",
                                        cell.toneClasses,
                                        isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                                      )}
                                      onClick={() => setSelectedNineBoxCell((current) => (current === cell.id ? null : cell.id))}
                                    >
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">{cell.id.toUpperCase()}</span>
                                          <span className="rounded-full border border-white/30 px-2 py-0.5 text-xs font-semibold text-white/90">{cell.count}</span>
                                        </div>
                                        <p className="text-base font-semibold leading-tight">{cell.label}</p>
                                        <p className="text-sm leading-5 text-white/80">{cell.capacity} potential • {cell.performance} performance</p>
                                      </div>
                                      <p className="text-xs text-white/75">{clusterLabels[cell.cluster as Exclude<TalentCluster, null>]}</p>
                                    </button>
                                  );
                                })}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                      {Object.entries(insights.nine_box_distribution.distribution).map(([cluster, count]) => (
                        <div key={cluster} className="rounded-2xl border border-border bg-muted/25 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{clusterLabels[cluster as Exclude<TalentCluster, null>]}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{getTrendLabel(insights.nine_box_distribution.trend_vs_previous[cluster as Exclude<TalentCluster, null>])}</p>
                            </div>
                            <StatusBadge variant={getClusterVariant(cluster as TalentCluster)}>{count}</StatusBadge>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedNineBoxMeta ? (
                      <div className="rounded-2xl border border-border bg-muted/25 p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {selectedNineBoxMeta.label} • Cell {selectedNineBoxMeta.id.toUpperCase()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {selectedNineBoxMeta.performance} performance dan {selectedNineBoxMeta.capacity} potential.
                            </p>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedNineBoxCell(null)}>
                            Reset Cell
                          </Button>
                        </div>
                        {selectedNineBoxMembers.length === 0 ? (
                          <EmptyState title="Tidak ada anggota pada cell ini" description="Cell yang dipilih belum memiliki anggota tim pada konteks posisi ini." />
                        ) : (
                          <List className="rounded-2xl border-border/80 shadow-none">
                            {selectedNineBoxMembers.map((member) => (
                              <ListItem key={member.employee_id} className="items-center gap-4">
                                <ListItemContent>
                                  <ListItemTitle>{member.name}</ListItemTitle>
                                  <ListItemDescription>{member.position_title}</ListItemDescription>
                                </ListItemContent>
                                <ListItemMeta className="flex min-w-[10rem] flex-col items-end gap-2">
                                  {member.eqs_band ? <StatusBadge variant={getBandVariant(member.eqs_band)}>{eqsBandLabels[member.eqs_band]}</StatusBadge> : null}
                                  <span>{member.eqs_score !== null ? member.eqs_score.toFixed(2) : "EQS belum tersedia"}</span>
                                </ListItemMeta>
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </div>
                    ) : null}

                    {insights.nine_box_distribution.unclassified_count > 0 ? (
                      <p className="text-sm text-muted-foreground">{insights.nine_box_distribution.unclassified_count} anggota tim belum memiliki klasifikasi 9-box.</p>
                    ) : null}
                  </div>
                </SectionPanel>

                <SectionPanel title="Team Signals" description="Ringkasan metrik readiness dan risiko tim.">
                  <div className="grid gap-4">
                    <div className="rounded-2xl border border-border bg-muted/25 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">EQS Range</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Tertinggi {insights.eqs_distribution.max_score ? `${insights.eqs_distribution.max_score.employee_name} (${insights.eqs_distribution.max_score.value.toFixed(2)})` : "N/A"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Terendah {insights.eqs_distribution.min_score ? `${insights.eqs_distribution.min_score.employee_name} (${insights.eqs_distribution.min_score.value.toFixed(2)})` : "N/A"}
                          </p>
                        </div>
                        <BarChart3 className="size-8 text-primary" />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-muted/25 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Development Hours</p>
                          <p className="mt-1 text-sm text-muted-foreground">Rata-rata jam planned {insights.idp_completion.average_hours_planned}</p>
                          <p className="text-sm text-muted-foreground">Rata-rata jam completed {insights.idp_completion.average_hours_completed}</p>
                        </div>
                        <CalendarDays className="size-8 text-primary" />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-muted/25 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Flagged Members</p>
                          <p className="mt-1 text-sm text-muted-foreground">{flaggedCount} anggota tim butuh perhatian aktif.</p>
                          <p className="text-sm text-muted-foreground">{insights.aspiration_coverage.pending_review} aspiration item masih pending review.</p>
                        </div>
                        <ShieldAlert className="size-8 text-destructive" />
                      </div>
                    </div>
                  </div>
                </SectionPanel>
              </div>

              <SectionPanel title="EQS Distribution" description="Distribusi band EQS sekaligus daftar nama bawahan dan skor masing-masing.">
                <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-3">
                    {Object.entries(insights.eqs_distribution.by_band).map(([band, value]) => (
                      <button
                        key={band}
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-colors",
                          eqsFilter === band ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-muted/25 hover:bg-muted/40",
                        )}
                        onClick={() => setEqsFilter((current) => (current === band ? null : (band as EqsBand)))}
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">{eqsBandLabels[band as Exclude<EqsBand, null>]}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{value.percentage}% coverage dari anggota yang sudah dihitung</p>
                        </div>
                        <StatusBadge variant={getBandVariant(band as EqsBand)}>{value.count}</StatusBadge>
                      </button>
                    ))}
                    <div className="rounded-2xl border border-dashed border-border bg-muted/15 px-4 py-4">
                      <p className="text-sm font-semibold text-foreground">Belum Dihitung</p>
                      <p className="mt-1 text-xs text-muted-foreground">{insights.eqs_distribution.not_calculated_count} anggota tim belum memiliki EQS score.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {eqsFilter ? `Daftar ${eqsBandLabels[eqsFilter]}` : "Daftar Skor EQS Tim"}
                        </p>
                        <p className="text-sm text-muted-foreground">Skor ditampilkan per bawahan agar tidak hanya berhenti di kategorisasi band.</p>
                      </div>
                      {eqsFilter ? (
                        <Button type="button" variant="ghost" size="sm" onClick={() => setEqsFilter(null)}>
                          Reset Band
                        </Button>
                      ) : null}
                    </div>

                    {displayedEqsMembers.length === 0 ? (
                      <EmptyState title="Tidak ada anggota pada band ini" description="Pilih band EQS lain atau reset filter untuk melihat seluruh skor." />
                    ) : (
                      <List className="rounded-2xl border-border/80 shadow-none">
                        {displayedEqsMembers.map((member) => (
                          <ListItem key={member.employee_id} className="items-center gap-4">
                            <ListItemContent>
                              <ListItemTitle>{member.name}</ListItemTitle>
                              <ListItemDescription>{member.position_title}</ListItemDescription>
                            </ListItemContent>
                            <ListItemMeta className="flex min-w-[10rem] flex-col items-end gap-2 text-right">
                              <StatusBadge variant={getBandVariant(member.eqs_band)}>{member.eqs_band ? eqsBandLabels[member.eqs_band] : "N/A"}</StatusBadge>
                              <span className="text-sm font-semibold text-foreground">{member.eqs_score?.toFixed(2)}</span>
                            </ListItemMeta>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </div>
                </div>
              </SectionPanel>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
