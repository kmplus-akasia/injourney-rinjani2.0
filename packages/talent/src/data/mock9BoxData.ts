// Mock 9-Box Data Generator based on /guidelines/Mock9BoxesData.md

import type { NineBoxCellId } from "../lib/talent/nineBoxClusters";
import { getClusterIdFromScores } from "../lib/talent/nineBoxClusters";

export type DataGapField = "performance" | "potential";

export interface NineBoxEmployee {
  id: string;
  nik: string;
  name: string;
  position: string;
  company: string;
  department: string;
  performanceScore: number;
  capacityScore: number;
  cluster: NineBoxCellId | "";
  isOverridden: boolean;
  overrideInfo?: {
    originalBox: string;
    reason: string;
    overriddenBy: string;
    overriddenDate: string;
  };
  /** Top Talent is a separate designation from High Potential (BR-TC-007). */
  isTopTalent?: boolean;
  /** Missing inputs that block a clean classification (UC-TC-01). */
  dataGaps?: DataGapField[];
  /** Prior-period cell for movement history (BR-TC-010). */
  priorPeriod?: {
    period: string;
    cluster: NineBoxCellId;
  };
}

export type CalibrationStatus = "Draft" | "Calibrated" | "Published";

export const CLASSIFICATION_PERIODS = [
  { id: "2025", label: "2025" },
  { id: "2024", label: "2024" },
] as const;

export const JOB_LEVELS = [
  { id: "bod", name: "BOD (Board of Directors)" },
  { id: "bod-1", name: "BOD-1" },
  { id: "bod-2", name: "BOD-2" },
  { id: "kj-10-11", name: "KJ 10-11" },
  { id: "kj-12-13", name: "Pratama B (KJ 12-13)" },
  { id: "kj-14-15", name: "KJ 14-15" },
  { id: "kj-16-17", name: "KJ 16-17" },
] as const;

export const COMPANIES = [
  { id: "injourney-holding", name: "InJourney Holding" },
  { id: "pt-api", name: "PT Angkasa Pura Indonesia" },
  { id: "pt-ias", name: "PT Integrasi Aviasi Solusi" },
  { id: "pt-twc", name: "PT Taman Wisata Candi" },
  { id: "pt-hin", name: "PT Hotel Indonesia Natour" },
  { id: "pt-sarinah", name: "PT Sarinah" },
] as const;

/** Deterministic hash — stable across remounts (no Math.random). */
function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(seed: number, items: readonly T[]): T {
  return items[seed % items.length];
}

const FIRST_NAMES = [
  "Andi", "Budi", "Citra", "Dewi", "Eko", "Fajar", "Gita", "Hadi",
  "Indra", "Joko", "Kartika", "Lina", "Maya", "Nina", "Oscar", "Putri",
] as const;

const LAST_NAMES = [
  "Wijaya", "Santoso", "Pratama", "Kusuma", "Halim", "Sari", "Nugroho", "Putra",
] as const;

const DEPARTMENTS = ["HR", "Finance", "Operations", "IT", "Marketing", "Strategy"] as const;

const POSITIONS = ["Manager", "Senior Manager", "Specialist", "Analyst", "GM", "VP"] as const;

const CELL_CYCLE: NineBoxCellId[] = [
  "h-h", "h-m", "h-l", "m-h", "m-m", "m-l", "l-h", "l-m", "l-l",
];

const SCORE_FOR_CELL: Record<NineBoxCellId, { performance: number; capacity: number }> = {
  "h-h": { performance: 110, capacity: 90 },
  "h-m": { performance: 105, capacity: 70 },
  "h-l": { performance: 102, capacity: 50 },
  "m-h": { performance: 90, capacity: 88 },
  "m-m": { performance: 88, capacity: 70 },
  "m-l": { performance: 85, capacity: 45 },
  "l-h": { performance: 70, capacity: 85 },
  "l-m": { performance: 65, capacity: 70 },
  "l-l": { performance: 55, capacity: 40 },
};

