import { eqsKompetensi, type CompetencyItem } from "../lib/competency-assessment";

export type CompetencyCycleStatus = "open" | "submitted" | "published";

export type CompetencyCycle = {
  id: string;
  name: string;
  description: string;
  targetPositionId: string;
  targetPositionName: string;
  dueDate: string;
  status: CompetencyCycleStatus;
};

export const competencyCatalog: Array<Omit<CompetencyItem, "individualLevel" | "evidence">> = [
  { competencyId: "comp-ldr", competencyName: "Leadership", cluster: "Managerial", requiredLevel: 4 },
  { competencyId: "comp-dec", competencyName: "Decision Making", cluster: "Managerial", requiredLevel: 4 },
  { competencyId: "comp-dev", competencyName: "Developing Others", cluster: "Managerial", requiredLevel: 3 },
  { competencyId: "comp-com", competencyName: "Communication", cluster: "Core", requiredLevel: 4 },
  { competencyId: "comp-pm", competencyName: "Project Management", cluster: "Core", requiredLevel: 3 },
  { competencyId: "comp-dig", competencyName: "Digital Literacy", cluster: "Core", requiredLevel: 3 },
  { competencyId: "comp-stk", competencyName: "Stakeholder Management", cluster: "Core", requiredLevel: 4 },
];

export const competencyCycles: CompetencyCycle[] = [
  {
    id: "CA-2026-Q3",
    name: "Self Assessment Q3 2026",
    description: "Rate your current level against the competency profile of Manager Talent Mobility.",
    targetPositionId: "POS-HC-MGR",
    targetPositionName: "Manager Talent Mobility",
    dueDate: "2026-09-18",
    status: "open",
  },
  {
    id: "CA-2026-Q1",
    name: "Self Assessment Q1 2026",
    description: "Published evaluation report for the previous cycle.",
    targetPositionId: "POS-HC-MGR",
    targetPositionName: "Manager Talent Mobility",
    dueDate: "2026-03-15",
    status: "published",
  },
];

const defaultAnswers: Record<string, CompetencyItem[]> = {
  "CA-2026-Q3": competencyCatalog.map((item) => ({
    ...item,
    individualLevel: item.competencyId === "comp-dig" ? 2 : item.competencyId === "comp-pm" ? 2 : 3,
    evidence: "",
  })),
  "CA-2026-Q1": competencyCatalog.map((item) => ({
    ...item,
    individualLevel:
      item.competencyId === "comp-dig" ? 2 : item.competencyId === "comp-ldr" ? 3 : item.requiredLevel,
    evidence: "Prior cycle evidence imported from LMS and manager notes.",
  })),
};

let answers = structuredClone(defaultAnswers);
const submitted = new Set<string>(["CA-2026-Q1"]);
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeCompetencyStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCycle(id: string) {
  return competencyCycles.find((item) => item.id === id);
}

export function getAnswers(cycleId: string) {
  return answers[cycleId] ?? [];
}

export function saveAnswers(cycleId: string, next: CompetencyItem[]) {
  answers = { ...answers, [cycleId]: next };
  notify();
}

export function submitCycle(cycleId: string) {
  submitted.add(cycleId);
  const cycle = competencyCycles.find((item) => item.id === cycleId);
  if (cycle) cycle.status = "published";
  notify();
}

export function isSubmitted(cycleId: string) {
  return submitted.has(cycleId);
}

export function evaluationFor(cycleId: string) {
  const items = getAnswers(cycleId);
  return {
    items,
    eqs: eqsKompetensi(items),
    gapCount: items.filter((item) => item.individualLevel < item.requiredLevel).length,
  };
}

export const hqEvaluationRows = [
  {
    employee: "Siti Nurhaliza",
    position: "Manager Talent Mobility",
    cycle: "Self Assessment Q1 2026",
    eqs: 86.25,
    gaps: 2,
    status: "Published",
  },
  {
    employee: "Dewi Ratnasari",
    position: "Senior Analyst Group Finance",
    cycle: "Self Assessment Q1 2026",
    eqs: 91.5,
    gaps: 1,
    status: "Published",
  },
  {
    employee: "Andi Pratama",
    position: "Supervisor Ground Handling",
    cycle: "Self Assessment Q3 2026",
    eqs: 64.0,
    gaps: 4,
    status: "In progress",
  },
];
