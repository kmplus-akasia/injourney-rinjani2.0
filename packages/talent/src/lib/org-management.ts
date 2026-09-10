export const POSITION_MINIMUM_FIELDS = [
  "id",
  "name",
  "company",
  "unit",
  "grade",
  "band",
  "bandTier",
  "jobFamily",
  "activeStatus",
] as const;

export type PositionMinimumField = (typeof POSITION_MINIMUM_FIELDS)[number];

export type AssignmentKind = "primary" | "secondary";

export type OrgPosition = {
  id: string;
  name: string;
  company: string;
  entity: string;
  unit: string;
  grade: number;
  band: string;
  bandTier: number | null;
  jobFamily: string | null;
  jobRole: string;
  activeStatus: "active" | "inactive";
  ksp: boolean;
  kspReason?: string;
  incumbentId: string | null;
  incumbentName: string | null;
  vacancy: boolean;
  parentPositionId: string | null;
  managerPositionId: string | null;
  assignmentKind: AssignmentKind;
  requiredCompetencies: string[];
  requiredExperience: string;
  location: string;
  jobDescription: string;
  lastValidationDate: string;
  effectiveDate: string;
};

export type OrgAuditEntry = {
  id: string;
  objectId: string;
  objectName: string;
  field: string;
  oldValue: string;
  newValue: string;
  actor: string;
  reason: string;
  source: "sync" | "manual";
  timestamp: string;
  effectiveDate: string;
};

export function getMissingFields(position: OrgPosition): PositionMinimumField[] {
  return POSITION_MINIMUM_FIELDS.filter((field) => {
    const value = position[field];
    if (value === null || value === undefined) return true;
    if (typeof value === "string" && value.trim() === "") return true;
    return false;
  });
}

export function isPositionComplete(position: OrgPosition): boolean {
  return getMissingFields(position).length === 0 && position.activeStatus === "active";
}

export function isEligibleTalentTarget(position: OrgPosition): boolean {
  return isPositionComplete(position);
}

export function movementWithinTierCap(currentTier: number, targetTier: number, maxJump = 1): boolean {
  return Math.abs(targetTier - currentTier) <= maxJump;
}
