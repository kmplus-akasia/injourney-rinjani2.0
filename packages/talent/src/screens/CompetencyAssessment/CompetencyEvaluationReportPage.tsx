import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import {
  Button,
  PageHeader,
  SectionPanel,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@rinjani/shared-ui";
import { Layout } from "../../components/shell/Layout";
import { competencyGap, gapSeverity, itemScore } from "../../lib/competency-assessment";
import { evaluationFor, getCycle } from "../../data/competencyAssessmentData";

export function CompetencyEvaluationReportPage() {
  const { id = "" } = useParams();
  const cycle = getCycle(id);
  const evaluation = evaluationFor(id);

  if (!cycle) {
    return (
      <Layout>
        <div className="p-8">Report not found.</div>
      </Layout>
    );
  }

  const chartData = evaluation.items.map((item) => ({
    subject: item.competencyName,
    current: item.individualLevel,
    required: item.requiredLevel,
    fullMark: 5,
  }));
  const gaps = evaluation.items.filter((item) => competencyGap(item.individualLevel, item.requiredLevel) > 0);

  return (
    <Layout>
      <div className="mx-auto max-w-[var(--layout-max-width-workspace)] space-y-6 px-4 pb-10 pt-6 md:px-6 lg:px-8">
        <Link to="/talent/competency-assessment" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" /> Competency Assessment
        </Link>
        <PageHeader
          variant="workspace"
          eyebrow="Assessment Evaluation Report"
          title={cycle.name}
          description={`Target position ${cycle.targetPositionName}. EQS Kompetensi is the average of capped per-item ratios.`}
          badge={<StatusBadge status="success">EQS {evaluation.eqs.toFixed(2)}</StatusBadge>}
        />

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionPanel title="Profile vs required">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 5]} />
                  <Radar name="Current" dataKey="current" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.2} />
                  <Radar name="Required" dataKey="required" stroke="var(--color-secondary)" fill="var(--color-secondary)" fillOpacity={0.08} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </SectionPanel>
          <SectionPanel title="Item scoring" description="score_i = min(individual / required, 1) × 100">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competency</TableHead>
                  <TableHead>Current / required</TableHead>
                  <TableHead>Item score</TableHead>
                  <TableHead>Gap</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluation.items.map((item) => {
                  const gap = competencyGap(item.individualLevel, item.requiredLevel);
                  return (
                    <TableRow key={item.competencyId}>
                      <TableCell>{item.competencyName}</TableCell>
                      <TableCell>{item.individualLevel} / {item.requiredLevel}</TableCell>
                      <TableCell>{itemScore(item.individualLevel, item.requiredLevel).toFixed(2)}</TableCell>
                      <TableCell>
                        <StatusBadge status={gapSeverity(gap) === "significant" ? "destructive" : gap ? "warning" : "success"}>
                          {gap ? `${gap} · ${gapSeverity(gap)}` : "Met"}
                        </StatusBadge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </SectionPanel>
        </div>

        <SectionPanel title="Create IDP from gap" description="Draft IDP is tagged System-generated with Reason Tag Gap Kompetensi.">
          {gaps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No remaining competency gaps on this report.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {gaps.map((item) => (
                <Button key={item.competencyId} asChild variant="outline">
                  <Link
                    to={`/talent/idp/editor?source=system-generated&reason=gap-kompetensi&competency=${encodeURIComponent(item.competencyName)}`}
                  >
                    Create IDP · {item.competencyName}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </SectionPanel>
      </div>
    </Layout>
  );
}
