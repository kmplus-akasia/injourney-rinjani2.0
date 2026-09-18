import { Briefcase, CheckCircle2, Clock } from "lucide-react";
import { Badge, Button, Card, CardContent, EmptyState } from "@rinjani/shared-ui";
import { cn } from "../../components/ui/utils";

interface SuccessionStatus {
  positionTitle: string;
  division: string;
  status: "approved" | "pending";
  ranking: "primary" | "secondary" | "tertiary";
  date?: string;
}

const mockEmployeeStatus: SuccessionStatus[] = [
  {
    positionTitle: "VP Finance",
    division: "Finance Division",
    status: "approved",
    ranking: "primary",
    date: "15 Jan 2026",
  },
  {
    positionTitle: "Director SDM",
    division: "Human Capital Division",
    status: "pending",
    ranking: "secondary",
  },
];

export function EmployeeSuccessionView() {
  if (mockEmployeeStatus.length === 0) {
    return (
      <EmptyState
        title="No Active Succession Plans"
        description="You are not currently listed as a successor for any positions. Continue developing your skills and expressing your career aspirations."
        action={<Button variant="outline">View Career Development</Button>}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      {mockEmployeeStatus.map((item) => (
        <Card key={`${item.positionTitle}-${item.ranking}`} className="overflow-hidden border-border shadow-sm">
          <div className="flex flex-col sm:flex-row">
            <div
              className={cn(
                "w-full shrink-0 sm:w-2",
                item.ranking === "primary" ? "bg-success" : item.ranking === "secondary" ? "bg-primary" : "bg-warning",
              )}
            />
            <CardContent className="flex flex-1 items-start justify-between gap-4 p-6">
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">{item.positionTitle}</h3>
                  <Badge variant={item.status === "approved" ? "success" : "warning"}>
                    {item.status === "approved" ? "Approved by TC" : "Pending Review"}
                  </Badge>
                </div>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="size-4" />
                  {item.division}
                </p>
              </div>
              <div className="text-right">
                <Badge
                  className={cn(
                    "mb-2",
                    item.ranking === "primary"
                      ? "bg-success text-success-foreground"
                      : item.ranking === "secondary"
                        ? "bg-primary text-primary-foreground"
                        : "bg-warning text-warning-foreground",
                  )}
                >
                  {item.ranking.charAt(0).toUpperCase() + item.ranking.slice(1)} Successor
                </Badge>
                {item.date ? (
                  <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-3" />
                    Since {item.date}
                  </p>
                ) : (
                  <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    In Process
                  </p>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}
