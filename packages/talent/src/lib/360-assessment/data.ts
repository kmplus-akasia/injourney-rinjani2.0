
export const assessmentCycles = [
  {
    id: "CYC-001",
    tenant_id: "TENANT-SPTP",
    name: "Penilaian Kinerja Berbasis Perilaku AKHLAK 2025",
    description: "Penilaian 360 derajat berbasis nilai-nilai AKHLAK untuk seluruh karyawan SPTP periode 2025",
    assessment_type: "behavioral",
    instrument_id: "INS-001",
    start_date: "2025-11-01",
    end_date: "2025-12-15",
    result_valid_until: "2026-12-31",
    status: "published",
    total_assessee: 245,
  },
  {
    id: "CYC-002",
    tenant_id: "TENANT-SPTP",
    name: "Penilaian Kompetensi Manajerial Q1 2026",
    description: "Penilaian 360 derajat kompetensi manajerial untuk level Manager ke atas",
    assessment_type: "competency",
    instrument_id: "INS-002",
    start_date: "2026-02-01",
    end_date: "2026-03-15",
    result_valid_until: null,
    status: "active",
    total_assessee: 48,
  },
  {
    id: "CYC-003",
    tenant_id: "TENANT-SPTP",
    name: "Penilaian Perilaku AKHLAK 2024",
    description: null,
    assessment_type: "behavioral",
    instrument_id: "INS-001",
    start_date: "2024-10-01",
    end_date: "2024-11-30",
    result_valid_until: "2025-12-31",
    status: "archived",
    total_assessee: 238,
  }
];

export const assessmentInstruments = [
  {
    id: "INS-001",
    name: "AKHLAK Behavioral Assessment v2",
    assessment_type: "behavioral",
    total_questions: 7,
    scale_points: 6,
    scale_min_label: "Sangat Tidak Setuju",
    scale_max_label: "Sangat Setuju",
  },
  {
    id: "INS-002",
    name: "Managerial Competency Assessment",
    assessment_type: "competency",
    total_questions: 8,
    scale_points: 6,
    scale_min_label: "Tidak Setuju",
    scale_max_label: "Setuju",
  }
];

