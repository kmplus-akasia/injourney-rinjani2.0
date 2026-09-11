/**
 * HQ IDP Persetujuan queue data.
 * Includes a large synthetic set so the admin queue can be stress-tested at thousands of rows.
 */

export type ApprovalStage = "awaiting_manager" | "awaiting_hcbp" | "active" | "revision";
export type InitiationSource = "self" | "manager" | "system" | "admin_bulk";
export type PgsAccess = "eligible" | "blocked" | "n/a";

/** Empat tipe aktivitas resmi (BR-IDPA-002 / BR-IDP-003). */
export type ProposedActivityType =
  | "pelatihan_formal"
  | "mentoring_coaching"
  | "penugasan_kerja"
  | "belajar_mandiri";

export type ProposedIdpItem = {
  id: string;
  title: string;
  activityType: ProposedActivityType;
  reasonTag: string;
  durationHours: number;
  targetDate: string;
  priority: "tinggi" | "sedang" | "rendah";
  evidenceRequired: string;
  targetOutput: string;
  competencyFocus: string;
  notes?: string;
};

export type ApprovalQueueItem = {
  id: string;
  employeeName: string;
  position: string;
  organization: string;
  jobFamily: string;
  managerName: string;
  managerRole: "definitif" | "pgs";
  pgsAccess: PgsAccess;
  pgsNote?: string;
  stage: ApprovalStage;
  source: InitiationSource;
  hours: number;
  activityCount: number;
  reasonTags: string[];
  submittedAt: string;
  waitingDays: number;
  slaBreached: boolean;
  hcbpUnit?: string;
  notes?: string;
};

export type ApprovalConfigState = {
  managerApprovalRequired: boolean;
  hcbpReviewOptional: boolean;
  hcbpReviewEnabled: boolean;
  pgsMinMonths: number;
  allowAdminSubstanceOverride: boolean;
};

export const defaultApprovalConfig: ApprovalConfigState = {
  managerApprovalRequired: true,
  hcbpReviewOptional: true,
  hcbpReviewEnabled: true,
  pgsMinMonths: 1,
  allowAdminSubstanceOverride: false,
};

export const ACTIVITY_TYPE_LABEL: Record<ProposedActivityType, string> = {
  pelatihan_formal: "Pelatihan Formal",
  mentoring_coaching: "Mentoring-Coaching",
  penugasan_kerja: "Penugasan Kerja",
  belajar_mandiri: "Belajar Mandiri",
};

export const EVIDENCE_BY_TYPE: Record<ProposedActivityType, string> = {
  pelatihan_formal: "Sertifikat / bukti kelulusan dari sistem pembelajaran",
  mentoring_coaching: "Log sesi mentoring atau coaching",
  penugasan_kerja: "Keluaran penugasan (laporan, deliverable)",
  belajar_mandiri: "Log pembelajaran mandiri",
};

const ORGS = [
  "PT Angkasa Pura I",
  "PT Angkasa Pura II",
  "InJourney Holding",
  "PT Hotel Indonesia Natour",
  "PT Sarinah",
  "PT Taman Wisata Candi",
] as const;

const JOB_FAMILIES = [
  "Human Capital",
  "Finance & Accounting",
  "Information Technology",
  "Operations",
  "Marketing & Sales",
  "Legal & Compliance",
] as const;

const POSITIONS = [
  "HR Specialist",
  "Finance Analyst",
  "IT Officer",
  "Ops Supervisor",
  "Marketing Associate",
  "Legal Officer",
  "Airport Ops Officer",
  "Guest Experience Lead",
] as const;

const FIRST_NAMES = [
  "Siti",
  "Andi",
  "Farah",
  "Maya",
  "Gilang",
  "Lestari",
  "Rudi",
  "Nadia",
  "Budi",
  "Dewi",
  "Rina",
  "Ahmad",
  "Putri",
  "Hendra",
  "Citra",
  "Fajar",
  "Intan",
  "Yoga",
  "Salsa",
  "Dimas",
] as const;

const LAST_NAMES = [
  "Rahma",
  "Wijaya",
  "Nabila",
  "Putri",
  "Saputra",
  "Anggraini",
  "Hermawan",
  "Salsabila",
  "Santoso",
  "Kartika",
  "Kusuma",
  "Dahlan",
  "Pratama",
  "Aditya",
  "Mahendra",
  "Lestari",
  "Gunawan",
  "Safitri",
  "Nugroho",
  "Halim",
] as const;

const MANAGERS = [
  "Dewi Kartika",
  "Ahmad Dahlan",
  "Rina Kusuma",
  "Bagas Pratama",
  "Surya Aditya",
  "Nina Maharani",
  "Teguh Santoso",
  "Lina Oktaviani",
] as const;

