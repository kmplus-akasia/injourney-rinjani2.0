import type { Notification } from "@rinjani/shared-types";
import type { ApplicantStage, JobTenderApplicant, JobTenderVacancy } from "./job-tender-admin";

export type JobTenderEventType =
  | "vacancy_published"
  | "saved_job_reminder"
  | "saved_vacancy_closed"
  | "pipeline_changed"
  | "interview_invitation"
  | "close_result";

export type InterviewInviteFields = {
  interviewDate: string;
  interviewTime: string;
  locationOrLink: string;
  interviewerName: string;
  interviewerPosition?: string;
};

export type DeliveryLogRow = {
  id: string;
  recipient: string;
  trigger: JobTenderEventType;
  templateId: string;
  channel: "in_app" | "mail_preview";
  time: string;
  status: "sent" | "skipped";
  filledSubject: string;
  filledBody: string;
};

export type JobTenderAuditRow = {
  id: string;
  action: string;
  actor: string;
  entityId: string;
  time: string;
  detail: string;
};

export type ReminderHorizon = "H-3" | "H-1";

type TemplateDef = {
  id: string;
  name: string;
  subject: string;
  body: string;
};

export const JOB_TENDER_MAIL_TEMPLATES: Record<"interview" | "result" | "reminder" | "pipeline" | "publish" | "saved_closed", TemplateDef> = {
  interview: {
    id: "jt-interview",
    name: "Welcome Email",
    subject: "Interview invitation for [job_position]",
    body: "Dear [candidate_name],\n\nCongratulations on advancing to the interview stage! We have scheduled your interview for the [job_position] role in [company] with our team. Please find the details below:\n\nInterview Date: [interview_date_and_start_time]\nLocation/Link: [interview_location_or_link]\nInterviewer(s): [interviewer_name], [interviewer_position]\n\nPlease confirm your availability by contacting the contact below. For further information, we will contact you personally and you can track the progress of the job status through the profile page on the website.\n\nBest regards,\n[company] Recruitment Team\n[contact_person_email]",
  },
  result: {
    id: "jt-result",
    name: "Result Notice",
    subject: "Application result for [job_position]",
    body: "Dear [candidate_name],\n\nYour application for [job_position] at [company] is now [result_status].\n\nReason: [result_reason]\n\nYou can track this outcome from Job Tender Marketplace.\n\nBest regards,\n[company] Recruitment Team",
  },
  reminder: {
    id: "jt-reminder",
    name: "Saved Job Reminder",
    subject: "[horizon] reminder: [job_position] deadline",
    body: "Dear [candidate_name],\n\nThis is an [horizon] reminder. The application deadline for [job_position] at [company] is [deadline].\n\nOpen Saved Jobs to apply before the vacancy closes.\n\nBest regards,\n[company] Recruitment Team",
  },
  pipeline: {
    id: "jt-pipeline",
    name: "Pipeline Notice",
    subject: "Your application moved to [stage_label]",
    body: "Dear [candidate_name],\n\nYour application for [job_position] is now at [stage_label].\n\nBest regards,\n[company] Recruitment Team",
  },
  publish: {
    id: "jt-publish",
    name: "Vacancy Published",
    subject: "New vacancy: [job_position]",
    body: "A new Job Tender vacancy is published: [job_position] at [company]. Deadline [deadline].",
  },
  saved_closed: {
    id: "jt-saved-closed",
    name: "Saved Vacancy Closed",
    subject: "Saved vacancy closed: [job_position]",
    body: "The vacancy [job_position] at [company] is now closed. It was on your Saved Jobs list.",
  },
};

type PlaceholderMap = Record<string, string>;

function fillTemplate(text: string, values: PlaceholderMap) {
  return text.replace(/\[([a-z0-9_]+)\]/gi, (_, key: string) => values[key] ?? `[${key}]`);
}

function nowIso() {
  return new Date().toISOString();
}

function relativeTimestamp() {
  return "Just now";
}

export function missingInterviewInviteFields(invite?: InterviewInviteFields | null): string[] {
  if (!invite) {
    return ["interviewDate", "interviewTime", "locationOrLink", "interviewerName"];
  }
  const missing: string[] = [];
  if (!invite.interviewDate.trim()) missing.push("interviewDate");
  if (!invite.interviewTime.trim()) missing.push("interviewTime");
  if (!invite.locationOrLink.trim()) missing.push("locationOrLink");
  if (!invite.interviewerName.trim()) missing.push("interviewerName");
  return missing;
}

