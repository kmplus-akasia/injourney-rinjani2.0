import { Home } from "@talent/screens/Home";
import { TalentPool } from "@talent/screens/TalentPool";
import { TalentMapping } from "@talent/screens/Epic2/TalentMapping";
import { SuccessionPlanning } from "@talent/screens/SuccessionPlanning";
import { EnterpriseArchitecturePage } from "@talent/screens/EnterpriseArchitecture/EnterpriseArchitecturePage";
import { CareerAspirationPage } from "@talent/screens/CareerPath/CareerPathPage";
import { TalentReviewPage } from "@talent/screens/Epic4/TalentReviewPage";
import SupervisorPortal from "@talent/pages/SupervisorPortal";
import TalentCommitteePortal from "@talent/pages/TalentCommitteePortal";
import ExploreJob from "@talent/screens/JobTender/ExploreJob";
import JobDetail from "@talent/screens/JobTender/JobDetail";
import MyApplications from "@talent/screens/JobTender/MyApplications";
import ApplicationDetail from "@talent/screens/JobTender/ApplicationDetail";
import SavedJobs from "@talent/screens/JobTender/SavedJobs";
import { IDPDashboardScreen } from "@talent/screens/IDP/IDPDashboardScreen";
import { GapAnalysisScreen } from "@talent/screens/IDP/GapAnalysisScreen";
import { RecommendationsScreen } from "@talent/screens/IDP/RecommendationsScreen";
import { CourseCatalogScreen } from "@talent/screens/IDP/CourseCatalogScreen";
import { IDPEditorScreen } from "@talent/screens/IDP/IDPEditorScreen";
import { ProgressTrackerScreen } from "@talent/screens/IDP/ProgressTrackerScreen";
import { IDPDetailScreen } from "@talent/screens/IDP/IDPDetailScreen";
import { TeamIDPDashboard } from "@talent/screens/IDP/Manager/TeamIDPDashboard";
import { IDPReviewDetail } from "@talent/screens/IDP/Manager/IDPReviewDetail";
import { MyLearningWrapped } from "@talent/screens/IDP/MyLearningWrapped";
import { AdminDashboardScreen } from "@talent/screens/Admin/IDP/AdminDashboardScreen";
import { IDPCyclesScreen } from "@talent/screens/Admin/IDP/IDPCyclesScreen";
import { LibraryMappingScreen } from "@talent/screens/Admin/IDP/LibraryMappingScreen";
import { ReasonTagManagementScreen } from "@talent/screens/Admin/IDP/ReasonTagManagementScreen";
import { BulkAssignmentScreen } from "@talent/screens/Admin/IDP/BulkAssignmentScreen";
import { ReminderSettingsScreen } from "@talent/screens/Admin/IDP/ReminderSettingsScreen";
import { GapAnalysisReportScreen } from "@talent/screens/Admin/IDP/GapAnalysisReportScreen";
import { ApprovalsScreen } from "@talent/screens/Admin/IDP/ApprovalsScreen";
import { JobTenderDashboardScreen } from "@talent/screens/Admin/JobTender/JobTenderDashboardScreen";
import { JobTenderCreateVacancyScreen } from "@talent/screens/Admin/JobTender/JobTenderCreateVacancyScreen";
import { JobTenderVacancyDetailScreen } from "@talent/screens/Admin/JobTender/JobTenderVacancyDetailScreen";
import { OrganizationManagementPage } from "@talent/screens/OrganizationManagement/OrganizationManagementPage";
import { OrganizationPositionDetailPage } from "@talent/screens/OrganizationManagement/OrganizationPositionDetailPage";
import { CompetencyAssessmentPage } from "@talent/screens/CompetencyAssessment/CompetencyAssessmentPage";
import { CompetencySelfAssessmentFillPage } from "@talent/screens/CompetencyAssessment/CompetencySelfAssessmentFillPage";
import { CompetencyEvaluationReportPage } from "@talent/screens/CompetencyAssessment/CompetencyEvaluationReportPage";
import Assessment360Page from "@talent/app/360-assessment/page";
import FillQuestionnairePage from "@talent/app/360-assessment/fill/[id]/page";
import AssessmentReportPage from "@talent/app/360-assessment/report/[id]/page";
import AssessmentHQPage from "@talent/app/360-assessment-hq/page";
import CreateCyclePage from "@talent/app/360-assessment-hq/create/page";
import CycleDetailRedirect from "@talent/app/360-assessment-hq/[id]/page";
import AssessorManagementPage from "@talent/app/360-assessment-hq/[id]/assessors/page";
import CompletionMonitoringPage from "@talent/app/360-assessment-hq/[id]/monitoring/page";
import AssessmentResultsPage from "@talent/app/360-assessment-hq/[id]/results/page";
import { ComingSoon } from "@talent/screens/ComingSoon";

export const talentPages = {
  Home,
  TalentPool,
  TalentMapping,
  SuccessionPlanning,
  EnterpriseArchitecturePage,
  CareerAspirationPage,
  TalentReviewPage,
  SupervisorPortal,
  TalentCommitteePortal,
  ExploreJob,
  JobDetail,
  MyApplications,
  ApplicationDetail,
  SavedJobs,
  IDPDashboardScreen,
  GapAnalysisScreen,
  RecommendationsScreen,
  CourseCatalogScreen,
  IDPEditorScreen,
  ProgressTrackerScreen,
  IDPDetailScreen,
  TeamIDPDashboard,
  IDPReviewDetail,
  MyLearningWrapped,
  AdminDashboardScreen,
  IDPCyclesScreen,
  LibraryMappingScreen,
  ReasonTagManagementScreen,
  BulkAssignmentScreen,
  ReminderSettingsScreen,
  GapAnalysisReportScreen,
  ApprovalsScreen,
  JobTenderDashboardScreen,
  JobTenderCreateVacancyScreen,
  JobTenderVacancyDetailScreen,
  OrganizationManagementPage,
  OrganizationPositionDetailPage,
  CompetencyAssessmentPage,
  CompetencySelfAssessmentFillPage,
  CompetencyEvaluationReportPage,
  Assessment360Page,
  FillQuestionnairePage,
  AssessmentReportPage,
  AssessmentHQPage,
  CreateCyclePage,
  CycleDetailRedirect,
  AssessorManagementPage,
  CompletionMonitoringPage,
  AssessmentResultsPage,
  ComingSoon
};
