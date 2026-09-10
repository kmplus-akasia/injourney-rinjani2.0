import {
  getMissingFields,
  isPositionComplete,
  type OrgAuditEntry,
  type OrgPosition,
} from "../lib/org-management";

export const orgBandTiers = [
  { band: "V", tier: 5, gradeRange: "21–24", status: "active" },
  { band: "IV", tier: 4, gradeRange: "18–20", status: "active" },
  { band: "III-A", tier: 3, gradeRange: "15–17", status: "active" },
  { band: "III-B", tier: 3, gradeRange: "13–14", status: "active" },
  { band: "II", tier: 2, gradeRange: "10–12", status: "active" },
];

export const orgJobFamilies = [
  { id: "JF-HC", name: "Human Capital", related: ["Commercial"] },
  { id: "JF-FIN", name: "Finance & Accounting", related: ["Commercial"] },
  { id: "JF-OPS", name: "Airport Operations", related: ["Aviation Services"] },
  { id: "JF-DIG", name: "Digital & IT", related: ["Human Capital"] },
  { id: "JF-COM", name: "Commercial", related: ["Human Capital", "Finance & Accounting"] },
  { id: "JF-AVS", name: "Aviation Services", related: ["Airport Operations"] },
];

const initialPositions: OrgPosition[] = [
  {
    id: "POS-HC-VP",
    name: "VP Human Capital Strategy",
    company: "InJourney Holding",
    entity: "InJourney",
    unit: "Direktorat Human Capital",
    grade: 22,
    band: "V",
    bandTier: 5,
    jobFamily: "Human Capital",
    jobRole: "HC Strategy",
    activeStatus: "active",
    ksp: true,
    kspReason: "Group talent policy owner and Talent Committee Chair position.",
    incumbentId: "EMP-10001",
    incumbentName: "Dimas Sayyid",
    vacancy: false,
    parentPositionId: null,
    managerPositionId: null,
    assignmentKind: "primary",
    requiredCompetencies: ["Strategic Thinking", "Leadership", "Stakeholder Management"],
    requiredExperience: "12 years HC / organization design",
    location: "Jakarta",
    jobDescription: "Leads group HC strategy, talent policy, and Talent Committee governance.",
    lastValidationDate: "2026-09-08",
    effectiveDate: "2026-01-01",
  },
  {
    id: "POS-HC-GM",
    name: "GM Talent Management",
    company: "InJourney Holding",
    entity: "InJourney",
    unit: "Direktorat Human Capital",
    grade: 18,
    band: "IV",
    bandTier: 4,
    jobFamily: "Human Capital",
    jobRole: "Talent Management",
    activeStatus: "active",
    ksp: true,
    kspReason: "Owns succession slate and Talent Pool health.",
    incumbentId: "EMP-10032",
    incumbentName: "Bambang Hartono",
    vacancy: false,
    parentPositionId: "POS-HC-VP",
    managerPositionId: "POS-HC-VP",
    assignmentKind: "primary",
    requiredCompetencies: ["Leadership", "Decision Making", "Developing Others"],
    requiredExperience: "10 years talent / succession",
    location: "Jakarta",
    jobDescription: "Runs talent pool, classification, and succession operations for the group.",
    lastValidationDate: "2026-09-08",
    effectiveDate: "2026-01-01",
  },
  {
    id: "POS-HC-MGR",
    name: "Manager Talent Mobility",
    company: "InJourney Holding",
    entity: "InJourney",
    unit: "Direktorat Human Capital",
    grade: 16,
    band: "III-A",
    bandTier: 3,
    jobFamily: "Human Capital",
    jobRole: "Talent Mobility",
    activeStatus: "active",
    ksp: false,
    incumbentId: "EMP-20145",
    incumbentName: "Siti Nurhaliza",
    vacancy: false,
    parentPositionId: "POS-HC-GM",
    managerPositionId: "POS-HC-GM",
    assignmentKind: "primary",
    requiredCompetencies: ["Leadership", "Communication", "Project Management"],
    requiredExperience: "7 years HC operations",
    location: "Jakarta",
    jobDescription: "Manages internal mobility, job tender eligibility, and secondary assignment tracking.",
    lastValidationDate: "2026-09-07",
    effectiveDate: "2026-01-01",
  },
  {
    id: "POS-DIG-LEAD",
    name: "Project Lead — Rinjani 2.0 Migration",
    company: "InJourney Holding",
    entity: "InJourney",
    unit: "Digital Transformation Office",
    grade: 16,
    band: "III-A",
    bandTier: 3,
    jobFamily: "Digital & IT",
    jobRole: "Product Delivery",
    activeStatus: "active",
    ksp: false,
    incumbentId: "EMP-20145",
    incumbentName: "Siti Nurhaliza",
    vacancy: true,
    parentPositionId: "POS-HC-GM",
    managerPositionId: "POS-HC-GM",
    assignmentKind: "secondary",
    requiredCompetencies: ["Project Management", "Digital Literacy", "Stakeholder Management"],
    requiredExperience: "Delivery of enterprise HR systems",
    location: "Jakarta",
    jobDescription: "Temporary project assignment to lead Rinjani 2.0 cutover for talent modules.",
    lastValidationDate: "2026-09-08",
    effectiveDate: "2026-03-01",
  },
  {
    id: "POS-OPS-MGR",
    name: "Manager Airport Operations",
    company: "Angkasa Pura Indonesia",
    entity: "API",
    unit: "Airport Operations CGK",
    grade: 17,
    band: "III-A",
    bandTier: 3,
    jobFamily: "Airport Operations",
    jobRole: "Airport Operations",
    activeStatus: "active",
    ksp: true,
    kspReason: "Critical operations continuity role.",
    incumbentId: null,
    incumbentName: null,
    vacancy: true,
    parentPositionId: "POS-HC-GM",
    managerPositionId: "POS-HC-GM",
    assignmentKind: "primary",
    requiredCompetencies: ["Operational Excellence", "Leadership", "Decision Making"],
    requiredExperience: "8 years airport operations",
    location: "Tangerang",
    jobDescription: "Owns day-to-day airport operations performance for CGK.",
    lastValidationDate: "2026-09-06",
    effectiveDate: "2026-01-01",
  },
  {
    id: "POS-FIN-ANL",
    name: "Senior Analyst Group Finance",
    company: "InJourney Holding",
    entity: "InJourney",
    unit: "Group Finance",
    grade: 14,
    band: "III-B",
    bandTier: 3,
    jobFamily: "Finance & Accounting",
    jobRole: "Financial Analysis",
    activeStatus: "active",
    ksp: false,
    incumbentId: "EMP-20189",
    incumbentName: "Dewi Ratnasari",
    vacancy: false,
    parentPositionId: "POS-HC-GM",
    managerPositionId: "POS-HC-GM",
    assignmentKind: "primary",
    requiredCompetencies: ["Financial Acumen", "Analytical Thinking", "Communication"],
    requiredExperience: "5 years group finance",
    location: "Jakarta",
    jobDescription: "Produces group financial analysis used by Talent Committee and HQ planning.",
    lastValidationDate: "2026-09-05",
    effectiveDate: "2026-01-01",
  },
  {
    id: "POS-LRN-COACH",
    name: "Learning Coach — Leadership Lab",
    company: "InJourney Holding",
    entity: "InJourney",
    unit: "Corporate University",
    grade: 15,
    band: "III-A",
    bandTier: 3,
    jobFamily: "Human Capital",
    jobRole: "Learning Facilitation",
    activeStatus: "active",
    ksp: false,
    incumbentId: null,
    incumbentName: null,
    vacancy: true,
    parentPositionId: "POS-HC-GM",
    managerPositionId: "POS-HC-GM",
    assignmentKind: "secondary",
    requiredCompetencies: ["Developing Others", "Communication", "Leadership"],
    requiredExperience: "Facilitation of leadership programs",
    location: "Jakarta",
    jobDescription: "Secondary learning assignment to coach high-potential managers for two quarters.",
    lastValidationDate: "2026-09-08",
    effectiveDate: "2026-04-01",
  },
  {
    id: "POS-COM-INC",
    name: "Manager Commercial Partnership",
    company: "InJourney Holding",
    entity: "InJourney",
    unit: "Commercial",
    grade: 16,
    band: "III-A",
    bandTier: null,
    jobFamily: "Commercial",
    jobRole: "Partnership",
    activeStatus: "active",
    ksp: false,
    incumbentId: null,
    incumbentName: null,
    vacancy: true,
    parentPositionId: "POS-HC-GM",
    managerPositionId: "POS-HC-GM",
    assignmentKind: "primary",
    requiredCompetencies: ["Stakeholder Management", "Commercial Acumen"],
    requiredExperience: "6 years commercial partnerships",
    location: "Jakarta",
    jobDescription: "Drives commercial partnerships. Band tier is missing, so Talent modules cannot select this position.",
    lastValidationDate: "2026-09-09",
    effectiveDate: "2026-01-01",
  },
  {
    id: "POS-IAS-CREW",
    name: "Supervisor Ground Handling",
    company: "InJourney Aviation Services",
    entity: "IAS",
    unit: "Ground Services",
    grade: 12,
    band: "II",
    bandTier: 2,
    jobFamily: null,
    jobRole: "Ground Handling",
    activeStatus: "active",
    ksp: false,
    incumbentId: "EMP-30011",
    incumbentName: "Andi Pratama",
    vacancy: false,
    parentPositionId: "POS-OPS-MGR",
    managerPositionId: "POS-OPS-MGR",
    assignmentKind: "primary",
    requiredCompetencies: ["Operational Excellence"],
    requiredExperience: "4 years ground handling",
    location: "Tangerang",
    jobDescription: "Supervises ground handling crews. Job Family is missing, so this position is incomplete.",
    lastValidationDate: "2026-09-09",
    effectiveDate: "2026-01-01",
  },
];

