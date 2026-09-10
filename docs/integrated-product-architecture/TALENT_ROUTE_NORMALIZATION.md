# Talent Route Normalization

Talent is now normalized under `/talent/*`.

## Rule

- All new Talent links must target `/talent/*`.
- Old root-level Talent paths exist only as compatibility redirects.

## Route map

| Legacy path | Integrated path |
| --- | --- |
| `/career-aspiration` | `/talent/career-aspiration` |
| `/talent-pool` | `/talent/talent-pool` |
| `/succession-planning` | `/talent/succession-planning` |
| `/talent-mapping` | `/talent/talent-mapping` |
| `/talent-review` | `/talent/talent-review` |
| `/supervisor-portal` | `/talent/supervisor-portal` |
| `/talent-committee` | `/talent/talent-committee` |
| `/explore` | `/talent/explore` |
| `/explore/:id` | `/talent/explore/:id` |
| `/my-applications` | `/talent/my-applications` |
| `/my-applications/:id` | `/talent/my-applications/:id` |
| `/saved` | `/talent/saved` |
| `/org-management` | `/talent/org-management` |
| `/org-management/positions/:id` | `/talent/org-management/positions/:id` |
| `/enterprise-architecture` | `/talent/enterprise-architecture` |
| `/idp` | `/talent/idp` |
| `/idp/dashboard` | `/talent/idp/dashboard` |
| `/idp/gap-analysis` | `/talent/idp/gap-analysis` |
| `/idp/recommendations` | `/talent/idp/recommendations` |
| `/idp/catalog` | `/talent/idp/catalog` |
| `/idp/editor` | `/talent/idp/editor` |
| `/idp/progress` | `/talent/idp/progress` |
| `/idp/detail/:id` | `/talent/idp/detail/:id` |
| `/idp/team` | `/talent/idp/team` |
| `/idp/review/:id` | `/talent/idp/review/:id` |
| `/idp/wrapped` | `/talent/idp/wrapped` |
| `/admin/idp` | `/talent/admin/idp` |
| `/admin/idp/cycles` | `/talent/admin/idp/cycles` |
| `/admin/idp/library` | `/talent/admin/idp/library` |
| `/admin/idp/tags` | `/talent/admin/idp/tags` |
| `/admin/idp/bulk-assign` | `/talent/admin/idp/bulk-assign` |
| `/admin/idp/reminders` | `/talent/admin/idp/reminders` |
| `/admin/idp/gap-report` | `/talent/admin/idp/gap-report` |
| `/admin/idp/approvals` | `/talent/admin/idp/approvals` |
| `/admin/idp/reports` | `/talent/admin/idp/reports` |
| `/admin/job-tender` | `/talent/admin/job-tender` |
| `/admin/job-tender/create` | `/talent/admin/job-tender/create` |
| `/admin/job-tender/:id` | `/talent/admin/job-tender/:id` |
| `/competency-assessment` | `/talent/competency-assessment` |
| `/competency-assessment/fill/:id` | `/talent/competency-assessment/fill/:id` |
| `/competency-assessment/report/:id` | `/talent/competency-assessment/report/:id` |
| `/360-assessment` | `/talent/360-assessment` |
| `/360-assessment/assigned` | `/talent/360-assessment/assigned` |
| `/360-assessment/fill/:id` | `/talent/360-assessment/fill/:id` |
| `/360-assessment/report/:id` | `/talent/360-assessment/report/:id` |
| `/360-assessment-hq` | `/talent/360-assessment-hq` |
| `/360-assessment-hq/create` | `/talent/360-assessment-hq/create` |
| `/360-assessment-hq/:id` | `/talent/360-assessment-hq/:id` |
| `/360-assessment-hq/:id/assessors` | `/talent/360-assessment-hq/:id/assessors` |
| `/360-assessment-hq/:id/monitoring` | `/talent/360-assessment-hq/:id/monitoring` |
| `/360-assessment-hq/:id/results` | `/talent/360-assessment-hq/:id/results` |

## Enforcement note

The integrated router still keeps redirect coverage for the legacy paths, but that coverage is transitional. The source packages should continue to remove root-level Talent links until redirect usage reaches zero.
