import type { ReactNode } from "react";
import { useState } from "react";
import { Navigate, Outlet, createHashRouter, useLocation, useParams } from "react-router";
import { AppShell } from "@rinjani/shell";
import { SessionProvider, useSession } from "./session";
import { MyKpiPhaseToggle } from "./my-kpi-phase-toggle";
import { MyTeamKpiPhaseToggle } from "./my-team-kpi-phase-toggle";
import { platforms, sidebarModules } from "./manifests";
import { globalSearchItems } from "./search-data";
import type { UserRole } from "@rinjani/shared-types";
import SignIn from "@portal/imports/SignIn";
import { MicrosoftLoginPage } from "@portal/components/MicrosoftLoginPage";
import { LoadingScreen } from "@portal/components/LoadingScreen";
import { PortalAnalyticsPage, PortalDashboardPage, PortalEmployeeProfilePage, PortalMailPage, PortalMyProfilePage, PortalOffboardingPage, PortalPolicyPage, PortalSettingsPage, PortalSurveyAnalyticsPage, PortalSurveyManagementPage, PortalSurveyPage, PortalSurveyTakePage } from "./portal-pages";
import { DesignSystemPage } from "./design-system-page";
import {
  PerformanceCheckInPage,
  PerformanceEvaluationPage,
  PerformanceGoalSettingPage,
  PerformanceHeadquarterPage,
  PerformanceLibraryDetailPage,
  PerformanceLibraryPage,
  PerformanceLibrarySubmitPage,
  PerformanceMemberDetailPage,
  PerformanceMemberPlanningPage,
  PerformanceMyKPIDashboardPage,
  PerformanceMyTeamCascadePage,
  PerformanceMyTeamDashboardPage,
  PerformanceMyTeamPlanningPage,
  PerformancePlanningPage,
  PerformanceTreePage,
  PerformanceYearEndPage,
  normalizePerformanceRoutes,
} from "./performance-pages";
import { talentPages } from "./talent-pages";
import {
  PerformanceV2IndexRedirect,
  PerformanceV2KpiHqPage,
  PerformanceV2KpiLibraryDetailPage,
  PerformanceV2KpiLibraryPage,
  PerformanceV2KpiLibrarySubmitPage,
  PerformanceV2KpiTreePage,
  PerformanceV2MemberPortfolioPage,
  PerformanceV2MyKpiCheckInPage,
  PerformanceV2MyKpiDashboardPage,
  PerformanceV2MyKpiPlanningPage,
  PerformanceV2MyKpiYearEndPage,
  PerformanceV2MyTeamMonitoringPage,
  PerformanceV2MyTeamPlanningPage,
  PerformanceV2ShellLayout,
} from "./performance-pages-v2";

function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

function LoginPage() {
  const { login } = useSession();
  const redirect = () => {
    window.location.hash = "#/";
  };

  return (
    <SignIn
      onLogin={(email, role) => {
        login(email, role);
        redirect();
      }}
      onMicrosoftLogin={() => {
        window.location.hash = "#/login/microsoft";
      }}
    />
  );
}

function MicrosoftLoginRoute() {
  const { login } = useSession();
  const [showLoading, setShowLoading] = useState(false);
  return (
    <>
      <MicrosoftLoginPage
        onLogin={() => {
          setShowLoading(true);
          window.setTimeout(() => {
            login("binavia@injourney.co.id", "Admin");
            window.location.hash = "#/";
          }, 1200);
        }}
        onBack={() => {
          window.location.hash = "#/login";
        }}
      />
      {showLoading ? <LoadingScreen /> : null}
    </>
  );
}