export const instrumentQuestions = [
  {
    id: "QST-001",
    instrument_id: "INS-001",
    competency_id: "COMP-AMANAH",
    competency_name: "Amanah",
    behavior_indicator: "Memenuhi janji dan komitmen",
    question_text: "Yang bersangkutan selalu memenuhi janji dan komitmen yang telah disepakati dalam pekerjaan",
    question_order: 1,
  },
  {
    id: "QST-002",
    instrument_id: "INS-001",
    competency_id: "COMP-KOMPETEN",
    competency_name: "Kompeten",
    behavior_indicator: "Terus belajar dan mengembangkan kapabilitas",
    question_text: "Yang bersangkutan secara aktif meningkatkan kompetensi diri melalui pelatihan dan pembelajaran mandiri",
    question_order: 2,
  },
  {
    id: "QST-003",
    instrument_id: "INS-001",
    competency_id: "COMP-HARMONIS",
    competency_name: "Harmonis",
    behavior_indicator: "Saling peduli dan menghargai perbedaan",
    question_text: "Yang bersangkutan menunjukkan rasa peduli terhadap rekan kerja dan menghargai perbedaan latar belakang",
    question_order: 3,
  },
  {
    id: "QST-004",
    instrument_id: "INS-001",
    competency_id: "COMP-LOYAL",
    competency_name: "Loyal",
    behavior_indicator: "Berdedikasi dan mengutamakan kepentingan organisasi",
    question_text: "Yang bersangkutan menunjukkan dedikasi tinggi dan mengutamakan kepentingan perusahaan di atas kepentingan pribadi",
    question_order: 4,
  },
  {
    id: "QST-005",
    instrument_id: "INS-001",
    competency_id: "COMP-ADAPTIF",
    competency_name: "Adaptif",
    behavior_indicator: "Terus berinovasi dan antusias menghadapi perubahan",
    question_text: "Yang bersangkutan menunjukkan sikap terbuka terhadap perubahan dan aktif mencari cara-cara baru yang lebih efektif",
    question_order: 5,
  },
  {
    id: "QST-006",
    instrument_id: "INS-001",
    competency_id: "COMP-KOLABORATIF",
    competency_name: "Kolaboratif",
    behavior_indicator: "Membangun kerja sama sinergis",
    question_text: "Yang bersangkutan aktif membangun kerja sama dengan berbagai pihak untuk mencapai tujuan bersama",
    question_order: 6,
  },
  {
    id: "QST-007",
    instrument_id: "INS-001",
    competency_id: "COMP-KOLABORATIF",
    competency_name: "Kolaboratif",
    behavior_indicator: "Memberi kesempatan kepada berbagai pihak untuk berkontribusi",
    question_text: "Yang bersangkutan memberikan ruang dan kesempatan bagi anggota tim untuk berkontribusi secara aktif dalam pengambilan keputusan",
    question_order: 7,
  },
  // Questions for INS-002 (Managerial Competency)
  {
    id: "QST-008",
    instrument_id: "INS-002",
    competency_id: "COMP-VISION",
    competency_name: "Visionary Leadership",
    behavior_indicator: "Mampu menetapkan visi jangka panjang",
    question_text: "Yang bersangkutan mampu mengkomunikasikan visi organisasi dengan jelas dan menginspirasi tim untuk mencapainya",
    question_order: 1,
  },
  {
    id: "QST-009",
    instrument_id: "INS-002",
    competency_id: "COMP-VISION",
    competency_name: "Visionary Leadership",
    behavior_indicator: "Menerjemahkan strategi menjadi rencana aksi",
    question_text: "Yang bersangkutan mampu menerjemahkan strategi perusahaan menjadi target kerja yang terukur bagi tim",
    question_order: 2,
  },
  {
    id: "QST-010",
    instrument_id: "INS-002",
    competency_id: "COMP-DECISION",
    competency_name: "Decision Making",
    behavior_indicator: "Mengambil keputusan berbasis data",
    question_text: "Yang bersangkutan selalu menggunakan data dan fakta relevan sebagai dasar pengambilan keputusan",
    question_order: 3,
  },
  {
    id: "QST-011",
    instrument_id: "INS-002",
    competency_id: "COMP-DECISION",
    competency_name: "Decision Making",
    behavior_indicator: "Berani mengambil risiko terukur",
    question_text: "Yang bersangkutan berani mengambil keputusan sulit dengan mempertimbangkan risiko dan dampaknya",
    question_order: 4,
  },
  {
    id: "QST-012",
    instrument_id: "INS-002",
    competency_id: "COMP-DEVELOPING",
    competency_name: "Developing Others",
    behavior_indicator: "Memberikan umpan balik konstruktif",
    question_text: "Yang bersangkutan secara rutin memberikan coaching dan feedback yang membangun untuk pengembangan anggota tim",
    question_order: 5,
  },
  {
    id: "QST-013",
    instrument_id: "INS-002",
    competency_id: "COMP-DEVELOPING",
    competency_name: "Developing Others",
    behavior_indicator: "Mendukung program pengembangan",
    question_text: "Yang bersangkutan memberikan kesempatan dan dukungan bagi tim untuk mengikuti program pelatihan/pengembangan",
    question_order: 6,
  }
];

