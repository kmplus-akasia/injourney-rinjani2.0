import { isPositionComplete } from "../lib/org-management";
import {
  ACTIVE_APPLICATION_STAGES,
  isSecondaryAssignment,
  type ApplicantStage,
  type JobTenderApplicant,
  type JobTenderVacancy,
  type OpportunityType,
  type VacancyStatus,
} from "../lib/job-tender-admin";
import {
  emitCloseResult,
  emitInterviewInvitation,
  emitPipelineChanged,
  emitSavedJobReminder,
  emitSavedVacancyClosed,
  emitVacancyPublished,
  missingInterviewInviteFields,
  resetJobTenderNotifications,
  type InterviewInviteFields,
} from "../lib/jobTenderNotifications";
import { getPosition, listPositions } from "./orgManagementData";

const initialVacancies: JobTenderVacancy[] = [
  {
    id: "VAC-EL-001",
    positionId: "POS-DIG-LEAD",
    title: "Project Lead — Rinjani 2.0 Migration",
    opportunityType: "experience",
    status: "published",
    quota: 1,
    startDate: "2026-09-01",
    deadline: "2026-09-20",
    durationStart: "2026-10-01",
    durationEnd: "2027-03-31",
    owner: "Ayu Lestari",
    approver: "Dimas Sayyid",
    company: "InJourney Holding",
    unit: "Digital Transformation Office",
    jobFamily: "Digital & IT",
    grade: 16,
    band: "III-A",
    applicantCount: 4,
    homeUnitRemains: true,
  },
  {
    id: "VAC-EL-002",
    positionId: "POS-LRN-COACH",
    title: "Learning Coach — Leadership Lab",
    opportunityType: "learning",
    status: "pending_approval",
    quota: 2,
    startDate: "2026-09-15",
    deadline: "2026-10-05",
    durationStart: "2026-10-15",
    durationEnd: "2026-12-15",
    owner: "Ayu Lestari",
    company: "InJourney Holding",
    unit: "Corporate University",
    jobFamily: "Human Capital",
    grade: 15,
    band: "III-A",
    applicantCount: 0,
    homeUnitRemains: true,
  },
  {
    id: "VAC-TM-001",
    positionId: "POS-OPS-MGR",
    title: "Manager Airport Operations",
    opportunityType: "talent_mobility",
    status: "published",
    quota: 1,
    startDate: "2026-08-20",
    deadline: "2026-09-18",
    owner: "HCBP API",
    approver: "Dimas Sayyid",
    company: "Angkasa Pura Indonesia",
    unit: "Airport Operations CGK",
    jobFamily: "Airport Operations",
    grade: 17,
    band: "III-A",
    applicantCount: 6,
    homeUnitRemains: false,
  },
  {
    id: "VAC-TM-002",
    positionId: "POS-COM-INC",
    title: "Manager Commercial Partnership",
    opportunityType: "talent_mobility",
    status: "draft",
    quota: 1,
    startDate: "2026-09-12",
    deadline: "2026-09-30",
    owner: "Ayu Lestari",
    company: "InJourney Holding",
    unit: "Commercial",
    jobFamily: "Commercial",
    grade: 16,
    band: "III-A",
    applicantCount: 0,
    homeUnitRemains: false,
  },
  {
    id: "VAC-EL-003",
    positionId: "POS-HC-MGR",
    title: "Stretch assignment — Talent Mobility desk",
    opportunityType: "learning",
    status: "approved",
    quota: 1,
    startDate: "2026-09-11",
    deadline: "2026-09-25",
    durationStart: "2026-10-01",
    durationEnd: "2026-12-31",
    owner: "Ayu Lestari",
    approver: "Dimas Sayyid",
    company: "InJourney Holding",
    unit: "Direktorat Human Capital",
    jobFamily: "Human Capital",
    grade: 16,
    band: "III-A",
    applicantCount: 1,
    homeUnitRemains: true,
  },
];

