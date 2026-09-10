import { isPositionComplete, type OrgPosition } from "./org-management";

export type OpportunityType = "talent_mobility" | "experience" | "learning";

export type VacancyStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "published"
  | "on_hold"
  | "closed"
  | "auto_closed"
  | "revision_required"
  | "rejected";

export type ApplicantStage =
  | "submitted"
  | "under_review"
  | "shortlisted"
  | "interview"
  | "offered"
  | "accepted"
  | "rejected";

export const ACTIVE_APPLICATION_STAGES: ApplicantStage[] = [
  "submitted",
  "under_review",
  "shortlisted",
  "interview",
];

export const PIPELINE_ORDER: ApplicantStage[] = [
  "submitted",
  "under_review",
  "shortlisted",
  "interview",
  "offered",
  "accepted",
];

export type JobTenderVacancy = {
  id: string;
  positionId: string;
  title: string;
  opportunityType: OpportunityType;
  status: VacancyStatus;
  quota: number;
  startDate: string;
  deadline: string;
  durationStart?: string;
  durationEnd?: string;
  owner: string;
  approver?: string;
  approvalReason?: string;
  company: string;
  unit: string;
  jobFamily: string | null;
  grade: number;
  band: string;
  applicantCount: number;
  homeUnitRemains: boolean;
};

export type JobTenderApplicant = {
  id: string;
  vacancyId: string;
  employeeId: string;
  employeeName: string;
  currentPosition: string;
  jobFamily: string;
  stage: ApplicantStage;
  eqs: number;
  discipline: "none" | "sedang" | "berat";
  eligible: boolean;
  eligibilityReason: string;
};

export function isSecondaryAssignment(type: OpportunityType): boolean {
  return type === "experience" || type === "learning";
}

export function opportunityLabel(type: OpportunityType): string {
  if (type === "talent_mobility") return "Talent Mobility";
  if (type === "experience") return "Experience";
  return "Learning";
}

export function jobFamilyGateAllows(args: {
  opportunityType: OpportunityType;
  employeeJobFamily: string;
  targetJobFamily: string | null;
}): boolean {
  if (!args.targetJobFamily) return false;
  if (isSecondaryAssignment(args.opportunityType)) return true;
  return args.employeeJobFamily === args.targetJobFamily;
}

export function canSubmitForApproval(vacancy: Pick<JobTenderVacancy, "title" | "quota" | "startDate" | "deadline" | "owner">, position: OrgPosition): string[] {
  const errors: string[] = [];
  if (!vacancy.title.trim()) errors.push("Title is required.");
  if (!vacancy.quota || vacancy.quota < 1) errors.push("Quota must be at least 1.");
  if (!vacancy.startDate) errors.push("Publication start date is required.");
  if (!vacancy.deadline) errors.push("Application deadline is required.");
  if (!vacancy.owner.trim()) errors.push("Owner is required.");
  if (!isPositionComplete(position)) {
    errors.push("Position Master is incomplete, so this vacancy cannot be published.");
  }
  return errors;
}

export function canPublish(status: VacancyStatus): boolean {
  return status === "approved";
}

export function canApplyGates(args: {
  vacancyStatus: VacancyStatus;
  deadline: string;
  now?: Date;
  discipline: "none" | "sedang" | "berat";
  activeApplications: number;
  activeLimit: number;
  opportunityType: OpportunityType;
  employeeJobFamily: string;
  targetJobFamily: string | null;
  eqs: number;
  eqsThreshold: number;
}): string[] {
  const now = args.now ?? new Date();
  const reasons: string[] = [];
  if (args.vacancyStatus !== "published") reasons.push("Vacancy is not open for applications.");
  if (new Date(args.deadline) < now) reasons.push("Application deadline has passed.");
  if (args.discipline === "sedang" || args.discipline === "berat") {
    reasons.push("Discipline gate blocks apply while EQS remains available.");
  }
  if (args.activeApplications >= args.activeLimit) {
    reasons.push(`Active application limit (${args.activeLimit}) has been reached.`);
  }
  if (!jobFamilyGateAllows(args)) {
    reasons.push("Talent Mobility requires the same Job Family.");
  }
  if (args.eqs < args.eqsThreshold) {
    reasons.push(`EQS ${args.eqs.toFixed(2)} is below the threshold ${args.eqsThreshold}.`);
  }
  return reasons;
}

export function nextPipelineStage(stage: ApplicantStage): ApplicantStage | null {
  const index = PIPELINE_ORDER.indexOf(stage);
  if (index < 0 || index >= PIPELINE_ORDER.length - 1) return null;
  return PIPELINE_ORDER[index + 1];
}
