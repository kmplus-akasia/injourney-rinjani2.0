import { createBrowserRouter } from "react-router";
import { Home } from "../screens/Home";
import { TalentPool } from "../screens/TalentPool";
import { TalentMapping } from "../screens/Epic2/TalentMapping";
import { SuccessionPlanning } from "../screens/SuccessionPlanning";
import { EnterpriseArchitecturePage } from "../screens/EnterpriseArchitecture/EnterpriseArchitecturePage";
import { CareerAspirationPage } from "../screens/CareerPath/CareerPathPage";
import { TalentReviewPage } from "../screens/Epic4/TalentReviewPage";
import SupervisorPortal from "../pages/SupervisorPortal";
import TalentCommitteePortal from "../pages/TalentCommitteePortal";
import ExploreJob from "../screens/JobTender/ExploreJob";
import JobDetail from "../screens/JobTender/JobDetail";
import MyApplications from "../screens/JobTender/MyApplications";
import ApplicationDetail from "../screens/JobTender/ApplicationDetail";
import SavedJobs from "../screens/JobTender/SavedJobs";
import { IDPDashboardScreen } from "../screens/IDP/IDPDashboardScreen";
import { GapAnalysisScreen } from "../screens/IDP/GapAnalysisScreen";
import { RecommendationsScreen } from "../screens/IDP/RecommendationsScreen";
import { CourseCatalogScreen } from "../screens/IDP/CourseCatalogScreen";
import { IDPEditorScreen } from "../screens/IDP/IDPEditorScreen";
import { ProgressTrackerScreen } from "../screens/IDP/ProgressTrackerScreen";
import { IDPDetailScreen } from "../screens/IDP/IDPDetailScreen";
import { TeamIDPDashboard } from "../screens/IDP/Manager/TeamIDPDashboard";
import { IDPReviewDetail } from "../screens/IDP/Manager/IDPReviewDetail";
import { MyLearningWrapped } from "../screens/IDP/MyLearningWrapped";
import { AdminDashboardScreen } from "../screens/Admin/IDP/AdminDashboardScreen";
import { IDPCyclesScreen } from "../screens/Admin/IDP/IDPCyclesScreen";
import { LibraryMappingScreen } from "../screens/Admin/IDP/LibraryMappingScreen";
import { ReasonTagManagementScreen } from "../screens/Admin/IDP/ReasonTagManagementScreen";
import { BulkAssignmentScreen } from "../screens/Admin/IDP/BulkAssignmentScreen";
import { ReminderSettingsScreen } from "../screens/Admin/IDP/ReminderSettingsScreen";
import { GapAnalysisReportScreen } from "../screens/Admin/IDP/GapAnalysisReportScreen";
import { JobTenderDashboardScreen } from "../screens/Admin/JobTender/JobTenderDashboardScreen";
import { JobTenderCreateVacancyScreen } from "../screens/Admin/JobTender/JobTenderCreateVacancyScreen";
import { JobTenderVacancyDetailScreen } from "../screens/Admin/JobTender/JobTenderVacancyDetailScreen";
import { OrganizationManagementPage } from "../screens/OrganizationManagement/OrganizationManagementPage";
import { OrganizationPositionDetailPage } from "../screens/OrganizationManagement/OrganizationPositionDetailPage";
import { CompetencyAssessmentPage } from "../screens/CompetencyAssessment/CompetencyAssessmentPage";
import { CompetencySelfAssessmentFillPage } from "../screens/CompetencyAssessment/CompetencySelfAssessmentFillPage";
import { CompetencyEvaluationReportPage } from "../screens/CompetencyAssessment/CompetencyEvaluationReportPage";
import Assessment360Page from "../app/360-assessment/page";
import FillQuestionnairePage from "../app/360-assessment/fill/[id]/page";
import AssessmentReportPage from "../app/360-assessment/report/[id]/page";
import AssessmentHQPage from "../app/360-assessment-hq/page";
import CreateCyclePage from "../app/360-assessment-hq/create/page";
import CycleDetailRedirect from "../app/360-assessment-hq/[id]/page";
import AssessorManagementPage from "../app/360-assessment-hq/[id]/assessors/page";
import CompletionMonitoringPage from "../app/360-assessment-hq/[id]/monitoring/page";
import AssessmentResultsPage from "../app/360-assessment-hq/[id]/results/page";
import { ComingSoon } from "../screens/ComingSoon";
import { ErrorState } from "../screens/ErrorState";

