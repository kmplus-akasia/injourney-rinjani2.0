/** @vitest-environment node */
import { describe, expect, it } from "vitest";
import { applyAnonymityThreshold, channelsFromBreakdown } from "@talent/lib/360-assessment/anonymity";
import { compareCompetencyScores, isCompetencyGap } from "@talent/lib/360-assessment/compare";
import { eqsKompetensi, gapSeverity, itemScore } from "@talent/lib/competency-assessment";
import {
  canApplyGates,
  canSubmitForApproval,
  jobFamilyGateAllows,
  nextPipelineStage,
} from "@talent/lib/job-tender-admin";
import {
  listApplicants,
  moveApplicant,
  resetJobTenderPrototypeState,
  setVacancyStatus,
} from "@talent/data/jobTenderAdminData";
import { emitSavedJobReminder, listJobTenderDeliveryLog } from "@talent/lib/jobTenderNotifications";
import {
  getMissingFields,
  isPositionComplete,
  movementWithinTierCap,
  type OrgPosition,
} from "@talent/lib/org-management";

const completePosition: OrgPosition = {
  id: "POS-TEST",
  name: "Manager Talent Mobility",
  company: "InJourney Holding",
  entity: "InJourney",
  unit: "Human Capital",
  grade: 17,
  band: "III-A",
  bandTier: 3,
  jobFamily: "Human Capital",
  jobRole: "Talent Mobility",
  activeStatus: "active",
  ksp: false,
  incumbentId: null,
  incumbentName: null,
  vacancy: true,
  parentPositionId: null,
  managerPositionId: null,
  assignmentKind: "primary",
  requiredCompetencies: ["Leadership"],
  requiredExperience: "8 years",
  location: "Jakarta",
  jobDescription: "Owns internal mobility.",
  lastValidationDate: "2026-09-10",
  effectiveDate: "2026-01-01",
};

describe("Organization Management completeness", () => {
  it("requires Band tier and Job Family before a position is Talent-eligible", () => {
    const incomplete = { ...completePosition, bandTier: null, jobFamily: null };
    expect(getMissingFields(incomplete)).toEqual(["bandTier", "jobFamily"]);
    expect(isPositionComplete(incomplete)).toBe(false);
    expect(isPositionComplete(completePosition)).toBe(true);
  });

  it("caps Band movement to one tier", () => {
    expect(movementWithinTierCap(3, 4)).toBe(true);
    expect(movementWithinTierCap(3, 5)).toBe(false);
  });
});