const initialAudits: OrgAuditEntry[] = [
  {
    id: "AUD-OM-001",
    objectId: "POS-HC-GM",
    objectName: "GM Talent Management",
    field: "ksp",
    oldValue: "false",
    newValue: "true",
    actor: "Ayu Lestari (OM Admin)",
    reason: "Confirmed as Key Strategic Position for 2026 succession board.",
    source: "manual",
    timestamp: "2026-09-08T09:12:00Z",
    effectiveDate: "2026-09-08",
  },
  {
    id: "AUD-OM-002",
    objectId: "POS-DIG-LEAD",
    objectName: "Project Lead — Rinjani 2.0 Migration",
    field: "assignmentKind",
    oldValue: "primary",
    newValue: "secondary",
    actor: "System sync HRIS-2026-09",
    reason: "Secondary assignment created from project staffing file.",
    source: "sync",
    timestamp: "2026-09-03T02:40:00Z",
    effectiveDate: "2026-03-01",
  },
  {
    id: "AUD-OM-003",
    objectId: "POS-COM-INC",
    objectName: "Manager Commercial Partnership",
    field: "bandTier",
    oldValue: "3",
    newValue: "",
    actor: "System sync HRIS-2026-09",
    reason: "Band mapping dropped during IAS master refresh.",
    source: "sync",
    timestamp: "2026-09-09T01:18:00Z",
    effectiveDate: "2026-09-09",
  },
];

