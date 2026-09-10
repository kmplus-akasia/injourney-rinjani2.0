import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Flag,
  GitBranch,
  Network,
  Users,
} from "lucide-react";
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
import { AdminLayout } from "../../components/shell/AdminLayout";
import { isPositionComplete } from "../../lib/org-management";
import {
  listAudits,
  listPositions,
  orgBandTiers,
  orgJobFamilies,
  orgOverview,
  positionReadiness,
  subscribeOrgStore,
} from "../../data/orgManagementData";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "positions", label: "Position Master" },
  { id: "structure", label: "Structure" },
  { id: "rules", label: "Band & Job Family" },
  { id: "audit", label: "Audit" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function OrganizationManagementPage() {
  const [tab, setTab] = useState<TabId>("overview");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "incomplete" | "ksp" | "secondary">("all");
  const [positions, setPositions] = useState(listPositions());
  const [audits, setAudits] = useState(listAudits());

  useEffect(() => {
    return subscribeOrgStore(() => {
      setPositions(listPositions());
      setAudits(listAudits());
    });
  }, []);

  const stats = orgOverview();
  const filtered = useMemo(() => {
    return positions.filter((position) => {
      const haystack = `${position.name} ${position.id} ${position.unit} ${position.jobFamily ?? ""}`.toLowerCase();
      if (query && !haystack.includes(query.toLowerCase())) return false;
      if (filter === "incomplete") return !isPositionComplete(position);
      if (filter === "ksp") return position.ksp;
      if (filter === "secondary") return position.assignmentKind === "secondary";
      return true;
    });
  }, [filter, positions, query]);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[var(--layout-max-width-governance)] space-y-6 px-4 pb-10 pt-6 md:px-6 lg:px-8">
        <PageHeader
          variant="governance"
          eyebrow="Talent Admin Headquarter"
          title="Organization Management"
          description="Position Master, structure, Band tiering, KSP flags, and completeness control for Career Aspiration, Job Tender, Succession, and EQS."
          badge={<StatusBadge status="info">BPR-THQ-002</StatusBadge>}
        />

        <StatCardGroup>
          <StatCard label="Positions" value={stats.total} description="Active organization master records." icon={<Building2 className="size-5" />} tone="info" />
          <StatCard label="Complete" value={stats.complete} description="Eligible as Talent target positions." icon={<CheckCircle2 className="size-5" />} tone="success" />
          <StatCard label="Incomplete" value={stats.incomplete} description="Hidden from aspiration, vacancy, and succession." icon={<AlertTriangle className="size-5" />} tone="warning" />
          <StatCard label="KSP / Secondary" value={`${stats.ksp} / ${stats.secondary}`} description="Strategic positions and secondary assignments." icon={<Flag className="size-5" />} tone="neutral" />
        </StatCardGroup>

        <FilterRail title="Workspace" description="Switch between master data, structure, movement rules, and audit.">
          <div className="flex flex-wrap gap-2">
            {TABS.map((item) => (
              <Button key={item.id} type="button" variant={tab === item.id ? "secondary" : "outline"} onClick={() => setTab(item.id)}>
                {item.label}
              </Button>
            ))}
          </div>
        </FilterRail>

        {tab === "overview" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <SectionPanel title="Incomplete positions blocking Talent" description="These records fail the master completeness gate and cannot be selected as target positions.">
              <div className="space-y-3">
                {positions.filter((item) => !isPositionComplete(item)).map((position) => {
                  const readiness = positionReadiness(position);
                  return (
                    <Link
                      key={position.id}
                      to={`/talent/org-management/positions/${position.id}`}
                      className="block rounded-2xl border border-warning/30 bg-warning-muted/50 p-4 hover:border-warning"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{position.name}</p>
                          <p className="text-xs text-muted-foreground">{position.id} · {position.unit}</p>
                        </div>
                        <StatusBadge status="warning">Incomplete</StatusBadge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Missing: {readiness.missingFields.join(", ")}</p>
                    </Link>
                  );
                })}
              </div>
            </SectionPanel>
            <SectionPanel title="Secondary assignments" description="Primary vs secondary assignment is required so Talent Pool can filter Experience & Learning roles.">
              <div className="space-y-3">
                {positions.filter((item) => item.assignmentKind === "secondary").map((position) => (
                  <div key={position.id} className="rounded-2xl border border-border p-4">
                    <p className="font-semibold text-foreground">{position.name}</p>
                    <p className="text-sm text-muted-foreground">{position.jobRole} · Incumbent {position.incumbentName ?? "Vacant"}</p>
                    <Badge className="mt-2" variant="info">Secondary assignment</Badge>
                  </div>
                ))}
              </div>
            </SectionPanel>
          </div>
        ) : null}

        {tab === "positions" ? (
          <SectionPanel
            title="Position Master"
            description="Minimum fields: Position ID, name, company, unit, grade, Band, Job Family, and active status."
            actions={
              <div className="flex flex-wrap gap-2">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search position, unit, Job Family"
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
                />
                {(["all", "incomplete", "ksp", "secondary"] as const).map((item) => (
                  <Button key={item} type="button" size="sm" variant={filter === item ? "secondary" : "outline"} onClick={() => setFilter(item)}>
                    {item === "all" ? "All" : item === "incomplete" ? "Incomplete" : item === "ksp" ? "KSP" : "Secondary"}
                  </Button>
                ))}
              </div>
            }
            contentClassName="px-0 pb-0"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Job Family / Band</TableHead>
                  <TableHead>Incumbent</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Readiness</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((position) => {
                  const ready = isPositionComplete(position);
                  return (
                    <TableRow key={position.id}>
                      <TableCell>
                        <Link to={`/talent/org-management/positions/${position.id}`} className="font-medium text-primary hover:underline">
                          {position.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{position.id} · {position.unit}</p>
                      </TableCell>
                      <TableCell>
                        <p>{position.jobFamily ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">Band {position.band} · Tier {position.bandTier ?? "—"} · Grade {position.grade}</p>
                      </TableCell>
                      <TableCell>
                        {position.incumbentName ?? "Vacant"}
                        <p className="text-xs text-muted-foreground">{position.assignmentKind === "secondary" ? "Secondary" : "Primary"}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {position.ksp ? <Badge variant="attention">KSP</Badge> : null}
                          {position.vacancy ? <Badge variant="info">Vacant</Badge> : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={ready ? "success" : "warning"}>{ready ? "Eligible-ready" : "Incomplete"}</StatusBadge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </SectionPanel>
        ) : null}

        {tab === "structure" ? (
          <SectionPanel title="Reporting line" description="Parent-child position relationship used by My Team, Talent Pool scope, and Talent Committee Chair lock.">
            <div className="space-y-3">
              {positions.filter((item) => !item.parentPositionId).map((root) => (
                <StructureNode key={root.id} id={root.id} positions={positions} />
              ))}
            </div>
          </SectionPanel>
        ) : null}

        {tab === "rules" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <SectionPanel title="Band tiering" description="Movement cannot jump more than 1 tier from the employee's active Band tier.">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Band</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Grade range</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orgBandTiers.map((item) => (
                    <TableRow key={item.band}>
                      <TableCell>{item.band}</TableCell>
                      <TableCell>{item.tier}</TableCell>
                      <TableCell>{item.gradeRange}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionPanel>
            <SectionPanel title="Job Family mapping" description="Job Family is a transaction gate: Talent Mobility is strict, Project Assignment can be more flexible.">
              <div className="space-y-3">
                {orgJobFamilies.map((family) => (
                  <div key={family.id} className="rounded-2xl border border-border p-4">
                    <p className="font-medium">{family.name}</p>
                    <p className="text-sm text-muted-foreground">Related: {family.related.join(", ")}</p>
                  </div>
                ))}
              </div>
            </SectionPanel>
          </div>
        ) : null}

        {tab === "audit" ? (
          <SectionPanel title="Master change audit" description="Job Family, Band, grade, KSP, and reporting line changes keep actor, reason, old/new value, and effective date.">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Actor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audits.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap text-sm">{entry.timestamp.replace("T", " ").slice(0, 16)}</TableCell>
                    <TableCell>
                      <p className="font-medium">{entry.objectName}</p>
                      <p className="text-xs text-muted-foreground">{entry.source}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{entry.field}: {entry.oldValue || "—"} → {entry.newValue || "—"}</p>
                      <p className="text-xs text-muted-foreground">{entry.reason}</p>
                    </TableCell>
                    <TableCell>{entry.actor}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionPanel>
        ) : null}
      </div>
    </AdminLayout>
  );
}

function StructureNode({
  id,
  positions,
  depth = 0,
}: {
  id: string;
  positions: ReturnType<typeof listPositions>;
  depth?: number;
}) {
  const position = positions.find((item) => item.id === id);
  if (!position) return null;
  const children = positions.filter((item) => item.parentPositionId === id);
  return (
    <div className="rounded-2xl border border-border p-3" style={{ marginLeft: depth * 16 }}>
      <div className="flex items-center gap-2">
        {depth === 0 ? <Network className="size-4 text-primary" /> : <GitBranch className="size-4 text-muted-foreground" />}
        <Link to={`/talent/org-management/positions/${position.id}`} className="font-medium text-foreground hover:text-primary">
          {position.name}
        </Link>
        {position.ksp ? <Badge variant="attention">KSP</Badge> : null}
        {position.assignmentKind === "secondary" ? <Badge variant="info">Secondary</Badge> : null}
      </div>
      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <Users className="size-3" />
        {position.incumbentName ?? "Vacant"} · {position.unit}
      </p>
      {children.length ? (
        <div className="mt-3 space-y-2">
          {children.map((child) => (
            <StructureNode key={child.id} id={child.id} positions={positions} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
