import { useMemo, useState } from "react";
import { useParams, Link } from "react-router";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Badge, Button, PageHeader, SectionPanel, StatusBadge } from "@rinjani/shared-ui";
import { Layout as AppShell } from "../../../../components/shell/Layout";
import { assessmentCycles, assessmentResults, findPreviousPublishedResult } from "../../../../lib/360-assessment/data";
import { applyAnonymityThreshold, channelsFromBreakdown } from "../../../../lib/360-assessment/anonymity";
import { compareCompetencyScores, isCompetencyGap } from "../../../../lib/360-assessment/compare";

const CHANNEL_LABELS: Record<string, string> = {
  superior: "Atasan",
  peer: "Rekan Kerja",
  subordinate: "Bawahan",
  self: "Diri Sendiri",
  others: "Combined Others",
};

function CompetencyRow({ competency }: { competency: { competency_name: string; score: number; max_score: number; behavior_scores: Array<{ behavior_indicator: string; score: number; max_score: number }> } }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const percent = (competency.score / competency.max_score) * 100;
  const gap = isCompetencyGap(competency.score, competency.max_score);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex-1 pr-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h4 className="font-medium text-foreground">{competency.competency_name}</h4>
            <span className="font-bold text-primary">
              {competency.score.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">/ {competency.max_score}</span>
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className={`h-full rounded-full ${gap ? "bg-warning" : "bg-primary"}`} style={{ width: `${percent}%` }} />
          </div>
        </div>
        <div className="ml-2 text-muted-foreground">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {isExpanded ? (
        <div className="border-t border-border bg-muted/10 px-4 pb-4">
          <div className="mt-3 space-y-3">
            {competency.behavior_scores.map((behavior, idx) => (
              <div key={idx} className="text-sm">
                <div className="mb-1 flex justify-between">
                  <span className="text-muted-foreground">{behavior.behavior_indicator}</span>
                  <span className="font-medium text-foreground">{behavior.score.toFixed(2)}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary/70" style={{ width: `${(behavior.score / behavior.max_score) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function AssessmentReportPage() {
  const params = useParams();
  const [compareOn, setCompareOn] = useState(true);
  const result = assessmentResults.find((row) => row.id === params.id);
  const anonymity = useMemo(
    () => applyAnonymityThreshold(channelsFromBreakdown(result?.channel_breakdown ?? [])),
    [result],
  );

  if (!result || result.status !== "published" || !result.channel_breakdown) {
    return (
      <AppShell>
        <div className="p-8 text-center">Data not found</div>
      </AppShell>
    );
  }

  const cycle = assessmentCycles.find((row) => row.id === result.cycle_id);
  const previous = findPreviousPublishedResult(result.id);
  const previousCycle = previous ? assessmentCycles.find((row) => row.id === previous.cycle_id) : undefined;
  const displayChannels = anonymity.combinedOthers
    ? [...anonymity.visible, anonymity.combinedOthers]
    : anonymity.visible;
  const comparison = compareOn && previous?.competency_scores
    ? compareCompetencyScores(result.competency_scores, previous.competency_scores)
    : [];
  const gaps = result.competency_scores.filter((item) => isCompetencyGap(item.score, item.max_score));

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <Link to="/talent/360-assessment" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <ChevronLeft size={16} className="mr-1" />
            Kembali ke Penilaian Saya
          </Link>
          <PageHeader
            variant="workspace"
            eyebrow="Multi Rater Feedback"
            title={cycle?.name ?? "360 Assessment Report"}
            description={cycle?.description ?? "Anonymous peer and subordinate scores stay combined until the k≥3 threshold is met."}
            badge={<StatusBadge status="success">Published</StatusBadge>}
            actions={
              <div className="rounded-2xl bg-primary px-5 py-4 text-center text-primary-foreground">
                <div className="text-sm font-medium opacity-90">Nilai Keseluruhan</div>
                <div className="text-4xl font-bold tracking-tight">
                  {result.overall_score.toFixed(2)}
                  <span className="text-lg font-normal opacity-70"> / {result.overall_max_score}</span>
                </div>
              </div>
            }
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant={cycle?.assessment_type === "behavioral" ? "info" : "neutral"}>
              {cycle?.assessment_type === "behavioral" ? "Perilaku" : "Kompetensi"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {cycle?.start_date && format(new Date(cycle.start_date), "dd MMM yyyy", { locale: id })} - {cycle?.end_date && format(new Date(cycle.end_date), "dd MMM yyyy", { locale: id })}
            </span>
          </div>
        </div>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Breakdown per Kompetensi</h2>
          <div className="grid gap-3">
            {result.competency_scores.map((comp, idx) => (
              <CompetencyRow key={idx} competency={comp} />
            ))}
          </div>
        </section>

        <SectionPanel
          title="Breakdown per Channel Evaluator"
          description="Peer and subordinate scores stay anonymous. If a channel has fewer than 3 assessors, Rinjani shows Combined Others instead of a named channel."
        >
          {anonymity.combinedOthers ? (
            <p className="mb-4 rounded-xl bg-warning-muted p-3 text-sm text-foreground">
              {anonymity.hiddenChannels.map((channel) => CHANNEL_LABELS[channel] ?? channel).join(" and ")} did not meet the k≥3 anonymity threshold, so those scores are shown as Combined Others.
            </p>
          ) : null}
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 font-medium text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3 text-right">Bobot</th>
                    <th className="px-4 py-3 text-right">Nilai Mentah</th>
                    <th className="px-4 py-3 text-right">Nilai Tertimbang</th>
                    <th className="px-4 py-3 text-center">Jumlah Penilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayChannels.map((channel) => (
                    <tr key={channel.channel} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">
                        {CHANNEL_LABELS[channel.channel] || channel.channel}
                        {channel.channel === "others" ? <Badge className="ml-2" variant="warning">Anonymous</Badge> : null}
                      </td>
                      <td className="px-4 py-3 text-right">{channel.weight}%</td>
                      <td className="px-4 py-3 text-right">{channel.rawScore.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-medium">{channel.weightedScore.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">{channel.assessorCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SectionPanel>

        <SectionPanel
          title="Compare periods"
          description="Compare this published result with the previous cycle of the same assessment type."
          actions={
            previous ? (
              <Button type="button" size="sm" variant={compareOn ? "secondary" : "outline"} onClick={() => setCompareOn((value) => !value)}>
                {compareOn ? "Hide comparison" : "Show comparison"}
              </Button>
            ) : null
          }
        >
          {!previous ? (
            <p className="text-sm text-muted-foreground">No earlier published result of the same type is available yet.</p>
          ) : compareOn ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Current {cycle?.name} vs previous {previousCycle?.name} ({previous.overall_score.toFixed(2)} overall).
              </p>
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-muted-foreground">
                  <tr>
                    <th className="py-2">Competency</th>
                    <th className="py-2 text-right">Previous</th>
                    <th className="py-2 text-right">Current</th>
                    <th className="py-2 text-right">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {comparison.map((row) => (
                    <tr key={row.name}>
                      <td className="py-2 font-medium">{row.name}</td>
                      <td className="py-2 text-right">{row.previous?.toFixed(2) ?? "—"}</td>
                      <td className="py-2 text-right">{row.current.toFixed(2)}</td>
                      <td className={`py-2 text-right ${row.delta && row.delta < 0 ? "text-destructive" : "text-success"}`}>
                        {row.delta === null ? "—" : `${row.delta > 0 ? "+" : ""}${row.delta.toFixed(2)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Comparison is hidden.</p>
          )}
        </SectionPanel>

        <SectionPanel title="Create IDP from gap" description="Draft IDP is tagged System-generated with Reason Tag Gap Kompetensi for competencies below 80% of the scale.">
          {gaps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No competency on this report is below the 80% gap threshold.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {gaps.map((item) => (
                <Button key={item.competency_name} asChild variant="outline">
                  <Link
                    to={`/talent/idp/editor?source=system-generated&reason=gap-kompetensi&competency=${encodeURIComponent(item.competency_name)}`}
                  >
                    Create IDP · {item.competency_name}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </SectionPanel>
      </div>
    </AppShell>
  );
}