function buildDeterministicRoster(
  companyId: string,
  level: string,
  companyName: string,
  count: number,
): NineBoxEmployee[] {
  const base = hashSeed(`${companyId}:${level}`);
  const employees: NineBoxEmployee[] = [];

  for (let i = 0; i < count; i++) {
    const seed = hashSeed(`${companyId}:${level}:${i}`);
    const cell = CELL_CYCLE[(base + i) % CELL_CYCLE.length];
    const scores = SCORE_FOR_CELL[cell];
    const first = pick(seed, FIRST_NAMES);
    const last = pick(seed >>> 8, LAST_NAMES);
    const isGap = i === count - 1 || i === count - 2;
    const gaps: DataGapField[] | undefined = isGap
      ? i === count - 1
        ? ["performance"]
        : ["potential"]
      : undefined;

    employees.push({
      id: `${companyId}-${level}-${String(i + 1).padStart(3, "0")}`,
      nik: `${companyId.toUpperCase().replace(/-/g, "")}${10000 + i}`,
      name: `${first} ${last}`,
      position: pick(seed >>> 4, POSITIONS),
      company: companyName,
      department: pick(seed >>> 12, DEPARTMENTS),
      performanceScore: gaps?.includes("performance") ? 0 : scores.performance + (seed % 5),
      capacityScore: gaps?.includes("potential") ? 0 : scores.capacity + (seed % 4),
      cluster: gaps ? "" : cell,
      isOverridden: false,
      isTopTalent: !gaps && cell === "h-h" && i % 3 === 0,
      dataGaps: gaps,
      priorPeriod: gaps
        ? undefined
        : {
            period: "2024",
            cluster: CELL_CYCLE[(CELL_CYCLE.indexOf(cell) + 3) % CELL_CYCLE.length],
          },
    });
  }

  return employees;
}

function enrichCanonical(employees: NineBoxEmployee[]): NineBoxEmployee[] {
  return employees.map((emp, index) => {
    if (emp.dataGaps?.length) {
      return {
        ...emp,
        cluster: "",
        isTopTalent: false,
        priorPeriod: emp.priorPeriod,
      };
    }

    const cell = (emp.cluster || getClusterIdFromScores(emp.performanceScore, emp.capacityScore)) as NineBoxCellId;
    return {
      ...emp,
      cluster: cell,
      isTopTalent: emp.isTopTalent ?? (cell === "h-h" && index % 4 === 0),
      priorPeriod: emp.priorPeriod ?? {
        period: "2024",
        cluster: CELL_CYCLE[(CELL_CYCLE.indexOf(cell) + 2 + (index % 3)) % CELL_CYCLE.length],
      },
    };
  });
}

// Score ranges based on guidelines
export const SCORE_RANGES = {
  performance: {
    high: { lower: 100, upper: 120 },
    medium: { lower: 80, upper: 99.99 },
    low: { lower: 0, upper: 79.99 },
  },
  capacity: {
    high: { lower: 80, upper: 100 },
    medium: { lower: 60, upper: 79.99 },
    low: { lower: 0, upper: 59.99 },
  },
};

