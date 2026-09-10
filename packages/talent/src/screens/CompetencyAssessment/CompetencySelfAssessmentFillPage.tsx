import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  PageHeader,
  SectionPanel,
  StatusBadge,
} from "@rinjani/shared-ui";
import { Layout } from "../../components/shell/Layout";
import { competencyGap, eqsKompetensi } from "../../lib/competency-assessment";
import {
  getAnswers,
  getCycle,
  isSubmitted,
  saveAnswers,
  submitCycle,
} from "../../data/competencyAssessmentData";

export function CompetencySelfAssessmentFillPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const cycle = getCycle(id);
  const locked = isSubmitted(id);
  const [items, setItems] = useState(getAnswers(id));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (locked) return;
      saveAnswers(id, items);
      setSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 30000);
    return () => window.clearInterval(timer);
  }, [id, items, locked]);

  const eqs = useMemo(() => eqsKompetensi(items), [items]);
  const unanswered = items.filter((item) => !item.individualLevel).length;

  if (!cycle) {
    return (
      <Layout>
        <div className="p-8">Cycle not found.</div>
      </Layout>
    );
  }

  function setLevel(competencyId: string, level: number) {
    if (locked) return;
    setItems((current) => current.map((item) => (item.competencyId === competencyId ? { ...item, individualLevel: level } : item)));
  }

  function persistAndSubmit() {
    saveAnswers(id, items);
    submitCycle(id);
    setConfirmOpen(false);
    navigate(`/talent/competency-assessment/report/${id}`);
  }

  return (
    <Layout>
      <div className="mx-auto max-w-[var(--layout-max-width-workspace)] space-y-6 px-4 pb-10 pt-6 md:px-6 lg:px-8">
        <Link to="/talent/competency-assessment" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" /> Competency Assessment
        </Link>
        <PageHeader
          variant="workspace"
          eyebrow={cycle.targetPositionName}
          title={cycle.name}
          description="Rate yourself against the required level from Position Master. Scores are capped at 100 per item."
          badge={<StatusBadge status={locked ? "success" : "warning"}>{locked ? "Submitted" : "Draft auto-saves"}</StatusBadge>}
          actions={
            <div className="text-right text-sm text-muted-foreground">
              <p>Live EQS Kompetensi {eqs.toFixed(2)}</p>
              {savedAt ? <p>Last auto-save {savedAt}</p> : <p>Auto-save every 30 seconds</p>}
            </div>
          }
        />

        <SectionPanel title="Competency profile" description="Required levels come from Organization Management for the target position.">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.competencyId} className="rounded-2xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.competencyName}</p>
                    <p className="text-sm text-muted-foreground">{item.cluster} · Required level {item.requiredLevel} · Gap {competencyGap(item.individualLevel, item.requiredLevel)}</p>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        disabled={locked}
                        onClick={() => setLevel(item.competencyId, level)}
                        className={`size-10 rounded-full border text-sm font-semibold ${
                          item.individualLevel === level
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionPanel>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              saveAnswers(id, items);
              setSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
            }}
          >
            Save draft
          </Button>
          <Button type="button" disabled={locked || unanswered > 0} onClick={() => setConfirmOpen(true)}>
            Submit final
          </Button>
        </div>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit self assessment?</DialogTitle>
              <DialogDescription>
                Submitted answers become immutable. The evaluation report will use EQS Kompetensi {eqs.toFixed(2)}.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
                Continue editing
              </Button>
              <Button type="button" onClick={persistAndSubmit}>
                Confirm submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
