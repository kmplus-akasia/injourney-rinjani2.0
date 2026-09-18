# Prototype adjustment spec — 18 September 2026

Development specification for five remaining prototype adjustments. Business rules come from the Notion BRD. Two product calls in this file are explicit extensions, not hidden BRD claims.

This file is the build brief. It does not replace the BRD.

## Sources

| Source | URL | Used for |
|---|---|---|
| BRD Job Tender Marketplace | https://app.notion.com/p/a8bd4169356e4f068c3edd175b48c9b9 | Saved Job Reminder, Pipeline Notice, six-stage pipeline |
| BRD Job Tender Admin | https://app.notion.com/p/96791a6cf604483098583aca773a0984 | Publish notice, close result, H-3/H-1 admin trigger |
| BRD Reports, Notifications & Audit | https://app.notion.com/p/f4f1838cd1114632a3cc1389779c5912 | Notification matrix, template, delivery log |
| BRD InJourney Rinjani Portal | https://app.notion.com/p/3101ac694aa9803a94e1d39d556c5101 | Onboarding Journey |
| KMPLUS 3.1.8.c / 3.1.8.e | Inspection workbook (yellow rows) | Interview Invitation and Close Result sweep |
| Prototype review 18 Sep 2026 | Chat | Platform switcher, Onboarding side menu |

## Settled decisions

1. One markdown development spec. BRD text is copied, not invented.
2. Done-bar for notices: in-app bell, mail-template preview, success toast. No SMTP.
3. Hide Deprecated Performance. The remaining switcher item is named **Rinjani Performance**. `/performance` redirects to `/performance-v2`.
4. Portal side-menu **Onboarding** opens the **Onboarding Journey** only. **Onboarding HQ** stays under Settings.
5. Interview, result, publish, saved-job, pipeline, and close are **one Job Tender Notification** capability.
6. Interview Invitation (Q6B): when Admin moves an applicant to Interview, Admin must enter date/time, location or link, and interviewer. That fills the existing mail template and sends one notice to the candidate and the interviewer. No calendar product.
7. Close Result Notice (Q7C): a notice on each Accepted or Rejected move, and a sweep to anyone still open when the vacancy Closes.

## Calendar fact

Rinjani does not have a calendar product. There is no shared interview calendar, no Outlook or Google Calendar sync, and no `.ics` file.

What exists today:

- `react-day-picker` date widgets in Portal, Talent, and Performance
- A one-off Talent Day schedule dialog in Succession
- Shared date inputs

Interview Invitation uses a date, time, and text fields. Do not add a calendar module.

## Slice 1 — Hide Deprecated Performance

**Ask.** The platform switcher still shows two Performance entries. Hide the deprecated one.

**Build.**

- Keep `performance-v2` as the only visible Performance platform.
- Set its `switcherLabel` to `Rinjani Performance`.
- Hide `performance` (`/performance`) from the switcher for Admin and User.
- Redirect `/performance` and its child routes to the matching `/performance-v2` path.
- Do not delete the old module in this slice.

**Done when.** The switcher shows Portal, Rinjani Talent, and one Rinjani Performance. Opening `/performance/my-kpi` lands on `/performance-v2/my-kpi`.

## Slice 2 — Onboarding Journey in the side menu

**Ask.** Onboarding exists but is not clickable like Offboarding. The side menu must open the employee journey only.

**BRD.** Portal BRD Onboarding Checklist / new-joiner journey. HQ stays in Settings.

**Build.**

- Add a Portal sidebar item **Onboarding**, same Administration group as Offboarding, visible to Admin and User.
- Route: `/onboarding`.
- The page is the employee Onboarding Journey: new-joiner checklist and the existing journey/wizard already in the portal package.
- If the signed-in person has no active onboarding, show an empty journey state. Do not open HQ.
- Admin HQ (submissions, checklist config, monitoring, send form link) stays at Settings → Onboarding.
- Reuse `OffboardingStatus` layout patterns. Do not rebuild Onboarding.

**Done when.** User and Admin can open Onboarding from the side menu and see the journey. Settings still holds HQ. No `/onboarding` 404.