// PT Angkasa Pura Indonesia - BOD-2 Level (24 employees)
export const PT_API_BOD2_DATA: NineBoxEmployee[] = [
  // HIGH POTENTIAL (Perf: 100-120 | Cap: 80-100) - 4 employees
  {
    id: "api-bod2-001",
    nik: "API10001",
    name: "Bambang Wijaya",
    position: "GM Operations Pusat",
    company: "PT Angkasa Pura Indonesia",
    department: "Operations",
    performanceScore: 112.5,
    capacityScore: 92.0,
    cluster: "h-h",
    isOverridden: false,
  },
  {
    id: "api-bod2-002",
    nik: "API10002",
    name: "Dewi Lestari",
    position: "GM Finance & Accounting",
    company: "PT Angkasa Pura Indonesia",
    department: "Finance",
    performanceScore: 108.0,
    capacityScore: 88.5,
    cluster: "h-h",
    isOverridden: false,
  },
  {
    id: "api-bod2-003",
    nik: "API10003",
    name: "Rendra Kusuma",
    position: "GM Strategic Planning",
    company: "PT Angkasa Pura Indonesia",
    department: "Strategy",
    performanceScore: 105.5,
    capacityScore: 85.0,
    cluster: "h-h",
    isOverridden: false,
  },
  {
    id: "api-bod2-004",
    nik: "API10004",
    name: "Siti Nurhaliza",
    position: "GM Human Capital",
    company: "PT Angkasa Pura Indonesia",
    department: "Human Resources",
    performanceScore: 102.0,
    capacityScore: 90.5,
    cluster: "h-h",
    isOverridden: true,
    overrideInfo: {
      originalBox: "Promotable",
      reason: "Dipromosikan dari Promotable karena exceptional leadership di project transformasi digital 2024",
      overriddenBy: "Talent Manager - Dewi Kartika",
      overriddenDate: "2024-11-20",
    },
  },

  // PROMOTABLE - Variant A (Perf: 100-120 | Cap: 60-79.99) - 4 employees
  {
    id: "api-bod2-005",
    nik: "API10005",
    name: "Ahmad Fauzi",
    position: "Senior Manager IT Infrastructure",
    company: "PT Angkasa Pura Indonesia",
    department: "IT",
    performanceScore: 104.5,
    capacityScore: 75.0,
    cluster: "h-m",
    isOverridden: false,
  },
  {
    id: "api-bod2-006",
    nik: "API10006",
    name: "Linda Kartika",
    position: "Senior Manager Corporate Comm",
    company: "PT Angkasa Pura Indonesia",
    department: "Corporate Communications",
    performanceScore: 102.0,
    capacityScore: 72.5,
    cluster: "h-m",
    isOverridden: false,
  },
  {
    id: "api-bod2-007",
    nik: "API10007",
    name: "Hendra Gunawan",
    position: "Senior Manager Procurement",
    company: "PT Angkasa Pura Indonesia",
    department: "Procurement",
    performanceScore: 101.5,
    capacityScore: 68.0,
    cluster: "h-m",
    isOverridden: false,
  },
  {
    id: "api-bod2-008",
    nik: "API10008",
    name: "Ratna Sari",
    position: "Senior Manager Legal & Compliance",
    company: "PT Angkasa Pura Indonesia",
    department: "Legal",
    performanceScore: 100.5,
    capacityScore: 70.5,
    cluster: "h-m",
    isOverridden: false,
  },

  // PROMOTABLE - Variant B (Perf: 80-99.99 | Cap: 80-100) - 3 employees
  {
    id: "api-bod2-009",
    nik: "API10009",
    name: "Budi Santoso",
    position: "Senior Manager HR Operations",
    company: "PT Angkasa Pura Indonesia",
    department: "Human Resources",
    performanceScore: 95.0,
    capacityScore: 85.0,
    cluster: "m-h",
    isOverridden: false,
  },
  {
    id: "api-bod2-010",
    nik: "API10010",
    name: "Yuni Astuti",
    position: "Senior Manager Finance Control",
    company: "PT Angkasa Pura Indonesia",
    department: "Finance",
    performanceScore: 92.5,
    capacityScore: 82.0,
    cluster: "m-h",
    isOverridden: false,
  },
  {
    id: "api-bod2-011",
    nik: "API10011",
    name: "Eko Prasetyo",
    position: "Senior Manager Business Dev",
    company: "PT Angkasa Pura Indonesia",
    department: "Business Development",
    performanceScore: 88.0,
    capacityScore: 86.5,
    cluster: "m-h",
    isOverridden: true,
    overrideInfo: {
      originalBox: "High Potential",
      reason: "Diturunkan dari High Potential karena performance trend menurun Q3-Q4 2025",
      overriddenBy: "Talent Manager - Sarah Johnson",
      overriddenDate: "2024-12-01",
    },
  },

  // SOLID CONTRIBUTOR (Perf: 80-99.99 | Cap: 60-79.99) - 7 employees
  {
    id: "api-bod2-012",
    nik: "API10012",
    name: "Agus Setiawan",
    position: "Senior Manager Audit Internal",
    company: "PT Angkasa Pura Indonesia",
    department: "Audit",
    performanceScore: 92.0,
    capacityScore: 68.0,
    cluster: "m-m",
    isOverridden: false,
  },
  {
    id: "api-bod2-013",
    nik: "API10013",
    name: "Maya Indah",
    position: "Senior Manager Risk Management",
    company: "PT Angkasa Pura Indonesia",
    department: "Risk Management",
    performanceScore: 89.5,
    capacityScore: 65.5,
    cluster: "m-m",
    isOverridden: false,
  },
  {
    id: "api-bod2-014",
    nik: "API10014",
    name: "Doni Saputra",
    position: "Senior Manager Quality Assurance",
    company: "PT Angkasa Pura Indonesia",
    department: "Quality",
    performanceScore: 87.0,
    capacityScore: 62.0,
    cluster: "m-m",
    isOverridden: false,
  },
  {
    id: "api-bod2-015",
    nik: "API10015",
    name: "Fitri Handayani",
    position: "Senior Manager CSR",
    company: "PT Angkasa Pura Indonesia",
    department: "CSR",
    performanceScore: 85.5,
    capacityScore: 66.5,
    cluster: "m-m",
    isOverridden: false,
  },
  {
    id: "api-bod2-016",
    nik: "API10016",
    name: "Irwan Budiman",
    position: "Senior Manager Admin & GA",
    company: "PT Angkasa Pura Indonesia",
    department: "General Affairs",
    performanceScore: 84.0,
    capacityScore: 64.0,
    cluster: "m-m",
    isOverridden: false,
  },
  {
    id: "api-bod2-017",
    nik: "API10017",
    name: "Niken Pratiwi",
    position: "Senior Manager Internal Comm",
    company: "PT Angkasa Pura Indonesia",
    department: "Communications",
    performanceScore: 82.5,
    capacityScore: 68.5,
    cluster: "m-m",
    isOverridden: false,
  },
  {
    id: "api-bod2-018",
    nik: "API10018",
    name: "Fahmi Rahman",
    position: "Senior Manager Facility Mgmt",
    company: "PT Angkasa Pura Indonesia",
    department: "Facilities",
    performanceScore: 81.0,
    capacityScore: 63.0,
    cluster: "m-m",
    isOverridden: false,
  },

  // SOLID CONTRIBUTOR Low Performance Variant (Perf: 0-79.99 | Cap: 60-100) - 1 employee
  {
    id: "api-bod2-019",
    nik: "API10019",
    name: "Putri Ayu",
    position: "Senior Manager Training & Dev",
    company: "PT Angkasa Pura Indonesia",
    department: "Learning & Development",
    performanceScore: 75.0,
    capacityScore: 70.0,
    cluster: "l-m",
    isOverridden: true,
    overrideInfo: {
      originalBox: "Promotable",
      reason: "Diturunkan dari Promotable karena gap leadership signifikan di competency assessment",
      overriddenBy: "Talent Manager - Dewi Kartika",
      overriddenDate: "2024-11-25",
    },
  },

  // SLEEPING TIGER - Variant A (Perf: 100-120 | Cap: 0-59.99) - 3 employees
  {
    id: "api-bod2-020",
    nik: "API10020",
    name: "Joko Widodo",
    position: "Senior Manager Technical Support",
    company: "PT Angkasa Pura Indonesia",
    department: "Technical Support",
    performanceScore: 106.0,
    capacityScore: 52.0,
    cluster: "h-l",
    isOverridden: false,
  },
  {
    id: "api-bod2-021",
    nik: "API10021",
    name: "Rina Wati",
    position: "Senior Manager Customer Service",
    company: "PT Angkasa Pura Indonesia",
    department: "Customer Service",
    performanceScore: 103.5,
    capacityScore: 48.5,
    cluster: "h-l",
    isOverridden: false,
  },
  {
    id: "api-bod2-022",
    nik: "API10022",
    name: "Andi Permana",
    position: "Senior Manager Maintenance",
    company: "PT Angkasa Pura Indonesia",
    department: "Maintenance",
    performanceScore: 101.0,
    capacityScore: 55.0,
    cluster: "h-l",
    isOverridden: false,
  },

  // SLEEPING TIGER - Variant B (Perf: 80-99.99 | Cap: 0-59.99) - 2 employees
  {
    id: "api-bod2-023",
    nik: "API10023",
    name: "Sari Dewi",
    position: "Senior Manager Data Center Ops",
    company: "PT Angkasa Pura Indonesia",
    department: "IT Operations",
    performanceScore: 88.0,
    capacityScore: 50.0,
    cluster: "m-l",
    isOverridden: false,
  },
  {
    id: "api-bod2-024",
    nik: "API10024",
    name: "Rizki Anwar",
    position: "Senior Manager Security",
    company: "PT Angkasa Pura Indonesia",
    department: "Security",
    performanceScore: 85.5,
    capacityScore: 53.5,
    cluster: "m-l",
    isOverridden: true,
    overrideInfo: {
      originalBox: "Solid Contributor",
      reason: "Diturunkan dari Solid Contributor karena learning agility rendah (2.0/5.0)",
      overriddenBy: "Talent Manager - Sarah Johnson",
      overriddenDate: "2024-11-18",
    },
  },
];

