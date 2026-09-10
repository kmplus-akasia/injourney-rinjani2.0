# Rinjani Integrated Sitemap

This document reflects the current integrated route tree and navigation ownership rules.

## Navigation model

- The integrated host shell owns the global header.
- The global header owns platform switching, global search, notifications, and role/profile actions.
- The left sidebar shows only the active platform's modules.
- Talent now lives under a strict `/talent/*` subtree.
- Legacy pre-integration Talent paths are preserved only as redirects.

## Authentication

- `/login`
- `/login/microsoft`

## Portal

Sidebar group: `Portal Home`

- `/`
- `/my-profile`
- `/hc-policy`
- `/employee-profile/:email`
- `/survey`
- `/survey/take/:surveyId`
- `/survey/analytics/:surveyId`

Sidebar group: `Administration`

- `/analytics`
- `/mail`
- `/offboarding`
- `/settings`
- `/survey/management`

## Talent

Sidebar group: `My Talent Journey`

- `/talent`
- `/talent/career-aspiration`
- `/talent/idp`
- `/talent/idp/dashboard`
- `/talent/idp/gap-analysis`
- `/talent/idp/recommendations`
- `/talent/idp/catalog`
- `/talent/idp/editor`
- `/talent/idp/progress`
- `/talent/idp/detail/:id`
- `/talent/idp/team`
- `/talent/idp/review/:id`
- `/talent/idp/wrapped`
- `/talent/360-assessment`
- `/talent/360-assessment/assigned`
- `/talent/360-assessment/fill/:id`
- `/talent/360-assessment/report/:id`
- `/talent/competency-assessment`
- `/talent/competency-assessment/fill/:id`
- `/talent/competency-assessment/report/:id`
- `/talent/explore`
- `/talent/explore/:id`
- `/talent/my-applications`
- `/talent/my-applications/:id`
- `/talent/saved`

Sidebar group: `Talent Management`

- `/talent/talent-pool`
- `/talent/succession-planning`
- `/talent/talent-mapping`
- `/talent/talent-review`
- `/talent/supervisor-portal`
- `/talent/talent-committee`

Sidebar group: `Administration`

- `/talent/admin/job-tender`
- `/talent/admin/job-tender/create`
- `/talent/admin/job-tender/:id`
- `/talent/admin/idp`
- `/talent/admin/idp/cycles`
- `/talent/admin/idp/library`
- `/talent/admin/idp/tags`
- `/talent/admin/idp/bulk-assign`
- `/talent/admin/idp/reminders`
- `/talent/admin/idp/gap-report`
- `/talent/admin/idp/approvals`
- `/talent/admin/idp/reports`
- `/talent/360-assessment-hq`
- `/talent/360-assessment-hq/create`
- `/talent/360-assessment-hq/:id`
- `/talent/360-assessment-hq/:id/assessors`
- `/talent/360-assessment-hq/:id/monitoring`
- `/talent/360-assessment-hq/:id/results`
- `/talent/org-management`
- `/talent/org-management/positions/:id`

Hidden/non-sidebar route

- `/talent/enterprise-architecture`

## Performance

Sidebar group: `Performance`

- `/performance/my-kpi`
- `/performance/my-kpi/planning`
- `/performance/my-kpi/goal-setting`
- `/performance/my-kpi/check-in`
- `/performance/my-kpi/evaluation`
- `/performance/my-kpi/year-end`
- `/performance/my-team-kpi`
- `/performance/my-team-kpi/planning`
- `/performance/my-team-kpi/cascade`
- `/performance/my-team-kpi/member/:memberId`
- `/performance/my-team-kpi/planning/:memberId`
- `/performance/kpi-library`
- `/performance/kpi-library/submit`
- `/performance/kpi-library/:kpiId`
- `/performance/kpi-tree`
- `/performance/kpi-headquarter`

## Redirect compatibility

Legacy Talent paths remain wired as redirects so older internal links still resolve while the integrated codebase finishes normalization. New code should only link to `/talent/*`.
