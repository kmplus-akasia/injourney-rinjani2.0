import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import {
  Badge,
  Button,
  PageHeader,
  SectionPanel,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@rinjani/shared-ui";
import { AdminLayout } from "../../../components/shell/AdminLayout";
import { canPublish, isSecondaryAssignment, nextPipelineStage, opportunityLabel } from "../../../lib/job-tender-admin";
import { isPositionComplete } from "../../../lib/org-management";
import { getPosition } from "../../../data/orgManagementData";
import {
  getVacancy,
  listApplicants,
  moveApplicant,
  setVacancyStatus,
  subscribeJobTenderStore,
} from "../../../data/jobTenderAdminData";

export function JobTenderVacancyDetailScreen() {
  const { id = "" } = useParams();
  const [, setTick] = useState(0);

  useEffect(() => subscribeJobTenderStore(() => setTick((value) => value + 1)), []);

  const vacancy = getVacancy(id);
  const position = vacancy ? getPosition(vacancy.positionId) : undefined;
  const applicants = listApplicants(id);

  if (!vacancy || !position) {
    return (
      <AdminLayout>
        <div className="p-8">Vacancy not found.</div>
      </AdminLayout>
    );
  }

  const complete = isPositionComplete(position);
  const secondary = isSecondaryAssignment(vacancy.opportunityType);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[var(--layout-max-width-governance)] space-y-6 px-4 pb-10 pt-6 md:px-6 lg:px-8">
        <Link to="/talent/admin/job-tender" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" /> Job Tender HQ
        </Link>
        <PageHeader
          variant="governance"
          eyebrow={vacancy.id}
          title={vacancy.title}
          description={`${vacancy.company} · ${vacancy.unit} · ${secondary ? "Home unit remains during the assignment." : "Structural move."}`}
          badge={<StatusBadge status={vacancy.status === "published" ? "success" : "warning"}>{vacancy.status.replaceAll("_", " ")}</StatusBadge>}
          actions={
            <div className="flex flex-wrap gap-2">
              {vacancy.status === "draft" || vacancy.status === "revision_required" ? (
                <Button type="button" variant="outline" onClick={() => setVacancyStatus(vacancy.id, complete ? "pending_approval" : "draft")}>
                  Submit approval
                </Button>
              ) : null}
              {vacancy.status === "pending_approval" ? (
                <>
                  <Button type="button" variant="outline" onClick={() => setVacancyStatus(vacancy.id, "revision_required", "Need duration and quota confirmation.")}>
                    Request revision
                  </Button>
                  <Button type="button" onClick={() => setVacancyStatus(vacancy.id, "approved", "Approved for marketplace publish.")}>
                    Approve
                  </Button>
                </>
              ) : null}
              {canPublish(vacancy.status) ? (
                <Button type="button" disabled={!complete} onClick={() => setVacancyStatus(vacancy.id, "published")}>
                  Publish
                </Button>
              ) : null}
              {vacancy.status === "published" ? (
                <Button type="button" variant="outline" onClick={() => setVacancyStatus(vacancy.id, "closed")}>
                  Close
                </Button>
              ) : null}
            </div>
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <SectionPanel title="Opportunity">
            <div className="space-y-2 text-sm">
              <p><Badge variant={secondary ? "info" : "neutral"}>{opportunityLabel(vacancy.opportunityType)}</Badge></p>
              <p>Quota {vacancy.quota} · Deadline {vacancy.deadline}</p>
              {secondary ? <p>Duration {vacancy.durationStart} → {vacancy.durationEnd}</p> : null}
              <p>Owner {vacancy.owner}{vacancy.approver ? ` · Approver ${vacancy.approver}` : ""}</p>
              {vacancy.approvalReason ? <p className="text-muted-foreground">{vacancy.approvalReason}</p> : null}
            </div>
          </SectionPanel>
          <SectionPanel title="Position Master">
            <div className="space-y-2 text-sm">
              <Link to={`/talent/org-management/positions/${position.id}`} className="font-medium text-primary hover:underline">
                {position.name}
              </Link>
              <p>{position.jobFamily ?? "Job Family missing"} · Band {position.band} · Grade {position.grade}</p>
              <p>{position.requiredCompetencies.join(", ")}</p>
              <StatusBadge status={complete ? "success" : "warning"}>{complete ? "Complete" : "Cannot publish"}</StatusBadge>
            </div>
          </SectionPanel>
          <SectionPanel title="Job Family gate">
            <p className="text-sm text-muted-foreground">
              {secondary
                ? "Experience & Learning can cross Job Family when project requirements are met."
                : "Talent Mobility requires the same Job Family. Failed applicants stay visible with a business reason."}
            </p>
          </SectionPanel>
        </div>

        <SectionPanel title="Applicant pipeline" description="Stages: Submitted → Under Review → Shortlisted → Interview → Offered → Accepted / Rejected.">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>EQS</TableHead>
                <TableHead>Eligibility</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applicants.map((applicant) => {
                const next = nextPipelineStage(applicant.stage);
                return (
                  <TableRow key={applicant.id}>
                    <TableCell>
                      <p className="font-medium">{applicant.employeeName}</p>
                      <p className="text-xs text-muted-foreground">{applicant.currentPosition} · {applicant.jobFamily}</p>
                    </TableCell>
                    <TableCell>{applicant.eqs.toFixed(1)}</TableCell>
                    <TableCell>
                      <StatusBadge status={applicant.eligible ? "success" : "destructive"}>{applicant.eligible ? "Eligible" : "Blocked"}</StatusBadge>
                      <p className="mt-1 max-w-xs text-xs text-muted-foreground">{applicant.eligibilityReason}</p>
                    </TableCell>
                    <TableCell className="capitalize">{applicant.stage.replaceAll("_", " ")}</TableCell>
                    <TableCell>
                      {next && applicant.eligible ? (
                        <Button type="button" size="sm" variant="outline" onClick={() => moveApplicant(applicant.id, next)}>
                          Move to {next.replaceAll("_", " ")}
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
              {applicants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No applicants yet. Publish the vacancy to start the marketplace pipeline.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </SectionPanel>
      </div>
    </AdminLayout>
  );
}