const REASON_POOL = [
  ["Pemenuhan Gap Kompetensi"],
  ["Aspirasi Karier"],
  ["Perbaikan Kinerja"],
  ["Pemenuhan Gap Kompetensi", "Aspirasi Karier"],
  ["InJourney Society FIRST Class"],
  ["Keunggulan Layanan"],
] as const;

const ACTIVITY_CATALOG: Array<{
  type: ProposedActivityType;
  title: string;
  hours: number;
  competency: string;
  output: string;
}> = [
  {
    type: "pelatihan_formal",
    title: "Strategic Thinking for Managers",
    hours: 16,
    competency: "Kepemimpinan",
    output: "Sertifikat kelulusan dan rencana penerapan 30 hari",
  },
  {
    type: "pelatihan_formal",
    title: "Advanced Budgeting & Forecasting",
    hours: 16,
    competency: "Analisis Keuangan",
    output: "Sertifikat dan model forecast unit",
  },
  {
    type: "pelatihan_formal",
    title: "Digital Transformation Fundamentals",
    hours: 8,
    competency: "Literasi Digital",
    output: "Sertifikat modul digital dasar",
  },
  {
    type: "mentoring_coaching",
    title: "Mentoring dengan Senior Manager",
    hours: 12,
    competency: "Kepemimpinan",
    output: "Ringkasan 6 sesi mentoring",
  },
  {
    type: "mentoring_coaching",
    title: "Coaching komunikasi stakeholder",
    hours: 8,
    competency: "Komunikasi",
    output: "Log coaching dan rencana tindak lanjut",
  },
  {
    type: "penugasan_kerja",
    title: "Pimpin proyek perbaikan proses unit",
    hours: 20,
    competency: "Manajemen Proyek",
    output: "Laporan proyek dan rekomendasi proses",
  },
  {
    type: "penugasan_kerja",
    title: "Rotasi singkat ke fungsi lintas unit",
    hours: 24,
    competency: "Pemahaman Bisnis",
    output: "Laporan pembelajaran rotasi",
  },
  {
    type: "belajar_mandiri",
    title: "Belajar mandiri HR Analytics",
    hours: 10,
    competency: "Analisis Data SDM",
    output: "Ringkasan bacaan dan studi kasus",
  },
  {
    type: "belajar_mandiri",
    title: "Studi kasus service excellence bandara",
    hours: 6,
    competency: "Keunggulan Layanan",
    output: "Catatan refleksi dan usulan perbaikan",
  },
];

const STAGES: ApprovalStage[] = ["awaiting_manager", "awaiting_manager", "awaiting_manager", "awaiting_hcbp", "revision", "active"];
const SOURCES: InitiationSource[] = ["self", "self", "manager", "system", "admin_bulk"];
const PRIORITIES: Array<ProposedIdpItem["priority"]> = ["tinggi", "sedang", "rendah"];

function pick<T>(list: readonly T[], index: number): T {
  return list[index % list.length]!;
}

