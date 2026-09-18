import { ClipboardList } from "lucide-react";
import { OnboardingDashboardSection } from "./OnboardingDashboardSection";
import { NewEmployeeOnboarding } from "./NewEmployeeOnboarding";
import { useOnboarding } from "./onboarding-context";

interface OnboardingJourneyProps {
  employeeName: string;
  userEmail: string;
}

export function OnboardingJourney({ employeeName, userEmail }: OnboardingJourneyProps) {
  const { newEmployeeChecklistItems, completeChecklistItem } = useOnboarding();
  const hasActiveJourney = newEmployeeChecklistItems.some((item) => !item.completed);

  return (
    <div className="min-h-full bg-background p-6">
      <NewEmployeeOnboarding userEmail={userEmail} renderChecklistInSidebar />

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Onboarding Journey</h1>
        <p className="mt-1 text-sm text-muted-foreground">New-joiner checklist for {employeeName}.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {hasActiveJourney ? (
          <div className="p-2 md:p-4">
            <OnboardingDashboardSection
              items={newEmployeeChecklistItems}
              onItemComplete={completeChecklistItem}
              employeeName={employeeName}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <ClipboardList className="size-6 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">No active onboarding journey</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              You do not have an open new-joiner checklist. Onboarding headquarters stays in Settings for administrators.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