const initialApplicants: JobTenderApplicant[] = [
  {
    id: "APP-001",
    vacancyId: "VAC-EL-001",
    employeeId: "EMP-20189",
    employeeName: "Dewi Ratnasari",
    currentPosition: "Senior Analyst Group Finance",
    jobFamily: "Finance & Accounting",
    stage: "shortlisted",
    eqs: 82.4,
    discipline: "none",
    eligible: true,
    eligibilityReason: "Project Assignment can cross Job Family. EQS and discipline gates passed.",
  },
  {
    id: "APP-002",
    vacancyId: "VAC-EL-001",
    employeeId: "EMP-20145",
    employeeName: "Siti Nurhaliza",
    currentPosition: "Manager Talent Mobility",
    jobFamily: "Human Capital",
    stage: "interview",
    eqs: 88.1,
    discipline: "none",
    eligible: true,
    eligibilityReason: "Secondary assignment Experience. Home unit remains.",
  },
  {
    id: "APP-003",
    vacancyId: "VAC-EL-001",
    employeeId: "EMP-30011",
    employeeName: "Andi Pratama",
    currentPosition: "Supervisor Ground Handling",
    jobFamily: "Airport Operations",
    stage: "submitted",
    eqs: 71.0,
    discipline: "sedang",
    eligible: false,
    eligibilityReason: "Discipline gate Sedang blocks apply. EQS is still calculated.",
  },
  {
    id: "APP-004",
    vacancyId: "VAC-TM-001",
    employeeId: "EMP-20145",
    employeeName: "Siti Nurhaliza",
    currentPosition: "Manager Talent Mobility",
    jobFamily: "Human Capital",
    stage: "under_review",
    eqs: 79.2,
    discipline: "none",
    eligible: false,
    eligibilityReason: "Talent Mobility requires the same Job Family as Airport Operations.",
  },
  {
    id: "APP-005",
    vacancyId: "VAC-TM-001",
    employeeId: "EMP-30022",
    employeeName: "Rina Wulandari",
    currentPosition: "Assistant Manager Airport Ops",
    jobFamily: "Airport Operations",
    stage: "shortlisted",
    eqs: 84.6,
    discipline: "none",
    eligible: true,
    eligibilityReason: "Same Job Family, EQS above threshold, no discipline block.",
  },
];

let vacancies = initialVacancies.map((item) => ({ ...item }));
let applicants = initialApplicants.map((item) => ({ ...item }));
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeJobTenderStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function listVacancies() {
  return vacancies;
}

export function getVacancy(id: string) {
  return vacancies.find((item) => item.id === id);
}

export function listApplicants(vacancyId?: string) {
  return vacancyId ? applicants.filter((item) => item.vacancyId === vacancyId) : applicants;
}

export function jobTenderOverview() {
  const secondary = vacancies.filter((item) => isSecondaryAssignment(item.opportunityType));
  return {
    total: vacancies.length,
    published: vacancies.filter((item) => item.status === "published").length,
    pending: vacancies.filter((item) => item.status === "pending_approval").length,
    secondary: secondary.length,
    experience: vacancies.filter((item) => item.opportunityType === "experience").length,
    learning: vacancies.filter((item) => item.opportunityType === "learning").length,
    blockedIncomplete: vacancies.filter((item) => {
      const position = getPosition(item.positionId);
      return position ? !isPositionComplete(position) : true;
    }).length,
  };
}

export function createVacancy(input: {
  positionId: string;
  opportunityType: OpportunityType;
  quota: number;
  startDate: string;
  deadline: string;
  durationStart?: string;
  durationEnd?: string;
  owner: string;
}): JobTenderVacancy {
  const position = getPosition(input.positionId);
  if (!position) {
    throw new Error("Position not found");
  }

  const vacancy: JobTenderVacancy = {
    id: `VAC-${String(vacancies.length + 1).padStart(3, "0")}`,
    positionId: position.id,
    title: position.name,
    opportunityType: input.opportunityType,
    status: "draft",
    quota: input.quota,
    startDate: input.startDate,
    deadline: input.deadline,
    durationStart: input.durationStart,
    durationEnd: input.durationEnd,
    owner: input.owner,
    company: position.company,
    unit: position.unit,
    jobFamily: position.jobFamily,
    grade: position.grade,
    band: position.band,
    applicantCount: 0,
    homeUnitRemains: isSecondaryAssignment(input.opportunityType),
  };
  vacancies = [vacancy, ...vacancies];
  notify();
  return vacancy;
}