function RequireAuth() {
  const { session } = useSession();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function AdminOnly({ children }: { children: ReactNode }) {
  const { session } = useSession();
  return session?.role === "Admin" ? <>{children}</> : <Navigate to="/" replace />;
}

function IntegratedShellLayout() {
  const { session, notifications, setNotifications, logout, setRole } = useSession();
  const { pathname } = useLocation();
  if (!session) {
    return null;
  }

  const headerAccessory =
    pathname === "/performance-v2/my-kpi" ||
    pathname.startsWith("/performance-v2/my-kpi/") ? (
      <MyKpiPhaseToggle />
    ) : pathname === "/performance-v2/my-team-kpi" ||
      pathname.startsWith("/performance-v2/my-team-kpi/") ? (
      <MyTeamKpiPhaseToggle />
    ) : undefined;

  return (
    <AppShell
      platforms={platforms}
      modules={sidebarModules}
      globalSearchItems={globalSearchItems}
      notifications={notifications}
      userRole={session.role}
      userEmail={session.email}
      onRoleChange={(role: UserRole) => setRole(role)}
      onLogout={() => {
        logout();
        window.location.hash = "#/login";
      }}
      headerAccessory={headerAccessory}
    >
      <Outlet />
    </AppShell>
  );
}

function PortalRouteOutlet() {
  const { session, notifications, setNotifications } = useSession();
  if (!session) {
    return null;
  }

  return (
    <Outlet
      context={{
        userRole: session.role,
        userEmail: session.email,
        notifications,
        setNotifications
      }}
    />
  );
}

const perfDefaults = normalizePerformanceRoutes();

function LegacyTalentRedirect({
  buildPath,
}: {
  buildPath: (params: Record<string, string | undefined>) => string;
}) {
  const params = useParams();
  return <Navigate to={buildPath(params)} replace />;
}

export const router = createHashRouter([
  {
    path: "/",
    element: (
      <Providers>
        <Outlet />
      </Providers>
    ),
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "login/microsoft", element: <MicrosoftLoginRoute /> },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <IntegratedShellLayout />,
            children: [
              {
                element: <PortalRouteOutlet />,
                children: [
                  {
                    index: true,
                    element: <PortalContextRoute render={(props) => <PortalDashboardPage userRole={props.userRole} userEmail={props.userEmail} />} />
                  },
                  {
                    path: "my-profile",
                    element: <PortalContextRoute render={(props) => <PortalMyProfilePage userRole={props.userRole} userEmail={props.userEmail} />} />
                  },
                  {
                    path: "survey",
                    element: <PortalContextRoute render={(props) => <PortalSurveyPage userRole={props.userRole} />} />
                  },
                  {
                    path: "survey/take/:surveyId",
                    element: <PortalSurveyTakePage />
                  },
                  {
                    path: "survey/analytics/:surveyId",
                    element: <PortalContextRoute render={(props) => <PortalSurveyAnalyticsPage userRole={props.userRole} />} />
                  },
                  {
                    path: "survey/management",
                    element: <PortalSurveyManagementPage />
                  },
                  {
                    path: "hc-policy",
                    element: <PortalContextRoute render={(props) => <PortalPolicyPage userRole={props.userRole} userEmail={props.userEmail} />} />
                  },
                  {
                    path: "employee-profile/:email",
                    element: <PortalEmployeeProfilePage />
                  },
                  {
                    path: "analytics",
                    element: (
                      <AdminOnly>
                        <PortalAnalyticsPage />
                      </AdminOnly>
                    )
                  },
                  {
                    path: "mail",
                    element: (
                      <AdminOnly>
                        <PortalMailPage />
                      </AdminOnly>
                    )
                  },
                  {
                    path: "offboarding",
                    element: <PortalContextRoute render={(props) => <PortalOffboardingPage userEmail={props.userEmail} />} />
                  },
                  {
                    path: "settings",
                    element: <PortalContextRoute render={(props) => <PortalSettingsPage {...props} />} />
                  },
                  {
                    path: "design-system",
                    element: (
                      <AdminOnly>
                        <DesignSystemPage />
                      </AdminOnly>
                    )
                  },

                  {
                    path: "talent",
                    element: <Outlet />,
                    children: [
                      { index: true, element: <talentPages.Home /> },
                      { path: "career-aspiration", element: <talentPages.CareerAspirationPage /> },
                      { path: "talent-pool", element: <talentPages.TalentPool /> },
                      { path: "talent-mapping", element: <talentPages.TalentMapping /> },
                      { path: "succession-planning", element: <talentPages.SuccessionPlanning /> },
                      { path: "talent-review", element: <talentPages.TalentReviewPage /> },
                      { path: "enterprise-architecture", element: <talentPages.EnterpriseArchitecturePage /> },
                      { path: "supervisor-portal", element: <talentPages.SupervisorPortal /> },
                      { path: "talent-committee", element: <talentPages.TalentCommitteePortal /> },
                      { path: "explore", element: <talentPages.ExploreJob /> },
                      { path: "explore/:id", element: <talentPages.JobDetail /> },
                      { path: "my-applications", element: <talentPages.MyApplications /> },
                      { path: "my-applications/:id", element: <talentPages.ApplicationDetail /> },
                      { path: "saved", element: <talentPages.SavedJobs /> },
                      { path: "job-tender", element: <Navigate to="/talent/explore" replace /> },
                      {
                        path: "org-management",
                        element: <AdminOnly><talentPages.OrganizationManagementPage /></AdminOnly>
                      },
                      {
                        path: "org-management/positions/:id",
                        element: <AdminOnly><talentPages.OrganizationPositionDetailPage /></AdminOnly>
                      },
                      { path: "idp", element: <talentPages.IDPDashboardScreen /> },
                      { path: "idp/dashboard", element: <talentPages.IDPDashboardScreen /> },
                      { path: "idp/gap-analysis", element: <talentPages.GapAnalysisScreen /> },
                      { path: "idp/recommendations", element: <talentPages.RecommendationsScreen /> },
                      { path: "idp/catalog", element: <talentPages.CourseCatalogScreen /> },
                      { path: "idp/editor", element: <talentPages.IDPEditorScreen /> },
                      { path: "idp/progress", element: <talentPages.ProgressTrackerScreen /> },
                      { path: "idp/detail/:id", element: <talentPages.IDPDetailScreen /> },
                      { path: "idp/team", element: <talentPages.TeamIDPDashboard /> },
                      { path: "idp/review/:id", element: <talentPages.IDPReviewDetail /> },
                      { path: "idp/wrapped", element: <talentPages.MyLearningWrapped /> },
                      { path: "admin/idp", element: <AdminOnly><talentPages.AdminDashboardScreen /></AdminOnly> },
                      { path: "admin/idp/cycles", element: <AdminOnly><talentPages.IDPCyclesScreen /></AdminOnly> },
                      { path: "admin/idp/library", element: <AdminOnly><talentPages.LibraryMappingScreen /></AdminOnly> },
                      { path: "admin/idp/tags", element: <AdminOnly><talentPages.ReasonTagManagementScreen /></AdminOnly> },
                      { path: "admin/idp/bulk-assign", element: <AdminOnly><talentPages.BulkAssignmentScreen /></AdminOnly> },
                      { path: "admin/idp/reminders", element: <AdminOnly><talentPages.ReminderSettingsScreen /></AdminOnly> },
                      { path: "admin/idp/gap-report", element: <AdminOnly><talentPages.GapAnalysisReportScreen /></AdminOnly> },
                      { path: "admin/idp/approvals", element: <AdminOnly><talentPages.ComingSoon moduleName="IDP Admin" title="Persetujuan IDP" layout="admin" /></AdminOnly> },
                      { path: "admin/idp/reports", element: <AdminOnly><talentPages.ComingSoon moduleName="IDP Admin" title="Laporan IDP" layout="admin" /></AdminOnly> },
                      { path: "admin/job-tender", element: <AdminOnly><talentPages.JobTenderDashboardScreen /></AdminOnly> },
                      { path: "admin/job-tender/create", element: <AdminOnly><talentPages.JobTenderCreateVacancyScreen /></AdminOnly> },
                      { path: "admin/job-tender/:id", element: <AdminOnly><talentPages.JobTenderVacancyDetailScreen /></AdminOnly> },
                      { path: "competency-assessment", element: <talentPages.CompetencyAssessmentPage /> },
                      { path: "competency-assessment/fill/:id", element: <talentPages.CompetencySelfAssessmentFillPage /> },
                      { path: "competency-assessment/report/:id", element: <talentPages.CompetencyEvaluationReportPage /> },
                      { path: "360-assessment", element: <talentPages.Assessment360Page /> },
                      { path: "360-assessment/assigned", element: <talentPages.Assessment360Page /> },
                      { path: "360-assessment/fill/:id", element: <talentPages.FillQuestionnairePage /> },
                      { path: "360-assessment/report/:id", element: <talentPages.AssessmentReportPage /> },
                      { path: "360-assessment-hq", element: <AdminOnly><talentPages.AssessmentHQPage /></AdminOnly> },
                      { path: "360-assessment-hq/create", element: <AdminOnly><talentPages.CreateCyclePage /></AdminOnly> },
                      { path: "360-assessment-hq/:id", element: <AdminOnly><talentPages.CycleDetailRedirect /></AdminOnly> },
                      { path: "360-assessment-hq/:id/assessors", element: <AdminOnly><talentPages.AssessorManagementPage /></AdminOnly> },
                      { path: "360-assessment-hq/:id/monitoring", element: <AdminOnly><talentPages.CompletionMonitoringPage /></AdminOnly> },
                      { path: "360-assessment-hq/:id/results", element: <AdminOnly><talentPages.AssessmentResultsPage /></AdminOnly> },
                    ],
                  },

                  { path: "career-aspiration", element: <Navigate to="/talent/career-aspiration" replace /> },
                  { path: "talent-pool", element: <Navigate to="/talent/talent-pool" replace /> },
                  { path: "talent-mapping", element: <Navigate to="/talent/talent-mapping" replace /> },
                  { path: "succession-planning", element: <Navigate to="/talent/succession-planning" replace /> },
                  { path: "talent-review", element: <Navigate to="/talent/talent-review" replace /> },
                  { path: "enterprise-architecture", element: <Navigate to="/talent/enterprise-architecture" replace /> },
                  { path: "supervisor-portal", element: <Navigate to="/talent/supervisor-portal" replace /> },
                  { path: "talent-committee", element: <Navigate to="/talent/talent-committee" replace /> },
                  { path: "explore", element: <Navigate to="/talent/explore" replace /> },
                  { path: "explore/:id", element: <LegacyTalentRedirect buildPath={({ id }) => `/talent/explore/${id ?? ""}`} /> },
                  { path: "my-applications", element: <Navigate to="/talent/my-applications" replace /> },
                  { path: "my-applications/:id", element: <LegacyTalentRedirect buildPath={({ id }) => `/talent/my-applications/${id ?? ""}`} /> },
                  { path: "saved", element: <Navigate to="/talent/saved" replace /> },
                  { path: "job-tender", element: <Navigate to="/talent/job-tender" replace /> },
                  { path: "org-management", element: <Navigate to="/talent/org-management" replace /> },
                  { path: "org-management/positions/:id", element: <LegacyTalentRedirect buildPath={({ id }) => `/talent/org-management/positions/${id ?? ""}`} /> },
                  { path: "idp", element: <Navigate to="/talent/idp" replace /> },
                  { path: "idp/dashboard", element: <Navigate to="/talent/idp/dashboard" replace /> },
                  { path: "idp/gap-analysis", element: <Navigate to="/talent/idp/gap-analysis" replace /> },
                  { path: "idp/recommendations", element: <Navigate to="/talent/idp/recommendations" replace /> },
                  { path: "idp/catalog", element: <Navigate to="/talent/idp/catalog" replace /> },
                  { path: "idp/editor", element: <Navigate to="/talent/idp/editor" replace /> },
                  { path: "idp/progress", element: <Navigate to="/talent/idp/progress" replace /> },
                  { path: "idp/detail/:id", element: <LegacyTalentRedirect buildPath={({ id }) => `/talent/idp/detail/${id ?? ""}`} /> },
                  { path: "idp/team", element: <Navigate to="/talent/idp/team" replace /> },
                  { path: "idp/review/:id", element: <LegacyTalentRedirect buildPath={({ id }) => `/talent/idp/review/${id ?? ""}`} /> },
                  { path: "idp/wrapped", element: <Navigate to="/talent/idp/wrapped" replace /> },
                  { path: "admin/idp", element: <Navigate to="/talent/admin/idp" replace /> },
                  { path: "admin/idp/cycles", element: <Navigate to="/talent/admin/idp/cycles" replace /> },
                  { path: "admin/idp/library", element: <Navigate to="/talent/admin/idp/library" replace /> },
                  { path: "admin/idp/tags", element: <Navigate to="/talent/admin/idp/tags" replace /> },
                  { path: "admin/idp/bulk-assign", element: <Navigate to="/talent/admin/idp/bulk-assign" replace /> },
                  { path: "admin/idp/reminders", element: <Navigate to="/talent/admin/idp/reminders" replace /> },
                  { path: "admin/idp/gap-report", element: <Navigate to="/talent/admin/idp/gap-report" replace /> },
                  { path: "admin/idp/approvals", element: <Navigate to="/talent/admin/idp/approvals" replace /> },
                  { path: "admin/idp/reports", element: <Navigate to="/talent/admin/idp/reports" replace /> },
                  { path: "admin/job-tender", element: <Navigate to="/talent/admin/job-tender" replace /> },
                  { path: "admin/job-tender/create", element: <Navigate to="/talent/admin/job-tender/create" replace /> },
                  { path: "admin/job-tender/:id", element: <LegacyTalentRedirect buildPath={({ id }) => `/talent/admin/job-tender/${id ?? ""}`} /> },
                  { path: "competency-assessment", element: <Navigate to="/talent/competency-assessment" replace /> },
                  { path: "competency-assessment/fill/:id", element: <LegacyTalentRedirect buildPath={({ id }) => `/talent/competency-assessment/fill/${id ?? ""}`} /> },
                  { path: "competency-assessment/report/:id", element: <LegacyTalentRedirect buildPath={({ id }) => `/talent/competency-assessment/report/${id ?? ""}`} /> },
                  { path: "360-assessment", element: <Navigate to="/talent/360-assessment" replace /> },
                  { path: "360-assessment/assigned", element: <Navigate to="/talent/360-assessment/assigned" replace /> },
                  { path: "360-assessment/fill/:id", element: <LegacyTalentRedirect buildPath={({ id }) => `/talent/360-assessment/fill/${id ?? ""}`} /> },
                  { path: "360-assessment/report/:id", element: <LegacyTalentRedirect buildPath={({ id }) => `/talent/360-assessment/report/${id ?? ""}`} /> },
                  { path: "360-assessment-hq", element: <Navigate to="/talent/360-assessment-hq" replace /> },
                  { path: "360-assessment-hq/create", element: <Navigate to="/talent/360-assessment-hq/create" replace /> },
                  { path: "360-assessment-hq/:id", element: <LegacyTalentRedirect buildPath={({ id }) => `/talent/360-assessment-hq/${id ?? ""}`} /> },
                  { path: "360-assessment-hq/:id/assessors", element: <LegacyTalentRedirect buildPath={({ id }) => `/talent/360-assessment-hq/${id ?? ""}/assessors`} /> },
                  { path: "360-assessment-hq/:id/monitoring", element: <LegacyTalentRedirect buildPath={({ id }) => `/talent/360-assessment-hq/${id ?? ""}/monitoring`} /> },
                  { path: "360-assessment-hq/:id/results", element: <LegacyTalentRedirect buildPath={({ id }) => `/talent/360-assessment-hq/${id ?? ""}/results`} /> },

                  { path: "performance", element: <Navigate to="/performance/my-kpi" replace /> },
                  { path: "performance/my-kpi", element: <PerformanceMyKPIDashboardPage /> },
                  { path: "performance/my-kpi/planning", element: <PerformancePlanningPage /> },
                  { path: "performance/my-kpi/goal-setting", element: <PerformanceGoalSettingPage /> },
                  { path: "performance/my-kpi/check-in", element: <PerformanceCheckInPage /> },
                  { path: "performance/my-kpi/evaluation", element: <PerformanceEvaluationPage /> },
                  { path: "performance/my-kpi/year-end", element: <PerformanceYearEndPage /> },
                  { path: "performance/my-team-kpi", element: <PerformanceMyTeamDashboardPage /> },
                  { path: "performance/my-team-kpi/planning", element: <PerformanceMyTeamPlanningPage /> },
                  { path: "performance/my-team-kpi/cascade", element: <PerformanceMyTeamCascadePage /> },
                  { path: "performance/my-team-kpi/member/:memberId", element: <PerformanceMemberDetailPage /> },
                  { path: "performance/my-team-kpi/planning/:memberId", element: <PerformanceMemberPlanningPage /> },
                  { path: "performance/my-team-kpi/member", element: <Navigate to={`/performance/my-team-kpi/member/${perfDefaults.defaultMember}`} replace /> },
                  { path: "performance/kpi-library", element: <PerformanceLibraryPage /> },
                  { path: "performance/kpi-library/submit", element: <PerformanceLibrarySubmitPage /> },
                  { path: "performance/kpi-library/:kpiId", element: <PerformanceLibraryDetailPage /> },
                  { path: "performance/kpi-tree", element: <PerformanceTreePage /> },
                  { path: "performance/kpi-headquarter", element: <AdminOnly><PerformanceHeadquarterPage /></AdminOnly> },

                  {
                    path: "performance-v2",
                    element: <PerformanceV2ShellLayout />,
                    children: [
                      { index: true, element: <PerformanceV2IndexRedirect /> },
                      { path: "my-kpi", element: <PerformanceV2MyKpiDashboardPage /> },
                      { path: "my-kpi/planning", element: <PerformanceV2MyKpiPlanningPage /> },
                      { path: "my-kpi/check-in", element: <PerformanceV2MyKpiCheckInPage /> },
                      { path: "my-kpi/year-end", element: <PerformanceV2MyKpiYearEndPage /> },
                      { path: "my-team-kpi", element: <Navigate to="/performance-v2/my-team-kpi/planning" replace /> },
                      { path: "my-team-kpi/planning", element: <PerformanceV2MyTeamPlanningPage /> },
                      { path: "my-team-kpi/monitoring", element: <PerformanceV2MyTeamMonitoringPage /> },
                      { path: "my-team-kpi/member", element: <Navigate to="/performance-v2/my-team-kpi/member/260102" replace /> },
                      { path: "my-team-kpi/member/:memberId", element: <PerformanceV2MemberPortfolioPage /> },
                      { path: "kpi-library", element: <PerformanceV2KpiLibraryPage /> },
                      { path: "kpi-library/submit", element: <PerformanceV2KpiLibrarySubmitPage /> },
                      { path: "kpi-library/:kpiId", element: <PerformanceV2KpiLibraryDetailPage /> },
                      { path: "kpi-tree", element: <PerformanceV2KpiTreePage /> },
                      { path: "kpi-headquarter", element: <AdminOnly><PerformanceV2KpiHqPage /></AdminOnly> },
                    ],
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]);

function PortalContextRoute({
  render,
}: {
  render: (props: {
    userRole: UserRole;
    userEmail: string;
    notifications: ReturnType<typeof useSession>["notifications"];
    setNotifications: ReturnType<typeof useSession>["setNotifications"];
  }) => React.ReactNode;
}) {
  const { session, notifications, setNotifications } = useSession();
  if (!session) {
    return null;
  }

  return <>{render({ userRole: session.role, userEmail: session.email, notifications, setNotifications })}</>;
}
