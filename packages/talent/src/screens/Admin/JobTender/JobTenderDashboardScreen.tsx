import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Briefcase, Clock, GraduationCap, Sparkles } from "lucide-react";
import {
  Badge,
  Button,
  FilterRail,
  PageHeader,
  SectionPanel,
  StatCard,
  StatCardGroup,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@rinjani/shared-ui";
import { AdminLayout } from "../../../components/shell/AdminLayout";
import { isPositionComplete } from "../../../lib/org-management";
import { isSecondaryAssignment, opportunityLabel, type OpportunityType } from "../../../lib/job-tender-admin";
import { getPosition } from "../../../data/orgManagementData";
import { jobTenderOverview, listVacancies, subscribeJobTenderStore } from "../../../data/jobTenderAdminData";

const STATUS_TONE: Record<string, "neutral" | "info" | "success" | "warning" | "destructive"> = {
  draft: "neutral",
  pending_approval: "warning",
  approved: "info",
  published: "success",
  on_hold: "warning",
  closed: "neutral",
  auto_closed: "neutral",
  revision_required: "destructive",
  rejected: "destructive",
};

export function JobTenderDashboardScreen() {
  const [typeFilter, setTypeFilter] = useState<"all" | "secondary" | OpportunityType>("secondary");
  const [vacancies, setVacancies] = useState(listVacancies());

  useEffect(() => subscribeJobTenderStore(() => setVacancies(listVacancies())), []);

  const stats = jobTenderOverview();
  const rows = useMemo(() => {
    return vacancies.filter((vacancy) => {
      if (typeFilter === "all") return true;
      if (typeFilter === "secondary") return isSecondaryAssignment(vacancy.opportunityType);
      return vacancy.opportunityType === typeFilter;
    });
  }, [typeFilter, vacancies]);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[var(--layout-max-width-governance)] space-y-6 px-4 pb-10 pt-6 md:px-6 lg:px-8">
        <PageHeader
          variant="governance"
          eyebrow="Job Tender Headquarters"
          title="Admin Job Tender"
          description="Publish internal opportunities from a complete Position Master. Secondary Assignment covers Experience and Learning project assignments while Talent Mobility stays on structural moves."
          badge={<StatusBadge status="info">BPR-THQ-005</StatusBadge>}
          actions={
            <Button asChild>
              <Link to="/talent/admin/job-tender/create">Create vacancy</Link>
            </Button>
          }
        />

        <StatCardGroup>
          <StatCard label="Vacancies" value={stats.total} description="All opportunity types in this prototype." icon={<Briefcase className="size-5" />} tone="info" />
          <StatCard label="Experience & Learning" value={stats.secondary} description={`${stats.experience} experience · ${stats.learning} learning`} icon={<GraduationCap className="size-5" />} tone="success" />
          <StatCard label="Pending approval" value={stats.pending} description="Cannot publish until approved." icon={<Clock className="size-5" />} tone="warning" />
          <StatCard label="Blocked by master" value={stats.blockedIncomplete} description="Position Master incomplete." icon={<Sparkles className="size-5" />} tone="destructive" />
        </StatCardGroup>

        <FilterRail title="Opportunity type" description="Week 37 prototype focus is Secondary Assignment: Experience & Learning.">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "secondary", label: "Experience & Learning" },
              { id: "experience", label: "Experience" },
              { id: "learning", label: "Learning" },
              { id: "talent_mobility", label: "Talent Mobility" },
              { id: "all", label: "All" },
            ].map((item) => (
              <Button key={item.id} type="button" variant={typeFilter === item.id ? "secondary" : "outline"} onClick={() => setTypeFilter(item.id as typeof typeFilter)}>
                {item.label}
              </Button>
            ))}
          </div>
        </FilterRail>

        <SectionPanel title="Vacancy pipeline" description="Lifecycle: Draft → Pending Approval → Approved → Published → Closed / Auto Closed." contentClassName="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vacancy</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Position readiness</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Deadline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((vacancy) => {
                const position = getPosition(vacancy.positionId);
                const complete = position ? isPositionComplete(position) : false;
                return (
                  <TableRow key={vacancy.id}>
                    <TableCell>
                      <Link to={`/talent/admin/job-tender/${vacancy.id}`} className="font-medium text-primary hover:underline">
                        {vacancy.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">{vacancy.id} · {vacancy.unit}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isSecondaryAssignment(vacancy.opportunityType) ? "info" : "neutral"}>
                        {opportunityLabel(vacancy.opportunityType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={complete ? "success" : "warning"}>{complete ? "Master complete" : "Incomplete"}</StatusBadge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={STATUS_TONE[vacancy.status] ?? "neutral"}>{vacancy.status.replaceAll("_", " ")}</StatusBadge>
                    </TableCell>
                    <TableCell>{vacancy.applicantCount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{vacancy.deadline}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </SectionPanel>
      </div>
    </AdminLayout>
  );
}