export function formatInterviewDateTime(invite: InterviewInviteFields) {
  return `${invite.interviewDate} ${invite.interviewTime}`;
}

function stageLabel(stage: ApplicantStage) {
  return stage.replaceAll("_", " ");
}

let deliveryLog: DeliveryLogRow[] = [];
let auditTrail: JobTenderAuditRow[] = [];
const bellListeners = new Set<(notification: Notification) => void>();

export function subscribeJobTenderNotifications(listener: (notification: Notification) => void) {
  bellListeners.add(listener);
  return () => {
    bellListeners.delete(listener);
  };
}

export function listJobTenderDeliveryLog() {
  return deliveryLog;
}

export function listJobTenderAuditTrail() {
  return auditTrail;
}

export function resetJobTenderNotifications() {
  deliveryLog = [];
  auditTrail = [];
}

function appendAudit(input: Omit<JobTenderAuditRow, "id" | "time">) {
  auditTrail = [
    {
      id: `AUD-JT-${String(auditTrail.length + 1).padStart(3, "0")}`,
      time: nowIso(),
      ...input,
    },
    ...auditTrail,
  ];
}

function deliver(input: {
  recipient: string;
  trigger: JobTenderEventType;
  template: TemplateDef;
  values: PlaceholderMap;
  bell: { type: Notification["type"]; title: string; message: string; sender?: string };
}) {
  const filledSubject = fillTemplate(input.template.subject, input.values);
  const filledBody = fillTemplate(input.template.body, input.values);
  const row: DeliveryLogRow = {
    id: `DL-JT-${String(deliveryLog.length + 1).padStart(3, "0")}`,
    recipient: input.recipient,
    trigger: input.trigger,
    templateId: input.template.id,
    channel: "in_app",
    time: nowIso(),
    status: "sent",
    filledSubject,
    filledBody,
  };
  deliveryLog = [row, ...deliveryLog];

  const notification: Notification = {
    id: `jt-notif-${row.id}`,
    type: input.bell.type,
    title: input.bell.title,
    message: input.bell.message,
    timestamp: relativeTimestamp(),
    read: false,
    sender: input.bell.sender,
  };
  bellListeners.forEach((listener) => listener(notification));
  return row;
}

function vacancyValues(vacancy: JobTenderVacancy, extra: PlaceholderMap = {}): PlaceholderMap {
  return {
    job_position: vacancy.title,
    company: vacancy.company,
    deadline: vacancy.deadline,
    contact_person_email: "jobtender@injourney.id",
    ...extra,
  };
}

export function emitVacancyPublished(vacancy: JobTenderVacancy) {
  const values = vacancyValues(vacancy);
  deliver({
    recipient: "Marketplace employees",
    trigger: "vacancy_published",
    template: JOB_TENDER_MAIL_TEMPLATES.publish,
    values,
    bell: {
      type: "announcement",
      title: `Vacancy published: ${vacancy.title}`,
      message: `${vacancy.company} is now open in Job Tender Marketplace. Deadline ${vacancy.deadline}.`,
      sender: "Job Tender Admin",
    },
  });
  appendAudit({
    action: "vacancy_published",
    actor: "Job Tender Admin",
    entityId: vacancy.id,
    detail: `Published ${vacancy.title}`,
  });
}

export function emitSavedJobReminder(input: {
  vacancy: Pick<JobTenderVacancy, "id" | "title" | "company" | "deadline">;
  employeeName: string;
  horizon: ReminderHorizon;
}) {
  const values = {
    candidate_name: input.employeeName,
    job_position: input.vacancy.title,
    company: input.vacancy.company,
    deadline: input.vacancy.deadline,
    horizon: input.horizon,
  };
  const row = deliver({
    recipient: input.employeeName,
    trigger: "saved_job_reminder",
    template: JOB_TENDER_MAIL_TEMPLATES.reminder,
    values,
    bell: {
      type: "deadline",
      title: `${input.horizon} reminder: ${input.vacancy.title}`,
      message: `${input.horizon}: application deadline for ${input.vacancy.title} is ${input.vacancy.deadline}.`,
    },
  });
  appendAudit({
    action: "saved_job_reminder",
    actor: "Job Tender Admin",
    entityId: input.vacancy.id,
    detail: `${input.horizon} reminder for ${input.employeeName}`,
  });
  return row;
}