// InJourney Group - BOD Level (8 employees)
export const INJOURNEY_BOD_DATA: NineBoxEmployee[] = [
  {
    id: "inj-bod-001",
    nik: "INJ00001",
    name: "Direktur SDM",
    position: "Direktur SDM",
    company: "InJourney Group",
    department: "Human Resources",
    performanceScore: 115.0,
    capacityScore: 94.0,
    cluster: "h-h",
    isOverridden: false,
  },
  {
    id: "inj-bod-002",
    nik: "API00001",
    name: "Direktur Finance",
    position: "Direktur Finance",
    company: "PT Angkasa Pura Indonesia",
    department: "Finance",
    performanceScore: 110.5,
    capacityScore: 88.0,
    cluster: "h-h",
    isOverridden: false,
  },
  {
    id: "inj-bod-003",
    nik: "ADG00001",
    name: "Direktur IT",
    position: "Direktur IT",
    company: "PT Angkasa Digital",
    department: "IT",
    performanceScore: 108.0,
    capacityScore: 91.5,
    cluster: "h-h",
    isOverridden: false,
  },
  {
    id: "inj-bod-004",
    nik: "API00002",
    name: "Direktur Operations",
    position: "Direktur Operations",
    company: "PT Angkasa Pura Indonesia",
    department: "Operations",
    performanceScore: 105.0,
    capacityScore: 75.0,
    cluster: "h-m",
    isOverridden: false,
  },
  {
    id: "inj-bod-005",
    nik: "INJ00002",
    name: "Direktur Business Dev",
    position: "Direktur Business Dev",
    company: "InJourney Group",
    department: "Business Development",
    performanceScore: 95.0,
    capacityScore: 85.0,
    cluster: "m-h",
    isOverridden: false,
  },
  {
    id: "inj-bod-006",
    nik: "AVI00001",
    name: "Direktur Marketing",
    position: "Direktur Marketing",
    company: "PT Aviavi",
    department: "Marketing",
    performanceScore: 92.0,
    capacityScore: 78.0,
    cluster: "m-h",
    isOverridden: false,
  },
  {
    id: "inj-bod-007",
    nik: "INJ00003",
    name: "Direktur Legal",
    position: "Direktur Legal",
    company: "InJourney Group",
    department: "Legal",
    performanceScore: 88.0,
    capacityScore: 72.0,
    cluster: "m-m",
    isOverridden: false,
  },
  {
    id: "inj-bod-008",
    nik: "API00003",
    name: "Direktur CSR",
    position: "Direktur CSR",
    company: "PT Angkasa Pura Indonesia",
    department: "CSR",
    performanceScore: 85.5,
    capacityScore: 68.0,
    cluster: "m-m",
    isOverridden: false,
  },
];