export const assessorAssignments = [
  {
    id: "ASG-001",
    cycle_id: "CYC-001",
    assessee_id: "EMP-20145",
    assessor_id: "EMP-10032",
    channel: "superior",
    status: "completed",
    assigned_at: "2025-10-28T08:00:00Z",
  },
  {
    id: "ASG-008",
    cycle_id: "CYC-002",
    assessee_id: "EMP-20145",
    assessor_id: "EMP-10032",
    channel: "superior",
    status: "notified",
    assigned_at: "2026-01-28T08:00:00Z",
  },
  {
    id: "ASG-009",
    cycle_id: "CYC-002",
    assessee_id: "EMP-20145",
    assessor_id: "EMP-20145",
    channel: "self",
    status: "in_progress",
    assigned_at: "2026-01-28T08:00:00Z",
  },
  // Assignments where Current User (EMP-20145) is Assessor
  {
    id: "ASG-010",
    cycle_id: "CYC-001",
    assessee_id: "EMP-20189",
    assessor_id: "EMP-20145",
    channel: "peer",
    status: "completed",
    assigned_at: "2025-10-28T08:00:00Z",
  },
  {
    id: "ASG-012",
    cycle_id: "CYC-002",
    assessee_id: "EMP-20189",
    assessor_id: "EMP-20145",
    channel: "peer",
    status: "in_progress",
    assigned_at: "2026-01-28T08:00:00Z",
  },
  {
    id: "ASG-013",
    cycle_id: "CYC-002",
    assessee_id: "EMP-10032",
    assessor_id: "EMP-20145",
    channel: "subordinate",
    status: "notified",
    assigned_at: "2026-01-28T08:00:00Z",
  }
];

export const assessmentResults = [
  {
    id: "RES-001",
    cycle_id: "CYC-001",
    assessee_id: "EMP-20145",
    overall_score: 5.18,
    overall_max_score: 6.00,
    status: "published",
    competency_scores: [
      {
        competency_name: "Amanah",
        score: 5.40,
        max_score: 6.00,
        behavior_scores: [{ behavior_indicator: "Memenuhi janji dan komitmen", score: 5.40, max_score: 6.00 }]
      },
      {
        competency_name: "Kompeten",
        score: 5.10,
        max_score: 6.00,
        behavior_scores: [{ behavior_indicator: "Terus belajar dan mengembangkan kapabilitas", score: 5.10, max_score: 6.00 }]
      },
      {
        competency_name: "Harmonis",
        score: 5.55,
        max_score: 6.00,
        behavior_scores: [{ behavior_indicator: "Saling peduli dan menghargai perbedaan", score: 5.55, max_score: 6.00 }]
      },
      {
        competency_name: "Loyal",
        score: 5.25,
        max_score: 6.00,
        behavior_scores: [{ behavior_indicator: "Berdedikasi dan mengutamakan kepentingan organisasi", score: 5.25, max_score: 6.00 }]
      },
      {
        competency_name: "Adaptif",
        score: 4.65,
        max_score: 6.00,
        behavior_scores: [{ behavior_indicator: "Terus berinovasi dan antusias menghadapi perubahan", score: 4.65, max_score: 6.00 }]
      },
      {
        competency_name: "Kolaboratif",
        score: 5.30,
        max_score: 6.00,
        behavior_scores: [
          { behavior_indicator: "Membangun kerja sama sinergis", score: 5.45, max_score: 6.00 },
          { behavior_indicator: "Memberi kesempatan kepada berbagai pihak untuk berkontribusi", score: 5.15, max_score: 6.00 }
        ]
      }
    ],
    channel_breakdown: [
      { channel: "superior", weight: 40, raw_score: 5.29, weighted_score: 2.12, assessor_count: 1, completion_rate: 1.0 },
      { channel: "peer", weight: 30, raw_score: 5.05, weighted_score: 1.52, assessor_count: 3, completion_rate: 1.0 },
      { channel: "subordinate", weight: 20, raw_score: 5.36, weighted_score: 1.07, assessor_count: 2, completion_rate: 1.0 },
      { channel: "self", weight: 10, raw_score: 5.00, weighted_score: 0.50, assessor_count: 1, completion_rate: 1.0 }
    ],
  },
  {
    id: "RES-002",
    cycle_id: "CYC-003",
    assessee_id: "EMP-20145",
    overall_score: 4.82,
    overall_max_score: 6.00,
    status: "published",
    competency_scores: [
      {
        competency_name: "Amanah",
        score: 5.10,
        max_score: 6.00,
        behavior_scores: [{ behavior_indicator: "Memenuhi janji dan komitmen", score: 5.10, max_score: 6.00 }]
      },
      {
        competency_name: "Kompeten",
        score: 4.80,
        max_score: 6.00,
        behavior_scores: [{ behavior_indicator: "Terus belajar dan mengembangkan kapabilitas", score: 4.80, max_score: 6.00 }]
      },
      {
        competency_name: "Harmonis",
        score: 5.20,
        max_score: 6.00,
        behavior_scores: [{ behavior_indicator: "Saling peduli dan menghargai perbedaan", score: 5.20, max_score: 6.00 }]
      },
      {
        competency_name: "Loyal",
        score: 5.00,
        max_score: 6.00,
        behavior_scores: [{ behavior_indicator: "Berdedikasi dan mengutamakan kepentingan organisasi", score: 5.00, max_score: 6.00 }]
      },
      {
        competency_name: "Adaptif",
        score: 4.20,
        max_score: 6.00,
        behavior_scores: [{ behavior_indicator: "Terus berinovasi dan antusias menghadapi perubahan", score: 4.20, max_score: 6.00 }]
      },
      {
        competency_name: "Kolaboratif",
        score: 4.90,
        max_score: 6.00,
        behavior_scores: [
          { behavior_indicator: "Membangun kerja sama sinergis", score: 5.00, max_score: 6.00 },
          { behavior_indicator: "Memberi kesempatan kepada berbagai pihak untuk berkontribusi", score: 4.80, max_score: 6.00 }
        ]
      }
    ],
    channel_breakdown: [
      { channel: "superior", weight: 40, raw_score: 4.90, weighted_score: 1.96, assessor_count: 1, completion_rate: 1.0 },
      { channel: "peer", weight: 30, raw_score: 4.70, weighted_score: 1.41, assessor_count: 4, completion_rate: 1.0 },
      { channel: "subordinate", weight: 20, raw_score: 4.85, weighted_score: 0.97, assessor_count: 2, completion_rate: 1.0 },
      { channel: "self", weight: 10, raw_score: 4.80, weighted_score: 0.48, assessor_count: 1, completion_rate: 1.0 }
    ],
  },
  {
    id: "RES-003",
    cycle_id: "CYC-002",
    assessee_id: "EMP-20145",
    overall_score: 0,
    overall_max_score: 6.00,
    status: "pending",
  }
];

