import { Link } from "react-router";
import { ClipboardCheck, LineChart } from "lucide-react";
import {
  Button,
  PageHeader,
  SectionPanel,
  StatCard,
  StatCardGroup,
  StatusBadge,
} from "@rinjani/shared-ui";
import { Layout } from "../../components/shell/Layout";
import { competencyCycles, evaluationFor, hqEvaluationRows } from "../../data/competencyAssessmentData";

export function CompetencyAssessmentPage() {
  const openCycle = competencyCycles.find((item) => item.status === "open");
  const published = competencyCycles.find((item) => item.status === "published");
  const publishedEval = published ? evaluationFor(published.id) : null;

  return (
    <Layout>
      <div className="mx-auto max-w-[var(--layout-max-width-workspace)] space-y-6 px-4 pb-10 pt-6 md:px-6 lg:px-8">
        <PageHeader
          variant="workspace"
          eyebrow="My Talent Journey"
          title="Competency Assessment"
          description="Self Assessment Tools compare your current competency level with the Position Master profile. Evaluation reports use the EQS Kompetensi average per-item ratio."
          badge={<StatusBadge status="info">Self assessment</StatusBadge>}
        />

        <StatCardGroup>
          <StatCard
            label="Open cycle"
            value={openCycle ? "Q3 2026" : "None"}
            description={openCycle?.targetPositionName}
            icon={<ClipboardCheck className="size-5" />}
            tone="info"
          />
          <StatCard
            label="Latest EQS Kompetensi"
            value={publishedEval ? publishedEval.eqs.toFixed(2) : "—"}
            description="Average of min(individual / required, 1) × 100"
            icon={<LineChart className="size-5" />}
            tone="success"
          />
        </StatCardGroup>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionPanel title="Self Assessment Tools" description="Rate each required competency from 1 to 5 against the target position profile.">
            <div className="space-y-4">
              {competencyCycles.map((cycle) => (
                <div key={cycle.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{cycle.name}</p>
                      <p className="text-sm text-muted-foreground">{cycle.description}</p>
                    </div>
                    <StatusBadge status={cycle.status === "open" ? "warning" : "success"}>{cycle.status}</StatusBadge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <Link to={`/talent/competency-assessment/fill/${cycle.id}`}>
                        {cycle.status === "open" ? "Open self assessment" : "Review answers"}
                      </Link>
                    </Button>
                    {cycle.status !== "open" ? (
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/talent/competency-assessment/report/${cycle.id}`}>View evaluation report</Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </SectionPanel>

          <SectionPanel title="Assessment Evaluation Reports" description="HQ view of EQS Kompetensi and remaining gaps. Create IDP from a gap after the report is published.">
            <div className="space-y-3">
              {hqEvaluationRows.map((row) => (
                <div key={`${row.employee}-${row.cycle}`} className="rounded-2xl border border-border p-4">
                  <p className="font-medium">{row.employee}</p>
                  <p className="text-sm text-muted-foreground">{row.position} · {row.cycle}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm">
                    <span>EQS {row.eqs.toFixed(2)}</span>
                    <span>{row.gaps} gaps</span>
                    <StatusBadge status={row.status === "Published" ? "success" : "warning"}>{row.status}</StatusBadge>
                  </div>
                </div>
              ))}
              {published ? (
                <Button asChild variant="outline">
                  <Link to={`/talent/competency-assessment/report/${published.id}`}>Open my published report</Link>
                </Button>
              ) : null}
            </div>
          </SectionPanel>
        </div>
      </div>
    </Layout>
  );
}
