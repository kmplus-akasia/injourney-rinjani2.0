import { useNavigate, useParams } from "react-router";
import { Building2, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button, EmptyState, PageHeader, SectionPanel } from "@rinjani/shared-ui";
import { JobTenderPageFrame } from "@/components/job-tender/JobTenderPageFrame";
import { StatusBadge } from "@/components/job-tender/StatusBadge";
import { mockApplications, mockPositions, mockTimelines } from "@/data/mockJobTenderData";

export default function ApplicationDetail() {
  const { id: applicationId } = useParams();
  const navigate = useNavigate();
  const application = mockApplications.find((a) => a.id === applicationId);
  const timelines = mockTimelines
    .filter((t) => t.applicationId === applicationId)
    .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
  const position = mockPositions.find((p) => p.id === application?.positionId);

  if (!application) {
    return (
      <JobTenderPageFrame maxWidthClassName="max-w-4xl">
        <EmptyState
          title="Application not found"
          description="This application is no longer available in the prototype."
          action={
            <Button variant="outline" onClick={() => navigate("/talent/my-applications")}>
              Back to My Applications
            </Button>
          }
        />
      </JobTenderPageFrame>
    );
  }

  return (
    <JobTenderPageFrame maxWidthClassName="max-w-4xl">
      <Button variant="ghost" className="w-fit px-0 text-muted-foreground hover:text-primary" onClick={() => navigate("/talent/my-applications")}>
        ← Back to My Applications
      </Button>

      <PageHeader
        variant="workspace"
        eyebrow="My Applications"
        title={application.positionTitle}
        description="Track the current stage and history of this internal application."
        badge={<StatusBadge status={application.status} type="application" />}
      />

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center">
          <Building2 className="mr-1.5 size-4" />
          Human Capital Division
        </span>
        <span className="inline-flex items-center">
          <MapPin className="mr-1.5 size-4" />
          Jakarta
        </span>
        {position ? <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-foreground">Grade {position.gradeJabatan}</span> : null}
        <span className="inline-flex items-center">
          <Calendar className="mr-1.5 size-4" />
          Applied {format(new Date(application.submittedAt), "d MMMM yyyy, HH:mm", { locale: id })}
        </span>
      </div>

      <SectionPanel title="Application Timeline">
        <div className="relative pl-4">
          <div className="absolute bottom-2 left-[19px] top-2 w-0.5 bg-border" />
          <div className="space-y-8">
            {timelines.map((item, index) => (
              <div key={item.id} className="relative flex gap-6">
                <div className={`z-10 mt-2 size-2.5 shrink-0 rounded-full ${index === 0 ? "bg-primary ring-4 ring-primary/20" : "bg-muted-foreground/40"}`} />
                <div className="flex-1">
                  <div className="mb-1 flex flex-col justify-between gap-1 md:flex-row md:items-center">
                    <span className={`font-semibold ${index === 0 ? "text-primary" : "text-foreground"}`}>
                      {item.toStatus.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {format(new Date(item.changedAt), "d MMM yyyy, HH:mm", { locale: id })}
                    </span>
                  </div>
                  <p className="mb-1 text-sm text-muted-foreground">{item.notes || "Status updated"}</p>
                  <p className="text-xs text-muted-foreground">by {item.changedByName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionPanel>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          className="flex-1"
          disabled={["rejected", "withdrawn", "accepted"].includes(application.status)}
        >
          Withdraw Application
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => navigate(`/talent/explore/${application.positionId}`)}>
          View Position Details
        </Button>
      </div>
    </JobTenderPageFrame>
  );
}