let positions = initialPositions.map((item) => ({ ...item }));
let audits = [...initialAudits];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeOrgStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function listPositions() {
  return positions;
}

export function getPosition(id: string) {
  return positions.find((item) => item.id === id);
}

export function listAudits() {
  return audits;
}

export function positionReadiness(position: OrgPosition) {
  const missingFields = getMissingFields(position);
  return {
    complete: isPositionComplete(position),
    missingFields,
    impactedModules: missingFields.length
      ? ["Career Aspiration", "Job Tender", "Succession Planning", "EQS target position"]
      : [],
  };
}

export function orgOverview() {
  const complete = positions.filter((item) => isPositionComplete(item)).length;
  const incomplete = positions.length - complete;
  const ksp = positions.filter((item) => item.ksp).length;
  const secondary = positions.filter((item) => item.assignmentKind === "secondary").length;
  const vacant = positions.filter((item) => item.vacancy).length;
  return { total: positions.length, complete, incomplete, ksp, secondary, vacant };
}

export function updatePosition(
  id: string,
  patch: Partial<OrgPosition>,
  meta: { actor: string; reason: string; source?: "sync" | "manual" },
) {
  const current = positions.find((item) => item.id === id);
  if (!current) return null;

  const next = { ...current, ...patch, lastValidationDate: new Date().toISOString().slice(0, 10) };
  positions = positions.map((item) => (item.id === id ? next : item));

  (Object.keys(patch) as Array<keyof OrgPosition>).forEach((field) => {
    const oldValue = String(current[field] ?? "");
    const newValue = String(next[field] ?? "");
    if (oldValue === newValue) return;
    audits = [
      {
        id: `AUD-OM-${String(audits.length + 1).padStart(3, "0")}`,
        objectId: current.id,
        objectName: current.name,
        field: String(field),
        oldValue,
        newValue,
        actor: meta.actor,
        reason: meta.reason,
        source: meta.source ?? "manual",
        timestamp: new Date().toISOString(),
        effectiveDate: next.effectiveDate,
      },
      ...audits,
    ];
  });

  notify();
  return next;
}
