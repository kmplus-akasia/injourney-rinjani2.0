import type { Dispatch, SetStateAction } from "react";
import { useMemo } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import type { UserRole } from "@rinjani/shared-types";
import type { Notification } from "@rinjani/shared-types";
import Frame from "@portal/imports/Frame1000001738";
import MyProfile from "@portal/components/MyProfile";
import Settings from "@portal/components/Settings";
import SurveyTakePage from "@portal/components/SurveyTakePage";
import SurveyAnalyticsPage from "@portal/components/SurveyAnalyticsPage";
import SurveyManagementPage from "@portal/components/SurveyManagementPage";
import { SurveyPage } from "@portal/components/SurveyPage";
import HCDigiPolicy from "@portal/components/HCDigiPolicy";
import PublicProfileView from "@portal/components/PublicProfileView";
import Analytics from "@portal/components/Analytics";
import { MailManagement } from "@portal/components/MailManagement";
import { OffboardingStatus } from "@portal/components/OffboardingStatus";
import { OnboardingJourney } from "@portal/components/onboarding/OnboardingJourney";
import { OnboardingProvider } from "@portal/components/onboarding/onboarding-context";

interface SharedPortalProps {
  userRole: UserRole;
  userEmail: string;
  notifications: Notification[];
  setNotifications: Dispatch<SetStateAction<Notification[]>>;
}

export function PortalDashboardPage({ userRole, userEmail }: Pick<SharedPortalProps, "userRole" | "userEmail">) {
  const navigate = useNavigate();
  return (
    <OnboardingProvider userId={userEmail}>
      <Frame
        onProfileClick={() => navigate("/my-profile")}
        userRole={userRole}
        userEmail={userEmail}
      />
    </OnboardingProvider>
  );
}

export function PortalMyProfilePage({ userRole, userEmail }: Pick<SharedPortalProps, "userRole" | "userEmail">) {
  const navigate = useNavigate();
  return <MyProfile onBack={() => navigate("/")} userRole={userRole} userEmail={userEmail} onLogout={() => navigate("/login")} />;
}

export function PortalSettingsPage({ userRole, userEmail, notifications, setNotifications }: SharedPortalProps) {
  const navigate = useNavigate();
  return (
    <Settings
      onBack={() => navigate("/")}
      userRole={userRole}
      notifications={notifications}
      setNotifications={setNotifications}
      onAddNotification={(notification) => setNotifications((current) => [notification, ...current])}
      onViewSurveyResults={(surveyId) => navigate(`/survey/analytics/${surveyId}`)}
      userEmail={userEmail}
    />
  );
}

export function PortalSurveyPage({ userRole }: Pick<SharedPortalProps, "userRole">) {
  return <SurveyPage userRole={userRole} />;
}

export function PortalSurveyTakePage() {
  const navigate = useNavigate();
  const { surveyId } = useParams();
  return surveyId ? <SurveyTakePage surveyId={surveyId} onBack={() => navigate("/survey")} /> : <Navigate to="/survey" replace />;
}

export function PortalSurveyAnalyticsPage({ userRole }: Pick<SharedPortalProps, "userRole">) {
  const navigate = useNavigate();
  const { surveyId } = useParams();
  return surveyId ? <SurveyAnalyticsPage surveyId={surveyId} onBack={() => navigate("/survey")} userRole={userRole} /> : <Navigate to="/survey" replace />;
}

export function PortalSurveyManagementPage() {
  const navigate = useNavigate();
  return <SurveyManagementPage onBack={() => navigate("/survey")} />;
}

export function PortalPolicyPage({ userRole, userEmail }: Pick<SharedPortalProps, "userRole" | "userEmail">) {
  const navigate = useNavigate();
  return <HCDigiPolicy onBack={() => navigate("/")} userRole={userRole} userEmail={userEmail} />;
}

export function PortalEmployeeProfilePage() {
  const navigate = useNavigate();
  const { email } = useParams();
  return email ? <PublicProfileView onBack={() => navigate("/")} email={decodeURIComponent(email)} /> : <Navigate to="/" replace />;
}

export function PortalAnalyticsPage() {
  const navigate = useNavigate();
  return <Analytics onBack={() => navigate("/")} />;
}

export function PortalMailPage() {
  const navigate = useNavigate();
  return <MailManagement onBack={() => navigate("/")} />;
}

export function PortalOffboardingPage({ userEmail }: Pick<SharedPortalProps, "userEmail">) {
  const employeeName = useMemo(() => (userEmail === "binavia@injourney.co.id" ? "Binavia Wardhani" : userEmail), [userEmail]);
  return (
    <OffboardingStatus
      employeeName={employeeName}
      lastWorkingDay={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)}
    />
  );
}

export function PortalOnboardingPage({ userEmail }: Pick<SharedPortalProps, "userEmail">) {
  const employeeName = useMemo(() => {
    if (userEmail === "binavia@injourney.co.id") return "Binavia Wardhani";
    if (userEmail.startsWith("dimas")) return "Dimas Sayyid";
    return userEmail.split("@")[0] || "New Joiner";
  }, [userEmail]);
  return (
    <OnboardingProvider userId={userEmail}>
      <OnboardingJourney employeeName={employeeName} userEmail={userEmail} />
    </OnboardingProvider>
  );
}
