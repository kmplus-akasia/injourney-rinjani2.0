import type { ReactNode } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { PageHeading } from "@rinjani/shared-ui";
import { kpiLibrary, teamMembers } from "@performance/components/performance/data";
import { MyKPIDashboard } from "@performance/components/performance/my-kpi/MyKPIDashboard";
import { PlanningDashboard } from "@performance/components/performance/my-kpi/PlanningDashboard";
import { GoalSettingForm } from "@performance/components/performance/my-kpi/GoalSettingForm";
import { CheckInForm } from "@performance/components/performance/my-kpi/CheckInForm";
import { EvaluationDashboard } from "@performance/components/performance/my-kpi/EvaluationDashboard";
import { YearEndAssessment } from "@performance/components/performance/my-kpi/YearEndAssessment";
import { TeamDashboard } from "@performance/components/performance/my-team-kpi/TeamDashboard";
import { TeamPlanningDashboard } from "@performance/components/performance/my-team-kpi/TeamPlanningDashboard";
import { MemberKPIDetail } from "@performance/components/performance/my-team-kpi/MemberKPIDetail";
import { MemberPlanningDetail } from "@performance/components/performance/my-team-kpi/MemberPlanningDetail";
import { CascadeKPIView } from "@performance/components/performance/my-team-kpi/CascadeKPIView";
import { KPILibraryDashboard } from "@performance/components/performance/kpi-library/KPILibraryDashboard";
import { SubmitKPIForm } from "@performance/components/performance/kpi-library/SubmitKPIForm";
import { KPIDetailView } from "@performance/components/performance/kpi-library/KPIDetailView";
import { KPITreeView } from "@performance/components/performance/kpi-tree/KPITreeView";
import { HQDashboard } from "@performance/components/performance/kpi-headquarter/HQDashboard";
import { PerformancePrototypeProvider } from "@performance/lib/performance";

function PageWrap({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <PerformancePrototypeProvider>
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <PageHeading eyebrow="Performance" title={title} description={description} />
        <div className="overflow-hidden rounded-[24px] border border-border bg-card text-card-foreground shadow-sm">{children}</div>
      </div>
    </PerformancePrototypeProvider>
  );
}

export function PerformanceMyKPIDashboardPage() {
  return (
    <PageWrap title="My KPI" description="Stable route for the individual KPI dashboard.">
      <MyKPIDashboard />
    </PageWrap>
  );
}

export function PerformancePlanningPage() {
  const navigate = useNavigate();
  return (
    <PageWrap title="Goal Setting / Planning" description="Stable route for KPI planning.">
      <PlanningDashboard onEditKPI={() => navigate("/performance/my-kpi/goal-setting")} onSubmit={() => navigate("/performance/my-kpi")} />
    </PageWrap>
  );
}

export function PerformanceGoalSettingPage() {
  const navigate = useNavigate();
  return (
    <PageWrap title="Goal Setting Form">
      <GoalSettingForm onBack={() => navigate("/performance/my-kpi/planning")} />
    </PageWrap>
  );
}

export function PerformanceCheckInPage() {
  const navigate = useNavigate();
  return (
    <PageWrap title="Check-In">
      <CheckInForm onBack={() => navigate("/performance/my-kpi")} />
    </PageWrap>
  );
}

export function PerformanceEvaluationPage() {
  const navigate = useNavigate();
  return (
    <PageWrap title="Evaluation Dashboard">
      <EvaluationDashboard onStartAssessment={() => navigate("/performance/my-kpi/year-end")} />
    </PageWrap>
  );
}

export function PerformanceYearEndPage() {
  const navigate = useNavigate();
  return (
    <PageWrap title="Year-End Assessment">
      <YearEndAssessment onBack={() => navigate("/performance/my-kpi/evaluation")} />
    </PageWrap>
  );
}

export function PerformanceMyTeamDashboardPage() {
  const navigate = useNavigate();
  return (
    <PageWrap title="My Team KPI">
      <TeamDashboard onMemberClick={(memberId) => navigate(`/performance/my-team-kpi/member/${memberId}`)} onViewPlanning={() => navigate("/performance/my-team-kpi/planning")} />
    </PageWrap>
  );
}

export function PerformanceMyTeamPlanningPage() {
  const navigate = useNavigate();
  return (
    <PageWrap title="Team Planning Dashboard">
      <TeamPlanningDashboard
        onViewMonitoring={() => navigate("/performance/my-team-kpi")}
        onCascadeKPI={() => navigate("/performance/my-team-kpi/cascade")}
        onMemberClick={(memberId) => navigate(`/performance/my-team-kpi/planning/${memberId}`)}
      />
    </PageWrap>
  );
}

export function PerformanceMyTeamCascadePage() {
  const navigate = useNavigate();
  return (
    <PageWrap title="Cascade KPI">
      <CascadeKPIView onBack={() => navigate("/performance/my-team-kpi/planning")} />
    </PageWrap>
  );
}

export function PerformanceMemberDetailPage() {
  const navigate = useNavigate();
  const { memberId } = useParams();
  return memberId ? (
    <PageWrap title="Member KPI Detail">
      <MemberKPIDetail memberId={memberId} onBack={() => navigate("/performance/my-team-kpi")} />
    </PageWrap>
  ) : (
    <Navigate to="/performance/my-team-kpi" replace />
  );
}

export function PerformanceMemberPlanningPage() {
  const navigate = useNavigate();
  const { memberId } = useParams();
  return memberId ? (
    <PageWrap title="Member Planning Detail">
      <MemberPlanningDetail memberId={memberId} onBack={() => navigate("/performance/my-team-kpi/planning")} />
    </PageWrap>
  ) : (
    <Navigate to="/performance/my-team-kpi/planning" replace />
  );
}

export function PerformanceLibraryPage() {
  return (
    <PageWrap title="KPI Library">
      <KPILibraryDashboard />
    </PageWrap>
  );
}

export function PerformanceLibrarySubmitPage() {
  const navigate = useNavigate();
  return (
    <PageWrap title="Submit KPI">
      <SubmitKPIForm onBack={() => navigate("/performance/kpi-library")} />
    </PageWrap>
  );
}

export function PerformanceLibraryDetailPage() {
  const navigate = useNavigate();
  const { kpiId } = useParams();
  const selectedKpi = kpiLibrary.find((item) => item.id === kpiId) ?? kpiLibrary[0];
  return (
    <PageWrap title={`KPI Detail${selectedKpi ? `: ${selectedKpi.title}` : ""}`}>
      <KPIDetailView kpi={selectedKpi} onBack={() => navigate("/performance/kpi-library")} />
    </PageWrap>
  );
}

export function PerformanceTreePage() {
  return (
    <PageWrap title="KPI Tree">
      <KPITreeView />
    </PageWrap>
  );
}

export function PerformanceHeadquarterPage() {
  return (
    <PageWrap title="KPI Headquarter">
      <HQDashboard />
    </PageWrap>
  );
}

export function normalizePerformanceRoutes() {
  return {
    defaultMember: teamMembers[0]?.nik ?? "260102"
  };
}