describe("Job Tender HQ gates", () => {
  it("blocks approval when Position Master is incomplete", () => {
    const incomplete = { ...completePosition, jobFamily: null };
    const errors = canSubmitForApproval(
      { title: "Vacancy", quota: 1, startDate: "2026-09-12", deadline: "2026-09-26", owner: "Ayu" },
      incomplete,
    );
    expect(errors.some((error) => error.includes("incomplete"))).toBe(true);
  });

  it("keeps Talent Mobility Job Family strict and lets Experience/Learning cross family", () => {
    expect(jobFamilyGateAllows({
      opportunityType: "talent_mobility",
      employeeJobFamily: "Finance & Accounting",
      targetJobFamily: "Human Capital",
    })).toBe(false);
    expect(jobFamilyGateAllows({
      opportunityType: "experience",
      employeeJobFamily: "Finance & Accounting",
      targetJobFamily: "Human Capital",
    })).toBe(true);
  });

  it("blocks apply for discipline while leaving EQS available as a separate gate", () => {
    const reasons = canApplyGates({
      vacancyStatus: "published",
      deadline: "2026-12-31",
      now: new Date("2026-09-10"),
      discipline: "sedang",
      activeApplications: 0,
      activeLimit: 3,
      opportunityType: "experience",
      employeeJobFamily: "Human Capital",
      targetJobFamily: "Digital & IT",
      eqs: 80,
      eqsThreshold: 70,
    });
    expect(reasons.some((reason) => reason.includes("Discipline"))).toBe(true);
    expect(reasons.some((reason) => reason.includes("below the threshold"))).toBe(false);
  });

  it("advances the applicant pipeline in BRD order", () => {
    expect(nextPipelineStage("submitted")).toBe("under_review");
    expect(nextPipelineStage("interview")).toBe("offered");
    expect(nextPipelineStage("accepted")).toBeNull();
  });

  it("rejects an interview move when invite fields are missing", () => {
    resetJobTenderPrototypeState();
    expect(() => moveApplicant("APP-001", "interview")).toThrow(/Interview invitation requires/);
    expect(listApplicants().find((item) => item.id === "APP-001")?.stage).toBe("shortlisted");
    expect(listJobTenderDeliveryLog().some((row) => row.trigger === "interview_invitation")).toBe(false);
  });

  it("sweeps remaining open applicants to rejected on vacancy close", () => {
    resetJobTenderPrototypeState();
    setVacancyStatus("VAC-EL-001", "closed");
    const remaining = listApplicants("VAC-EL-001");
    expect(remaining.every((item) => item.stage === "rejected")).toBe(true);
    const resultRows = listJobTenderDeliveryLog().filter((row) => row.trigger === "close_result");
    expect(resultRows.length).toBeGreaterThanOrEqual(3);
    expect(resultRows[0].filledBody).toContain("Vacancy closed");
  });

  it("records a delivery row when a saved-job reminder is emitted", () => {
    resetJobTenderPrototypeState();
    const row = emitSavedJobReminder({
      vacancy: {
        id: "VAC-EL-001",
        title: "Project Lead — Rinjani 2.0 Migration",
        company: "InJourney Holding",
        deadline: "2026-09-20",
      },
      employeeName: "Dewi Ratnasari",
      horizon: "H-3",
    });
    expect(row.trigger).toBe("saved_job_reminder");
    expect(row.filledSubject).toContain("H-3");
    expect(listJobTenderDeliveryLog().some((item) => item.id === row.id)).toBe(true);
  });
});

describe("Competency Assessment EQS", () => {
  it("caps each item at 100 and averages the ratios", () => {
    expect(itemScore(5, 4)).toBe(100);
    expect(itemScore(2, 4)).toBe(50);
    expect(eqsKompetensi([
      { individualLevel: 5, requiredLevel: 4 },
      { individualLevel: 2, requiredLevel: 4 },
    ])).toBe(75);
    expect(gapSeverity(2)).toBe("significant");
  });
});

describe("360 anonymity and period compare", () => {
  it("hides subordinate scores below k=3 inside Combined Others", () => {
    const view = applyAnonymityThreshold(channelsFromBreakdown([
      { channel: "superior", assessor_count: 1, raw_score: 5.29, weight: 40, weighted_score: 2.12 },
      { channel: "peer", assessor_count: 3, raw_score: 5.05, weight: 30, weighted_score: 1.52 },
      { channel: "subordinate", assessor_count: 2, raw_score: 5.36, weight: 20, weighted_score: 1.07 },
      { channel: "self", assessor_count: 1, raw_score: 5, weight: 10, weighted_score: 0.5 },
    ]));
    expect(view.hiddenChannels).toEqual(["subordinate"]);
    expect(view.combinedOthers?.channel).toBe("others");
    expect(view.combinedOthers?.assessorCount).toBe(2);
    expect(view.visible.some((channel) => channel.channel === "subordinate")).toBe(false);
    expect(view.visible.some((channel) => channel.channel === "peer")).toBe(true);
  });

  it("compares competency scores across periods and flags gaps below 80%", () => {
    const rows = compareCompetencyScores(
      [{ competency_name: "Adaptif", score: 4.65, max_score: 6 }],
      [{ competency_name: "Adaptif", score: 4.2, max_score: 6 }],
    );
    expect(rows[0].delta).toBe(0.45);
    expect(isCompetencyGap(4.65, 6)).toBe(true);
    expect(isCompetencyGap(5.1, 6)).toBe(false);
  });
});