// InJourney Group - BOD-1 Level (15 employees)
export const INJOURNEY_BOD1_DATA: NineBoxEmployee[] = [
  {
    id: "inj-bod1-001",
    nik: "INJ01001",
    name: "VP HR Operations",
    position: "VP HR Operations",
    company: "InJourney Group",
    department: "Human Resources",
    performanceScore: 110.0,
    capacityScore: 90.0,
    cluster: "h-h",
    isOverridden: false,
  },
  {
    id: "inj-bod1-002",
    nik: "API01001",
    name: "VP Finance",
    position: "VP Finance",
    company: "PT Angkasa Pura Indonesia",
    department: "Finance",
    performanceScore: 105.0,
    capacityScore: 85.0,
    cluster: "h-h",
    isOverridden: false,
  },
  {
    id: "inj-bod1-003",
    nik: "ADG01001",
    name: "VP IT Infrastructure",
    position: "VP IT Infrastructure",
    company: "PT Angkasa Digital",
    department: "IT",
    performanceScore: 108.5,
    capacityScore: 75.0,
    cluster: "h-m",
    isOverridden: false,
  },
  {
    id: "inj-bod1-004",
    nik: "API01002",
    name: "VP Operations",
    position: "VP Operations",
    company: "PT Angkasa Pura Indonesia",
    department: "Operations",
    performanceScore: 104.0,
    capacityScore: 72.0,
    cluster: "h-m",
    isOverridden: false,
  },
  {
    id: "inj-bod1-005",
    nik: "INJ01002",
    name: "VP Strategic Planning",
    position: "VP Strategic Planning",
    company: "InJourney Group",
    department: "Strategy",
    performanceScore: 102.5,
    capacityScore: 78.0,
    cluster: "h-m",
    isOverridden: false,
  },
  {
    id: "inj-bod1-006",
    nik: "AVI01001",
    name: "VP Marketing",
    position: "VP Marketing",
    company: "PT Aviavi",
    department: "Marketing",
    performanceScore: 98.0,
    capacityScore: 82.0,
    cluster: "m-h",
    isOverridden: false,
  },
  {
    id: "inj-bod1-007",
    nik: "INJ01003",
    name: "VP Business Dev",
    position: "VP Business Dev",
    company: "InJourney Group",
    department: "Business Development",
    performanceScore: 95.5,
    capacityScore: 84.0,
    cluster: "m-h",
    isOverridden: false,
  },
  {
    id: "inj-bod1-008",
    nik: "API01003",
    name: "VP Legal",
    position: "VP Legal",
    company: "PT Angkasa Pura Indonesia",
    department: "Legal",
    performanceScore: 93.0,
    capacityScore: 80.5,
    cluster: "m-h",
    isOverridden: true,
    overrideInfo: {
      originalBox: "Solid Contributor",
      reason: "Dipromosikan dari Solid Contributor karena strong succession plan & strategic importance",
      overriddenBy: "Talent Manager - Dewi Kartika",
      overriddenDate: "2024-11-22",
    },
  },
  {
    id: "inj-bod1-009",
    nik: "API01004",
    name: "VP Finance Control",
    position: "VP Finance Control",
    company: "PT Angkasa Pura Indonesia",
    department: "Finance",
    performanceScore: 90.0,
    capacityScore: 70.0,
    cluster: "m-m",
    isOverridden: false,
  },
  {
    id: "inj-bod1-010",
    nik: "INJ01004",
    name: "VP Risk Management",
    position: "VP Risk Management",
    company: "InJourney Group",
    department: "Risk",
    performanceScore: 88.5,
    capacityScore: 68.0,
    cluster: "m-m",
    isOverridden: false,
  },
  {
    id: "inj-bod1-011",
    nik: "API01005",
    name: "VP Corporate Comm",
    position: "VP Corporate Comm",
    company: "PT Angkasa Pura Indonesia",
    department: "Communications",
    performanceScore: 87.0,
    capacityScore: 65.5,
    cluster: "m-m",
    isOverridden: false,
  },
  {
    id: "inj-bod1-012",
    nik: "AVI01002",
    name: "VP CSR",
    position: "VP CSR",
    company: "PT Aviavi",
    department: "CSR",
    performanceScore: 85.0,
    capacityScore: 72.0,
    cluster: "m-m",
    isOverridden: false,
  },
  {
    id: "inj-bod1-013",
    nik: "INJ01005",
    name: "VP Audit Internal",
    position: "VP Audit Internal",
    company: "InJourney Group",
    department: "Audit",
    performanceScore: 84.5,
    capacityScore: 68.5,
    cluster: "m-m",
    isOverridden: false,
  },
  {
    id: "inj-bod1-014",
    nik: "API01006",
    name: "VP Technical Support",
    position: "VP Technical Support",
    company: "PT Angkasa Pura Indonesia",
    department: "Technical Support",
    performanceScore: 105.0,
    capacityScore: 55.0,
    cluster: "h-l",
    isOverridden: false,
  },
  {
    id: "inj-bod1-015",
    nik: "API01007",
    name: "VP Maintenance",
    position: "VP Maintenance",
    company: "PT Angkasa Pura Indonesia",
    department: "Maintenance",
    performanceScore: 102.0,
    capacityScore: 52.5,
    cluster: "h-l",
    isOverridden: false,
  },
  // Data-gap samples (UC-TC-01) — excluded from matrix cells until inputs complete
  {
    id: "api-bod2-gap-001",
    nik: "API10991",
    name: "Yoga Prasetya",
    position: "Senior Manager Procurement",
    company: "PT Angkasa Pura Indonesia",
    department: "Procurement",
    performanceScore: 0,
    capacityScore: 72,
    cluster: "",
    isOverridden: false,
    dataGaps: ["performance"],
  },
  {
    id: "api-bod2-gap-002",
    nik: "API10992",
    name: "Nadia Rahayu",
    position: "Manager Corporate Communications",
    company: "PT Angkasa Pura Indonesia",
    department: "Communications",
    performanceScore: 95,
    capacityScore: 0,
    cluster: "",
    isOverridden: false,
    dataGaps: ["potential"],
  },
];