export function emitSavedVacancyClosed(vacancy: JobTenderVacancy, employeeName = "Saved-job employees") {
  const values = vacancyValues(vacancy);
  deliver({
    recipient: employeeName,
    trigger: "saved_vacancy_closed",
    template: JOB_TENDER_MAIL_TEMPLATES.saved_closed,
    values,
    bell: {
      type: "announcement",
      title: `Saved vacancy closed: ${vacancy.title}`,
      message: `${vacancy.title} is closed. It was on a Saved Jobs list.`,
    },
  });
  appendAudit({
    action: "saved_vacancy_closed",
    actor: "Job Tender Admin",
    entityId: vacancy.id,
    detail: `Closed notice for saved vacancy ${vacancy.title}`,
  });
}

export function emitPipelineChanged(applicant: JobTenderApplicant, vacancy: JobTenderVacancy, stage: ApplicantStage) {
  const label = stageLabel(stage);
  const values = vacancyValues(vacancy, {
    candidate_name: applicant.employeeName,
    stage_label: label,
  });
  deliver({
    recipient: applicant.employeeName,
    trigger: "pipeline_changed",
    template: JOB_TENDER_MAIL_TEMPLATES.pipeline,
    values,
    bell: {
      type: "announcement",
      title: `Application moved to ${label}`,
      message: `${applicant.employeeName} is now ${label} for ${vacancy.title}.`,
    },
  });
  appendAudit({
    action: "pipeline_changed",
    actor: "Job Tender Admin",
    entityId: applicant.id,
    detail: `${applicant.employeeName} → ${label} on ${vacancy.id}`,
  });
}

export function emitInterviewInvitation(applicant: JobTenderApplicant, vacancy: JobTenderVacancy, invite: InterviewInviteFields) {
  const missing = missingInterviewInviteFields(invite);
  if (missing.length > 0) {
    throw new Error(`Interview invitation requires: ${missing.join(", ")}`);
  }
  const dateTime = formatInterviewDateTime(invite);
  const values = vacancyValues(vacancy, {
    candidate_name: applicant.employeeName,
    interview_date_and_start_time: dateTime,
    interview_location_or_link: invite.locationOrLink,
    interviewer_name: invite.interviewerName,
    interviewer_position: invite.interviewerPosition?.trim() || "Interviewer",
  });
  deliver({
    recipient: applicant.employeeName,
    trigger: "interview_invitation",
    template: JOB_TENDER_MAIL_TEMPLATES.interview,
    values,
    bell: {
      type: "deadline",
      title: `Interview invitation: ${vacancy.title}`,
      message: `${dateTime} · ${invite.locationOrLink} · ${invite.interviewerName}`,
      sender: invite.interviewerName,
    },
  });
  deliver({
    recipient: invite.interviewerName,
    trigger: "interview_invitation",
    template: JOB_TENDER_MAIL_TEMPLATES.interview,
    values: { ...values, candidate_name: invite.interviewerName },
    bell: {
      type: "deadline",
      title: `Interview assigned: ${applicant.employeeName}`,
      message: `You are listed as interviewer for ${vacancy.title} on ${dateTime}.`,
      sender: "Job Tender Admin",
    },
  });
  appendAudit({
    action: "interview_invitation",
    actor: "Job Tender Admin",
    entityId: applicant.id,
    detail: `Invite ${applicant.employeeName} / ${invite.interviewerName} for ${vacancy.id}`,
  });
}

export function emitCloseResult(
  applicant: JobTenderApplicant,
  vacancy: JobTenderVacancy,
  resultStatus: "accepted" | "rejected",
  resultReason: string,
) {
  const values = vacancyValues(vacancy, {
    candidate_name: applicant.employeeName,
    result_status: resultStatus,
    result_reason: resultReason,
  });
  deliver({
    recipient: applicant.employeeName,
    trigger: "close_result",
    template: JOB_TENDER_MAIL_TEMPLATES.result,
    values,
    bell: {
      type: "announcement",
      title: `Application ${resultStatus}: ${vacancy.title}`,
      message: `${applicant.employeeName} is ${resultStatus}. ${resultReason}`,
    },
  });
  appendAudit({
    action: "close_result",
    actor: "Job Tender Admin",
    entityId: applicant.id,
    detail: `${applicant.employeeName} ${resultStatus} on ${vacancy.id}: ${resultReason}`,
  });
}
