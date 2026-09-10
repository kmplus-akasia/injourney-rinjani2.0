import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import {
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  PageHeader,
  SectionPanel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusBadge,
} from "@rinjani/shared-ui";
import { AdminLayout } from "../../../components/shell/AdminLayout";
import { canSubmitForApproval, isSecondaryAssignment, opportunityLabel, type OpportunityType } from "../../../lib/job-tender-admin";
import { getMissingFields, isPositionComplete } from "../../../lib/org-management";
import { createVacancy, selectablePositions } from "../../../data/jobTenderAdminData";
import { getPosition } from "../../../data/orgManagementData";

export function JobTenderCreateVacancyScreen() {
  const navigate = useNavigate();
  const positions = selectablePositions();
  const [positionId, setPositionId] = useState(positions[0]?.id ?? "");
  const [opportunityType, setOpportunityType] = useState<OpportunityType>("experience");
  const [quota, setQuota] = useState(1);
  const [startDate, setStartDate] = useState("2026-09-12");
  const [deadline, setDeadline] = useState("2026-09-26");
  const [durationStart, setDurationStart] = useState("2026-10-01");
  const [durationEnd, setDurationEnd] = useState("2026-12-31");
  const [errors, setErrors] = useState<string[]>([]);

  const position = getPosition(positionId);
  const missing = position ? getMissingFields(position) : [];
  const complete = position ? isPositionComplete(position) : false;
  const secondary = isSecondaryAssignment(opportunityType);

  const preview = useMemo(
    () => ({
      title: position?.name ?? "",
      quota,
      startDate,
      deadline,
      owner: "Ayu Lestari",
    }),
    [deadline, position?.name, quota, startDate],
  );

  function submit() {
    if (!position) return;
    const nextErrors = canSubmitForApproval(preview, position);
    setErrors(nextErrors);
    if (nextErrors.length) return;
    const vacancy = createVacancy({
      positionId,
      opportunityType,
      quota,
      startDate,
      deadline,
      durationStart: secondary ? durationStart : undefined,
      durationEnd: secondary ? durationEnd : undefined,
      owner: "Ayu Lestari",
    });
    navigate(`/talent/admin/job-tender/${vacancy.id}`);
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[var(--layout-max-width-governance)] space-y-6 px-4 pb-10 pt-6 md:px-6 lg:px-8">
        <Link to="/talent/admin/job-tender" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" /> Back to Job Tender HQ
        </Link>
        <PageHeader
          variant="governance"
          title="Create vacancy"
          description="Vacancy fields are copied from Position Master. Incomplete masters cannot be submitted for approval."
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionPanel title="Opportunity setup">
            <div className="grid gap-4">
              <Field>
                <FieldLabel>Opportunity type</FieldLabel>
                <Select value={opportunityType} onValueChange={(value) => setOpportunityType(value as OpportunityType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="experience">Experience — secondary assignment</SelectItem>
                    <SelectItem value="learning">Learning — secondary assignment</SelectItem>
                    <SelectItem value="talent_mobility">Talent Mobility — structural move</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  {secondary
                    ? "Home unit stays. Job Family may differ if project requirements are met."
                    : "Talent Mobility requires the same Job Family as the employee."}
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel>Position Master</FieldLabel>
                <Select value={positionId} onValueChange={setPositionId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Quota</FieldLabel>
                  <Input type="number" min={1} value={quota} onChange={(event) => setQuota(Number(event.target.value))} />
                </Field>
                <Field>
                  <FieldLabel>Owner</FieldLabel>
                  <Input value="Ayu Lestari" readOnly />
                </Field>
                <Field>
                  <FieldLabel>Publish start</FieldLabel>
                  <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                </Field>
                <Field>
                  <FieldLabel>Deadline</FieldLabel>
                  <Input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
                </Field>
                {secondary ? (
                  <>
                    <Field>
                      <FieldLabel>Assignment start</FieldLabel>
                      <Input type="date" value={durationStart} onChange={(event) => setDurationStart(event.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel>Assignment end</FieldLabel>
                      <Input type="date" value={durationEnd} onChange={(event) => setDurationEnd(event.target.value)} />
                    </Field>
                  </>
                ) : null}
              </div>
              {errors.map((error) => (
                <FieldError key={error}>{error}</FieldError>
              ))}
              <Button type="button" onClick={submit}>
                Save draft from Position Master
              </Button>
            </div>
          </SectionPanel>

          <SectionPanel
            title="Position validation"
            description="BR-JTA-001: vacancy can only be created from an active, complete Position Master."
            actions={<StatusBadge status={complete ? "success" : "warning"}>{complete ? "Ready" : "Blocked"}</StatusBadge>}
          >
            {position ? (
              <div className="space-y-3 text-sm">
                <p><span className="text-muted-foreground">Type</span> · {opportunityLabel(opportunityType)}</p>
                <p><span className="text-muted-foreground">Job Family</span> · {position.jobFamily ?? "Missing"}</p>
                <p><span className="text-muted-foreground">Band / tier / grade</span> · {position.band} / {position.bandTier ?? "—"} / {position.grade}</p>
                <p><span className="text-muted-foreground">Required competency</span> · {position.requiredCompetencies.join(", ") || "Missing"}</p>
                <p><span className="text-muted-foreground">Location</span> · {position.location}</p>
                {missing.length ? (
                  <p className="rounded-xl bg-warning-muted p-3 text-warning">Missing master fields: {missing.join(", ")}</p>
                ) : (
                  <p className="rounded-xl bg-success-muted p-3 text-success">Master complete. This vacancy can go to approval.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a position.</p>
            )}
          </SectionPanel>
        </div>
      </div>
    </AdminLayout>
  );
}