const COMPANY_NAME: Record<string, string> = {
  "injourney-holding": "InJourney Holding",
  "pt-api": "PT Angkasa Pura Indonesia",
  "pt-ias": "PT Integrasi Aviasi Solusi",
  "pt-twc": "PT Taman Wisata Candi",
  "pt-hin": "PT Hotel Indonesia Natour",
  "pt-sarinah": "PT Sarinah",
  // Legacy alias used by BOD / BOD-1 canonical datasets
  "injourney-group": "InJourney Holding",
};

const ROSTER_SIZE: Record<string, number> = {
  bod: 8,
  "bod-1": 12,
  "bod-2": 18,
  "kj-10-11": 16,
  "kj-12-13": 14,
  "kj-14-15": 12,
  "kj-16-17": 10,
};

/** Period → calibration status for demo cohorts (BR-TC-009). */
export function getCalibrationStatus(period: string, company: string, level: string): CalibrationStatus {
  if (period === "2024") return "Published";
  if (company === "pt-api" && level === "bod-2") return "Draft";
  if (company === "injourney-holding" || company === "injourney-group") return "Calibrated";
  return "Draft";
}

// Get employees by level and company — always a stable roster (never Math.random).
export function getEmployeesByLevel(level: string, company: string, period = "2025"): NineBoxEmployee[] {
  let base: NineBoxEmployee[];

  if (level === "bod-2" && company === "pt-api") {
    base = enrichCanonical(PT_API_BOD2_DATA);
  } else if (level === "bod" && (company === "injourney-holding" || company === "injourney-group")) {
    base = enrichCanonical(INJOURNEY_BOD_DATA);
  } else if (level === "bod-1" && (company === "injourney-holding" || company === "injourney-group")) {
    base = enrichCanonical(INJOURNEY_BOD1_DATA);
  } else {
    const companyName = COMPANY_NAME[company] ?? company;
    const size = ROSTER_SIZE[level] ?? 12;
    base = buildDeterministicRoster(company, level, companyName, size);
  }

  // Prior period view: shift each classified employee to their priorPeriod cell
  if (period === "2024") {
    return base.map((emp) => {
      if (!emp.priorPeriod || emp.dataGaps?.length) return emp;
      const scores = SCORE_FOR_CELL[emp.priorPeriod.cluster];
      return {
        ...emp,
        cluster: emp.priorPeriod.cluster,
        performanceScore: scores.performance,
        capacityScore: scores.capacity,
        isOverridden: false,
        overrideInfo: undefined,
      };
    });
  }

  return base;
}

// Get cluster distribution stats
export function getClusterStats(employees: NineBoxEmployee[]) {
  const classified = employees.filter((e) => e.cluster);
  const total = classified.length;
  const clusters = {
    "h-h": classified.filter((e) => e.cluster === "h-h").length,
    "h-m": classified.filter((e) => e.cluster === "h-m").length,
    "h-l": classified.filter((e) => e.cluster === "h-l").length,
    "m-h": classified.filter((e) => e.cluster === "m-h").length,
    "m-m": classified.filter((e) => e.cluster === "m-m").length,
    "m-l": classified.filter((e) => e.cluster === "m-l").length,
    "l-h": classified.filter((e) => e.cluster === "l-h").length,
    "l-m": classified.filter((e) => e.cluster === "l-m").length,
    "l-l": classified.filter((e) => e.cluster === "l-l").length,
  };

  const overrideCount = employees.filter((e) => e.isOverridden).length;

  return {
    total,
    clusters,
    overrideCount,
    overrideRate: total === 0 ? "0.0" : ((overrideCount / total) * 100).toFixed(1),
    gapCount: employees.filter((e) => (e.dataGaps?.length ?? 0) > 0).length,
  };
}