export const router = createBrowserRouter([
  {
    path: "/talent",
    Component: Home,
  },
  {
    path: "/talent/talent-pool",
    Component: TalentPool,
  },
  {
    path: "/talent/talent-mapping",
    Component: TalentMapping,
  },
  {
    path: "/talent/succession-planning",
    Component: SuccessionPlanning,
  },
  {
    path: "/talent/enterprise-architecture",
    Component: EnterpriseArchitecturePage,
  },
  {
    path: "/talent/career-aspiration",
    Component: CareerAspirationPage,
  },
  {
    path: "/talent/talent-review",
    Component: TalentReviewPage,
  },
  {
    path: "/talent/supervisor-portal",
    Component: SupervisorPortal,
  },
  {
    path: "/talent/talent-committee",
    Component: TalentCommitteePortal,
  },
  {
    path: "/talent/explore",
    Component: ExploreJob,
  },
  {
    path: "/talent/explore/:id",
    Component: JobDetail,
  },
  {
    path: "/talent/my-applications",
    Component: MyApplications,
  },
  {
    path: "/talent/my-applications/:id",
    Component: ApplicationDetail,
  },
  {
    path: "/talent/saved",
    Component: SavedJobs,
  },
  {
    path: "/talent/job-tender",
    Component: ExploreJob, // Redirect/Alias to Explore
  },
  {
    path: "/talent/org-management",
    Component: OrganizationManagementPage,
  },
  {
    path: "/talent/org-management/positions/:id",
    Component: OrganizationPositionDetailPage,
  },
  {
    path: "/talent/idp",
    Component: IDPDashboardScreen,
  },
  {
    path: "/talent/idp/dashboard",
    Component: IDPDashboardScreen,
  },
  {
    path: "/talent/idp/gap-analysis",
    Component: GapAnalysisScreen,
  },
  {
    path: "/talent/idp/recommendations",
    Component: RecommendationsScreen,
  },
  {
    path: "/talent/idp/catalog",
    Component: CourseCatalogScreen,
  },
  {
    path: "/talent/idp/editor",
    Component: IDPEditorScreen,
  },
  {
    path: "/talent/idp/progress",
    Component: ProgressTrackerScreen,
  },
  {
    path: "/talent/idp/detail/:id",
    Component: IDPDetailScreen,
  },
  {
    path: "/talent/idp/team",
    Component: TeamIDPDashboard,
  },
  {
    path: "/talent/idp/review/:id",
    Component: IDPReviewDetail,
  },
  {
    path: "/talent/idp/wrapped",
    Component: MyLearningWrapped,
  },
  {
    path: "/talent/admin/idp",
    Component: AdminDashboardScreen,
  },
  {
    path: "/talent/admin/idp/cycles",
    Component: IDPCyclesScreen,
  },
  {
    path: "/talent/admin/idp/library",
    Component: LibraryMappingScreen,
  },
  {
    path: "/talent/admin/idp/tags",
    Component: ReasonTagManagementScreen,
  },
  {
    path: "/talent/admin/idp/bulk-assign",
    Component: BulkAssignmentScreen,
  },
  {
    path: "/talent/admin/idp/reminders",
    Component: ReminderSettingsScreen,
  },
  {
    path: "/talent/admin/idp/gap-report",
    Component: GapAnalysisReportScreen,
  },
  {
    path: "/talent/admin/idp/approvals",
    Component: () => <ComingSoon moduleName="IDP Admin" title="Persetujuan IDP" layout="admin" />,
  },
  {
    path: "/talent/admin/idp/reports",
    Component: () => <ComingSoon moduleName="IDP Admin" title="Laporan IDP" layout="admin" />,
  },
  {
    path: "/talent/admin/job-tender",
    Component: JobTenderDashboardScreen,
  },
  {
    path: "/talent/admin/job-tender/create",
    Component: JobTenderCreateVacancyScreen,
  },
  {
    path: "/talent/admin/job-tender/:id",
    Component: JobTenderVacancyDetailScreen,
  },
  {
    path: "/talent/competency-assessment",
    Component: CompetencyAssessmentPage,
  },
  {
    path: "/talent/competency-assessment/fill/:id",
    Component: CompetencySelfAssessmentFillPage,
  },
  {
    path: "/talent/competency-assessment/report/:id",
    Component: CompetencyEvaluationReportPage,
  },
  {
    path: "/talent/360-assessment",
    Component: Assessment360Page,
  },
  {
    path: "/talent/360-assessment/fill/:id",
    Component: FillQuestionnairePage,
  },
  {
    path: "/talent/360-assessment/report/:id",
    Component: AssessmentReportPage,
  },
  {
    path: "/talent/360-assessment-hq",
    Component: AssessmentHQPage,
  },
  {
    path: "/talent/360-assessment-hq/create",
    Component: CreateCyclePage,
  },
  {
    path: "/talent/360-assessment-hq/:id",
    Component: CycleDetailRedirect,
  },
  {
    path: "/talent/360-assessment-hq/:id/assessors",
    Component: AssessorManagementPage,
  },
  {
    path: "/talent/360-assessment-hq/:id/monitoring",
    Component: CompletionMonitoringPage,
  },
  {
    path: "/talent/360-assessment-hq/:id/results",
    Component: AssessmentResultsPage,
  },
  {
    path: "*",
    Component: () => <ErrorState code="404" title="Halaman Tidak Ditemukan" description="Mohon maaf, halaman yang Anda tuju tidak dapat ditemukan." />,
  }
]);