## Slice 3 — Job Tender Notification capability

One path. Several events. Simulation only.

### Shared path

1. A Job Tender event fires.
2. The system picks the template, recipients, and channel from the notification matrix.
3. Recipients in scope get an in-app bell item.
4. Mail Management can preview the filled template. Send shows a toast, not real email.
5. A delivery log row is stored: recipient, trigger, template, channel, time, status (`sent` / `skipped` in this prototype).
6. The action is written to the Job Tender audit trail (BR-JTM-009, BR-JTA-010).

Reuse the existing Welcome Email placeholders where they fit. Add result and reminder templates next to it. Do not build SMTP.

### Event matrix (from BRD)

| Event | BRD IDs | Recipients | When |
|---|---|---|---|
| Vacancy published | UC-JTA-03, RNA Job Tender row | Employees in marketplace scope, HCBP, Job Tender Admin | Vacancy status becomes Published |
| Saved Job Reminder | BR-JTM-003, BR-JTA-004, US-JTM-03 | Employee who saved the vacancy | Application deadline H-3 and H-1 |
| Saved vacancy closed | US-JTM-03.2 | Employee who saved the vacancy | Vacancy Closed or Auto Closed |
| Pipeline Notice | US-JTM-05, BR-JTM-002 | Applicant; Line Manager if in scope | Application stage changes |
| Interview Invitation | KMPLUS 3.1.8.c — **BRD extension** | Applicant and named interviewer | Admin moves applicant to Interview after filling invite fields |
| Close Result Notice | UC-JTA-05, KMPLUS 3.1.8.e | That applicant on Accepted/Rejected; every still-open applicant on vacancy Close | Stage Accepted/Rejected, or vacancy Closed |

RNA baseline recipients for Job Tender: Employee, HCBP, Job Tender Admin. Line Manager sees pipeline visibility per JTM access table.

### Interview Invitation (BRD extension)

Job Tender Marketplace §4.2 keeps “interview scheduling detail” out of scope. This slice extends that for KMPLUS 3.1.8.c.

When Admin clicks Move to Interview:

1. Block the stage change until date/time, location or link, and interviewer name are filled.
2. Optional interviewer position, matching the mail template.
3. On confirm, set stage to Interview and fire Interview Invitation.
4. Fill: `[candidate_name]`, `[job_position]`, `[company]`, `[interview_date_and_start_time]`, `[interview_location_or_link]`, `[interviewer_name]`, `[interviewer_position]`.
5. Do not create a calendar event. Do not sync Outlook or Google Calendar.

Admin may still move other stages without this form.

### Close Result Notice

- When one applicant becomes Accepted or Rejected, send that person a result notice.
- When the vacancy is Closed or Auto Closed, every applicant still in Submitted, Under Review, Shortlisted, or Interview becomes Rejected with reason “Vacancy closed”, then each of them gets a result notice. Applicants already Accepted or Rejected are not sent a second close notice.

### Prototype demo hooks

Because this is a simulation, Admin needs a way to fire H-3/H-1 without waiting for real dates. A “Run reminder now” control on a saved vacancy or on Job Tender HQ is enough. The notice copy must still say H-3 or H-1.

## Out of scope

- SMTP or a real mail server
- A calendar product, booking, or `.ics`
- Rebuilding Organization Management, Competency Assessment, 360, or Secondary Assignment
- Moving Onboarding HQ out of Settings
- Deleting the Deprecated Performance codebase
- Data Sample / Data Set pack (inspection item 7, not a screen)

## Related shell defect (not BRD)

Sidebar collapse flickers, and the inner content corner goes square while scrolling. Cause: the white sheet’s `rounded-tl` sits inside the scrolling `main`, so the curve scrolls away. Fix in the shell, not in these slices. Track separately if it is not done in the same pass.

## Suggested build order

1. Slice 1 — platform switcher (~10 minutes)
2. Slice 2 — Onboarding side menu
3. Slice 3 shared path + Pipeline Notice + Interview Invitation
4. Close Result Notice sweep
5. Saved Job Reminder and publish/close notices
6. Shell corner / flicker if still open