export const assessmentSubmissions = [
  {
    id: "SUB-005",
    assignment_id: "ASG-012",
    cycle_id: "CYC-002",
    assessee_id: "EMP-20189",
    assessor_id: "EMP-20145",
    channel: "peer",
    instrument_id: "INS-002",
    total_questions: 8,
    answered_count: 3,
    status: "in_progress",
  }
];

export const employees = [
  { id: "EMP-20145", name: "Siti Nurhaliza", email: "siti.nurhaliza@sptp.co.id", current_position_title: "Manager Operasional Pelabuhan" },
  { id: "EMP-10032", name: "Bambang Hartono", email: "bambang.hartono@sptp.co.id", current_position_title: "VP Operasi & Teknik" },
  { id: "EMP-20189", name: "Dewi Ratnasari", email: "dewi.ratnasari@sptp.co.id", current_position_title: "Manager Perencanaan Strategis" },
];

export const currentUser = employees[0];

export function completeAssignment(id: string) {
  const assignment = assessorAssignments.find((item) => item.id === id);
  if (assignment) {
    assignment.status = "completed";
  }
}

export function findPreviousPublishedResult(resultId: string) {
  const current = assessmentResults.find((item) => item.id === resultId);
  if (!current) return undefined;
  const currentCycle = assessmentCycles.find((item) => item.id === current.cycle_id);
  if (!currentCycle) return undefined;

  return assessmentResults
    .filter((item) => {
      if (item.id === current.id || item.assessee_id !== current.assessee_id || item.status !== "published") {
        return false;
      }
      const cycle = assessmentCycles.find((entry) => entry.id === item.cycle_id);
      return Boolean(cycle && cycle.assessment_type === currentCycle.assessment_type && cycle.start_date < currentCycle.start_date);
    })
    .sort((a, b) => {
      const cycleA = assessmentCycles.find((entry) => entry.id === a.cycle_id);
      const cycleB = assessmentCycles.find((entry) => entry.id === b.cycle_id);
      return (cycleB?.start_date ?? "").localeCompare(cycleA?.start_date ?? "");
    })[0];
}
