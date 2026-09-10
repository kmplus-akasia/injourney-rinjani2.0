import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import {
  Badge,
  Button,
  Field,
  FieldLabel,
  Input,
  PageHeader,
  SectionPanel,
  StatusBadge,
  Switch,
  Textarea,
} from "@rinjani/shared-ui";
import { AdminLayout } from "../../components/shell/AdminLayout";
import { getPosition, listAudits, positionReadiness, subscribeOrgStore, updatePosition } from "../../data/orgManagementData";

export function OrganizationPositionDetailPage() {
  const { id = "" } = useParams();
  const [, setTick] = useState(0);
  const position = getPosition(id);
  const [ksp, setKsp] = useState(position?.ksp ?? false);
  const [kspReason, setKspReason] = useState(position?.kspReason ?? "");
  const [jobFamily, setJobFamily] = useState(position?.jobFamily ?? "");
  const [bandTier, setBandTier] = useState(position?.bandTier?.toString() ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => subscribeOrgStore(() => setTick((value) => value + 1)), []);

  const audits = listAudits().filter((item) => item.objectId === id);

  if (!position) {
    return (
      <AdminLayout>
        <div className="p-8">Position not found.</div>
      </AdminLayout>
    );
  }

  function save() {
    updatePosition(position.id, {
      ksp,
      kspReason,
      jobFamily: jobFamily.trim() || null,
      bandTier: bandTier ? Number(bandTier) : null,
    }, {
      actor: "Ayu Lestari (OM Admin)",
      reason: "Manual completeness correction from Organization Management prototype.",
    });
    setSaved(true);
    setTick((value) => value + 1);
  }

  const live = getPosition(id) ?? position;
  const liveReady = positionReadiness(live);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[var(--layout-max-width-governance)] space-y-6 px-4 pb-10 pt-6 md:px-6 lg:px-8">
        <Link to="/talent/org-management" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" /> Back to Organization Management
        </Link>
        <PageHeader
          variant="governance"
          eyebrow={live.id}
          title={live.name}
          description={`${live.company} · ${live.unit}`}
          badge={<StatusBadge status={liveReady.complete ? "success" : "warning"}>{liveReady.complete ? "Eligible-ready" : "Incomplete"}</StatusBadge>}
          actions={
            <div className="flex items-center gap-3">
              {saved ? <span className="text-sm text-success">Saved</span> : null}
              <Button type="button" onClick={save}>
                Save effective version
              </Button>
            </div>
          }
        />

        {!liveReady.complete ? (
          <div className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning-muted p-4 text-sm">
            <ShieldAlert className="mt-0.5 size-4 text-warning" />
            <div>
              <p className="font-medium text-foreground">This position is not selectable in Talent modules.</p>
              <p className="text-muted-foreground">Missing {liveReady.missingFields.join(", ")}. Impacted: {liveReady.impactedModules.join(", ")}.</p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <SectionPanel title="Position identity" description="Minimum master fields used by Job Tender, Career Aspiration, Succession, and EQS.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>Job Family</FieldLabel>
                <Input value={jobFamily} onChange={(event) => setJobFamily(event.target.value)} placeholder="Required" />
              </Field>
              <Field>
                <FieldLabel>Band tier</FieldLabel>
                <Input value={bandTier} onChange={(event) => setBandTier(event.target.value)} placeholder="1–5" />
              </Field>
              <Field>
                <FieldLabel>Grade</FieldLabel>
                <Input value={String(live.grade)} readOnly />
              </Field>
              <Field>
                <FieldLabel>Band</FieldLabel>
                <Input value={live.band} readOnly />
              </Field>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-border p-4">
              <div>
                <p className="font-medium">Key Strategic Position</p>
                <p className="text-sm text-muted-foreground">KSP positions appear on the Succession Board.</p>
              </div>
              <Switch checked={ksp} onCheckedChange={setKsp} />
            </div>
            <Field className="mt-4">
              <FieldLabel>KSP / correction reason</FieldLabel>
              <Textarea value={kspReason} onChange={(event) => setKspReason(event.target.value)} />
            </Field>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant={live.assignmentKind === "secondary" ? "info" : "neutral"}>{live.assignmentKind === "secondary" ? "Secondary assignment" : "Primary assignment"}</Badge>
              {live.vacancy ? <Badge variant="info">Vacant</Badge> : <Badge variant="success">Incumbent {live.incumbentName}</Badge>}
            </div>
          </SectionPanel>

          <SectionPanel title="Audit trail" description="Manual edits are separated from source-system sync.">
            <div className="space-y-3">
              {audits.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-border p-3 text-sm">
                  <p className="font-medium">{entry.field}: {entry.oldValue || "—"} → {entry.newValue || "—"}</p>
                  <p className="text-muted-foreground">{entry.actor} · {entry.source}</p>
                  <p className="text-xs text-muted-foreground">{entry.reason}</p>
                </div>
              ))}
            </div>
          </SectionPanel>
        </div>
      </div>
    </AdminLayout>
  );
}