function hashId(id: string): number {
  return Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

/** Daftar butir IDP yang diajukan — dihasilkan per proposal untuk panel detail. */
export function getProposedItemsForApproval(item: ApprovalQueueItem): ProposedIdpItem[] {
  const seed = hashId(item.id);
  const count = Math.max(2, Math.min(item.activityCount || 3, 5));
  const items: ProposedIdpItem[] = [];

  for (let index = 0; index < count; index += 1) {
    const catalog = pick(ACTIVITY_CATALOG, seed + index * 3);
    const reasonTag = pick(item.reasonTags.length > 0 ? item.reasonTags : ["Pemenuhan Gap Kompetensi"], seed + index);
    const month = ((seed + index) % 9) + 3;
    const day = ((seed + index * 5) % 27) + 1;
    items.push({
      id: `${item.id}-item-${index + 1}`,
      title: catalog.title,
      activityType: catalog.type,
      reasonTag,
      durationHours: catalog.hours,
      targetDate: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      priority: pick(PRIORITIES, seed + index),
      evidenceRequired: EVIDENCE_BY_TYPE[catalog.type],
      targetOutput: catalog.output,
      competencyFocus: catalog.competency,
      notes:
        index === 0 && item.notes
          ? item.notes
          : catalog.type === "mentoring_coaching"
            ? "Sesi terjadwal bulanan dengan mentor yang ditunjuk."
            : undefined,
    });
  }

  return items;
}

function buildSeedRows(): ApprovalQueueItem[] {
  return [
    {
      id: "apr-001",
      employeeName: "Siti Rahma",
      position: "HR Specialist",
      organization: "PT Angkasa Pura I",
      jobFamily: "Human Capital",
      managerName: "Dewi Kartika",
      managerRole: "definitif",
      pgsAccess: "n/a",
      stage: "awaiting_manager",
      source: "self",
      hours: 42,
      activityCount: 4,
      reasonTags: ["Pemenuhan Gap Kompetensi", "Aspirasi Karier"],
      submittedAt: "2026-02-01T10:00:00Z",
      waitingDays: 18,
      slaBreached: true,
      hcbpUnit: "HC AP I",
      notes: "Fokus pengembangan HR Analytics untuk mendukung keputusan berbasis data.",
    },
    {
      id: "apr-002",
      employeeName: "Andi Wijaya",
      position: "Finance Analyst",
      organization: "PT Angkasa Pura I",
      jobFamily: "Finance & Accounting",
      managerName: "Rina Kusuma (PGS)",
      managerRole: "pgs",
      pgsAccess: "eligible",
      pgsNote: "PGS berjalan 2 bulan — antrian tersedia (BR-IDPA-006).",
      stage: "awaiting_manager",
      source: "system",
      hours: 40,
      activityCount: 3,
      reasonTags: ["Pemenuhan Gap Kompetensi"],
      submittedAt: "2026-08-28T09:00:00Z",
      waitingDays: 14,
      slaBreached: true,
      hcbpUnit: "HC AP I",
    },
    {
      id: "apr-003",
      employeeName: "Farah Nabila",
      position: "Airport Ops Officer",
      organization: "PT Angkasa Pura II",
      jobFamily: "Operations",
      managerName: "Bagas Pratama (PGS)",
      managerRole: "pgs",
      pgsAccess: "blocked",
      pgsNote: "Estimasi PGS 3 minggu — antrian belum tersedia.",
      stage: "awaiting_manager",
      source: "self",
      hours: 36,
      activityCount: 3,
      reasonTags: ["Perbaikan Kinerja"],
      submittedAt: "2026-09-02T11:30:00Z",
      waitingDays: 9,
      slaBreached: false,
      hcbpUnit: "HC AP II",
    },
  ];
}

/** ~2.4k proposals so admin queue UX can be judged at production volume. */
export const APPROVAL_QUEUE_TOTAL = 2400;

function buildSyntheticQueue(total: number): ApprovalQueueItem[] {
  const rows = buildSeedRows();
  const start = rows.length + 1;
  for (let i = start; i <= total; i += 1) {
    const stage = pick(STAGES, i);
    const managerBase = pick(MANAGERS, i);
    const isPgs = i % 11 === 0;
    const pgsAccess: PgsAccess = !isPgs ? "n/a" : i % 33 === 0 ? "blocked" : "eligible";
    const waitingDays = stage === "active" ? 0 : (i % 28) + 1;
    const org = pick(ORGS, i);
    const activityCount = 2 + (i % 5);
    rows.push({
      id: `apr-${String(i).padStart(4, "0")}`,
      employeeName: `${pick(FIRST_NAMES, i)} ${pick(LAST_NAMES, i * 3)}`,
      position: pick(POSITIONS, i),
      organization: org,
      jobFamily: pick(JOB_FAMILIES, i),
      managerName: isPgs ? `${managerBase} (PGS)` : managerBase,
      managerRole: isPgs ? "pgs" : "definitif",
      pgsAccess,
      pgsNote:
        pgsAccess === "blocked"
          ? "Estimasi PGS di bawah 1 bulan — antrian belum tersedia."
          : pgsAccess === "eligible"
            ? "Syarat ganda PGS terpenuhi."
            : undefined,
      stage,
      source: pick(SOURCES, i),
      hours: 24 + (i % 28),
      activityCount,
      reasonTags: [...pick(REASON_POOL, i)],
      submittedAt: new Date(Date.UTC(2026, 7, 1 + (i % 40), 8 + (i % 8))).toISOString(),
      waitingDays,
      slaBreached: stage !== "active" && waitingDays >= 10,
      hcbpUnit: `HC ${org.replace("PT ", "").slice(0, 12)}`,
      notes: i % 17 === 0 ? "Butir dari penugasan massal — persetujuan atasan tetap wajib." : undefined,
    });
  }
  return rows;
}

export const mockApprovalQueue: ApprovalQueueItem[] = buildSyntheticQueue(APPROVAL_QUEUE_TOTAL);

export const approvalQueueMeta = {
  total: mockApprovalQueue.length,
  open: mockApprovalQueue.filter((item) => item.stage !== "active").length,
  awaitingManager: mockApprovalQueue.filter((item) => item.stage === "awaiting_manager").length,
  awaitingHcbp: mockApprovalQueue.filter((item) => item.stage === "awaiting_hcbp").length,
  slaBreached: mockApprovalQueue.filter((item) => item.slaBreached && item.stage !== "active").length,
  blockedPgs: mockApprovalQueue.filter((item) => item.pgsAccess === "blocked").length,
};