export function setVacancyStatus(id: string, status: VacancyStatus, approvalReason?: string) {
  const previous = getVacancy(id);
  vacancies = vacancies.map((item) =>
    item.id === id
      ? {
          ...item,
          status,
          approvalReason,
          approver: status === "approved" || status === "rejected" || status === "revision_required" ? "Dimas Sayyid" : item.approver,
        }
      : item,
  );
  const vacancy = getVacancy(id);
  if (vacancy && status === "published" && previous?.status !== "published") {
    emitVacancyPublished(vacancy);
  }
  if (vacancy && (status === "closed" || status === "auto_closed") && previous && previous.status !== "closed" && previous.status !== "auto_closed") {
    emitSavedVacancyClosed(vacancy);
    sweepOpenApplicantsOnClose(vacancy);
  }
  notify();
  return vacancy;
}

function sweepOpenApplicantsOnClose(vacancy: JobTenderVacancy) {
  const openIds = applicants
    .filter((item) => item.vacancyId === vacancy.id && ACTIVE_APPLICATION_STAGES.includes(item.stage))
    .map((item) => item.id);

  applicants = applicants.map((item) =>
    openIds.includes(item.id) ? { ...item, stage: "rejected" } : item,
  );

  openIds.forEach((applicantId) => {
    const applicant = applicants.find((item) => item.id === applicantId);
    if (applicant) {
      emitCloseResult(applicant, vacancy, "rejected", "Vacancy closed");
    }
  });
}

export function moveApplicant(id: string, stage: ApplicantStage, invite?: InterviewInviteFields) {
  const applicant = applicants.find((item) => item.id === id);
  if (!applicant) {
    throw new Error("Applicant not found");
  }
  if (stage === "interview") {
    const missing = missingInterviewInviteFields(invite);
    if (missing.length > 0) {
      throw new Error(`Interview invitation requires: ${missing.join(", ")}`);
    }
  }

  const vacancy = getVacancy(applicant.vacancyId);
  applicants = applicants.map((item) => (item.id === id ? { ...item, stage } : item));
  const updated = applicants.find((item) => item.id === id);
  if (!updated || !vacancy) {
    notify();
    return updated;
  }

  emitPipelineChanged(updated, vacancy, stage);
  if (stage === "interview" && invite) {
    emitInterviewInvitation(updated, vacancy, invite);
  }
  if (stage === "accepted") {
    emitCloseResult(updated, vacancy, "accepted", "Selected for the vacancy");
  }
  if (stage === "rejected") {
    emitCloseResult(updated, vacancy, "rejected", "Not selected");
  }
  notify();
  return updated;
}

export function resetJobTenderPrototypeState() {
  vacancies = initialVacancies.map((item) => ({ ...item }));
  applicants = initialApplicants.map((item) => ({ ...item }));
  resetJobTenderNotifications();
  notify();
}

const SAVED_JOB_RECIPIENTS = ["Binavia Wardhani", "Budi Santoso"];

export function runSavedJobRemindersNow(vacancyId?: string) {
  const targets = (vacancyId ? [getVacancy(vacancyId)] : vacancies).filter(
    (item): item is JobTenderVacancy => Boolean(item) && item.status === "published",
  );
  return targets.flatMap((vacancy) =>
    SAVED_JOB_RECIPIENTS.flatMap((employeeName) => [
      emitSavedJobReminder({ vacancy, employeeName, horizon: "H-3" }),
      emitSavedJobReminder({ vacancy, employeeName, horizon: "H-1" }),
    ]),
  );
}

export function selectablePositions() {
  return listPositions().filter((item) => item.activeStatus === "active");
}
