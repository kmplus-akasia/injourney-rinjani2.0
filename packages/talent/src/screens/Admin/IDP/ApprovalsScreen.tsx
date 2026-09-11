/**
 * HQ IDP Persetujuan IDP — folded from prototype Variant A (Queue SLA monitor).
 * Designed for thousands of proposals: dense table, facet filters, pagination, bulk remind.
 * Admin monitors / reminds / escalates; atasan remains the approver (BR-IDPA-005).
 */

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileSearch,
  Search,
  ShieldAlert,
  UserCheck,
  X,
} from "lucide-react";
import {
  Button,
  FilterRail,
  PageHeader,
  SectionPanel,
  StatCard,
  StatCardGroup,
  StatusBadge,
} from "@rinjani/shared-ui";
import { toast, Toaster } from "sonner@2.0.3";

import { AdminLayout } from "../../../components/shell/AdminLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  ACTIVITY_TYPE_LABEL,
  ApprovalQueueItem,
  ApprovalStage,
  approvalQueueMeta,
  defaultApprovalConfig,
  getProposedItemsForApproval,
  mockApprovalQueue,
} from "../../../data/idpApprovalPrototypeData";

const STAGE_LABEL: Record<ApprovalStage, string> = {
  awaiting_manager: "Menunggu Atasan",
  awaiting_hcbp: "Tinjauan HCBP",
  revision: "Revisi",
  active: "Aktif",
};

const SOURCE_LABEL: Record<ApprovalQueueItem["source"], string> = {
  self: "Diri sendiri",
  manager: "Ditugaskan atasan",
  system: "Sistem (gap)",
  admin_bulk: "Penugasan massal",
};

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

function formatSubmitted(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCount(value: number) {
  return value.toLocaleString("id-ID");
}

function StageBadge({ stage }: { stage: ApprovalStage }) {
  const status =
    stage === "active"
      ? "approved"
      : stage === "revision"
        ? "revision_requested"
        : stage === "awaiting_hcbp"
          ? "pending"
          : "pending_approval";
  return <StatusBadge status={status}>{STAGE_LABEL[stage]}</StatusBadge>;
}

function PgsChip({ item }: { item: ApprovalQueueItem }) {
  if (item.managerRole !== "pgs") return null;
  if (item.pgsAccess === "eligible") {
    return (
      <span className="rounded-md bg-success-muted px-1.5 py-0.5 text-[10px] font-semibold text-success">
        PGS boleh setujui
      </span>
    );
  }
  if (item.pgsAccess === "blocked") {
    return (
      <span className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
        PGS belum boleh
      </span>
    );
  }
  return null;
}

export function ApprovalsScreen() {
  const config = defaultApprovalConfig;
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("open");
  const [org, setOrg] = useState("all");
  const [jobFamily, setJobFamily] = useState("all");
  const [slaOnly, setSlaOnly] = useState(false);
  const [pgsFilter, setPgsFilter] = useState<"all" | "eligible" | "blocked">("all");
  const [sortKey, setSortKey] = useState<"waiting_desc" | "waiting_asc" | "submitted_desc" | "name_asc">("waiting_desc");
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(50);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [remindedIds, setRemindedIds] = useState<Set<string>>(new Set());
  const [escalatedIds, setEscalatedIds] = useState<Set<string>>(new Set());
  const [flash, setFlash] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<ApprovalQueueItem | null>(null);

  const orgs = useMemo(
    () => Array.from(new Set(mockApprovalQueue.map((item) => item.organization))).sort(),
    [],
  );
  const jobFamilies = useMemo(
    () => Array.from(new Set(mockApprovalQueue.map((item) => item.jobFamily))).sort(),
    [],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const rows = mockApprovalQueue.filter((item) => {
      const haystack = `${item.employeeName} ${item.managerName} ${item.position} ${item.id}`.toLowerCase();
      const matchesQuery = !normalized || haystack.includes(normalized);
      const matchesOrg = org === "all" || item.organization === org;
      const matchesFamily = jobFamily === "all" || item.jobFamily === jobFamily;
      const matchesSla = !slaOnly || item.slaBreached;
      const matchesPgs =
        pgsFilter === "all" ||
        (pgsFilter === "eligible" && item.pgsAccess === "eligible") ||
        (pgsFilter === "blocked" && item.pgsAccess === "blocked");
      const matchesStage =
        stage === "all"
          ? true
          : stage === "open"
            ? item.stage === "awaiting_manager" || item.stage === "awaiting_hcbp" || item.stage === "revision"
            : item.stage === stage;
      return matchesQuery && matchesOrg && matchesFamily && matchesSla && matchesPgs && matchesStage;
    });

    rows.sort((left, right) => {
      if (sortKey === "waiting_desc") return right.waitingDays - left.waitingDays;
      if (sortKey === "waiting_asc") return left.waitingDays - right.waitingDays;
      if (sortKey === "submitted_desc") return right.submittedAt.localeCompare(left.submittedAt);
      return left.employeeName.localeCompare(right.employeeName, "id");
    });
    return rows;
  }, [jobFamily, org, pgsFilter, query, slaOnly, sortKey, stage]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [query, stage, org, jobFamily, slaOnly, pgsFilter, sortKey, pageSize]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(null), 4000);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageSize, safePage]);

  const pageSelectedCount = pageRows.filter((row) => selectedIds.has(row.id)).length;
  const allPageSelected = pageRows.length > 0 && pageSelectedCount === pageRows.length;

  function announce(message: string) {
    setFlash(message);
    toast.success(message);
  }

  function toggleRow(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function togglePage(checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      pageRows.forEach((row) => {
        if (checked) next.add(row.id);
        else next.delete(row.id);
      });
      return next;
    });
  }

  function selectAllFiltered() {
    setSelectedIds(new Set(filtered.map((row) => row.id)));
    announce(`${formatCount(filtered.length)} proposal dipilih dari hasil filter`);
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function clearFilters() {
    setQuery("");
    setStage("open");
    setOrg("all");
    setJobFamily("all");
    setSlaOnly(false);
    setPgsFilter("all");
    setSortKey("waiting_desc");
  }

  const detailItems = detailItem ? getProposedItemsForApproval(detailItem) : [];
  const detailHours = detailItems.reduce((sum, row) => sum + row.durationHours, 0);

  function remindItems(items: ApprovalQueueItem[]) {
    const actionable = items.filter(
      (row) => row.stage === "awaiting_manager" && row.pgsAccess !== "blocked",
    );
    if (actionable.length === 0) {
      const message = "Tidak ada proposal menunggu atasan yang bisa diingatkan";
      setFlash(message);
      toast.error(message);
      return;
    }
    setRemindedIds((prev) => {
      const next = new Set(prev);
      actionable.forEach((row) => next.add(row.id));
      return next;
    });
    const managers = new Set(actionable.map((row) => row.managerName));
    announce(
      `Pengingat terkirim ke ${formatCount(managers.size)} atasan untuk ${formatCount(actionable.length)} proposal`,
    );
    clearSelection();
  }

  function escalateItem(item: ApprovalQueueItem) {
    setEscalatedIds((prev) => new Set(prev).add(item.id));
    announce(`Eskalasi HCBP dicatat untuk ${item.employeeName} (${item.hcbpUnit ?? "unit"})`);
  }

  function bulkRemind() {
    remindItems(filtered.filter((row) => selectedIds.has(row.id)));
  }

  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, filtered.length);
  const hasActiveFilters =
    query.trim() !== "" ||
    stage !== "open" ||
    org !== "all" ||
    jobFamily !== "all" ||
    slaOnly ||
    pgsFilter !== "all";

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="mx-auto max-w-[var(--layout-max-width-governance)] space-y-5 px-4 pb-10 pt-6 md:px-6 lg:px-8">
        <PageHeader
          variant="governance"
          eyebrow="IDP Admin · BPR-THQ-003"
          title="Persetujuan IDP"
          description={`Antrian pemantauan untuk ${formatCount(approvalQueueMeta.total)} proposal. Admin mengingatkan dan mengeskalasi; penyetujuan tetap di atasan (BR-IDPA-005).`}
          badge={<StatusBadge status="info">{formatCount(approvalQueueMeta.open)} terbuka</StatusBadge>}
          actions={
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={bulkRemind} disabled={selectedIds.size === 0}>
                <Bell className="size-4" />
                Ingatkan seleksi ({formatCount(selectedIds.size)})
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  remindItems(
                    filtered.filter((row) => row.stage === "awaiting_manager" && row.pgsAccess !== "blocked"),
                  )
                }
              >
                <Bell className="size-4" />
                Ingatkan semua hasil filter
              </Button>
            </div>
          }
        />

        {flash ? (
          <div
            role="status"
            className="flex items-start gap-3 rounded-[16px] border border-success/25 bg-success-muted/80 px-4 py-3 text-sm text-foreground"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
            <p className="flex-1 font-medium">{flash}</p>
            <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setFlash(null)}>
              <X className="size-4" />
            </button>
          </div>
        ) : null}

        <StatCardGroup>
          <StatCard
            label="Menunggu atasan"
            value={formatCount(approvalQueueMeta.awaitingManager)}
            tone="warning"
            icon={<Clock className="size-5" />}
          />
          <StatCard
            label="Tinjauan HCBP"
            value={formatCount(config.hcbpReviewEnabled ? approvalQueueMeta.awaitingHcbp : 0)}
            tone="info"
            icon={<UserCheck className="size-5" />}
            supportingText={config.hcbpReviewEnabled ? "Konfigurasi HCBP aktif" : "HCBP dimatikan"}
          />
          <StatCard
            label="SLA terlewati"
            value={formatCount(approvalQueueMeta.slaBreached)}
            tone="destructive"
            icon={<AlertTriangle className="size-5" />}
          />
          <StatCard
            label="PGS blocked"
            value={formatCount(approvalQueueMeta.blockedPgs)}
            tone="neutral"
            icon={<ShieldAlert className="size-5" />}
          />
        </StatCardGroup>

        <FilterRail actionsClassName="items-center">
          <div className="relative min-w-[220px] flex-1 basis-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari karyawan, atasan, atau posisi"
              aria-label="Cari karyawan, atasan, atau posisi"
              className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none ring-primary/30 focus:ring-2"
            />
          </div>
          <select
            value={stage}
            onChange={(event) => setStage(event.target.value)}
            aria-label="Status persetujuan"
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="open">Belum selesai</option>
            <option value="awaiting_manager">Menunggu atasan</option>
            <option value="awaiting_hcbp">Menunggu HCBP</option>
            <option value="revision">Perlu revisi</option>
            <option value="active">Sudah disetujui</option>
            <option value="all">Semua status</option>
          </select>
          <select
            value={org}
            onChange={(event) => setOrg(event.target.value)}
            aria-label="Perusahaan"
            className="h-10 max-w-[220px] rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="all">Semua perusahaan</option>
            {orgs.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={jobFamily}
            onChange={(event) => setJobFamily(event.target.value)}
            aria-label="Bidang kerja"
            className="h-10 max-w-[200px] rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="all">Semua bidang kerja</option>
            {jobFamilies.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={pgsFilter}
            onChange={(event) => setPgsFilter(event.target.value as typeof pgsFilter)}
            aria-label="Status akses PGS"
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="all">Semua akses PGS</option>
            <option value="eligible">PGS sudah boleh menyetujui</option>
            <option value="blocked">PGS belum boleh menyetujui</option>
          </select>
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as typeof sortKey)}
            aria-label="Urutkan"
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="waiting_desc">Waktu sejak diajukan terlama</option>
            <option value="waiting_asc">Waktu sejak diajukan tersingkat</option>
            <option value="submitted_desc">Pengajuan terbaru</option>
            <option value="name_asc">Nama A–Z</option>
          </select>
          <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm">
            <input
              type="checkbox"
              checked={slaOnly}
              onChange={(event) => setSlaOnly(event.target.checked)}
              className="size-4 accent-[var(--color-primary)]"
            />
            Hanya lewat batas waktu
          </label>
          {hasActiveFilters ? (
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              <X className="size-3.5" />
              Hapus filter
            </Button>
          ) : null}
        </FilterRail>

        <SectionPanel
          title="Antrian persetujuan"
          description="Per baris: Ingatkan atasan, Eskalasi HCBP, atau Lihat IDP. Admin tidak menyetujui atau menolak IDP."
          actions={
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>
                Menampilkan {formatCount(rangeStart)}–{formatCount(rangeEnd)} dari{" "}
                <strong className="text-foreground">{formatCount(filtered.length)}</strong> hasil filter
              </span>
              <select
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value) as (typeof PAGE_SIZE_OPTIONS)[number])}
                className="h-8 rounded-lg border border-border bg-background px-2 text-xs"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} / halaman
                  </option>
                ))}
              </select>
            </div>
          }
        >
          {selectedIds.size > 0 ? (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[16px] border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
              <span className="font-medium text-foreground">{formatCount(selectedIds.size)} dipilih</span>
              {selectedIds.size < filtered.length ? (
                <Button type="button" size="sm" variant="outline" onClick={selectAllFiltered}>
                  Pilih semua {formatCount(filtered.length)} hasil filter
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">Semua hasil filter sudah dipilih</span>
              )}
              <Button type="button" size="sm" variant="outline" onClick={bulkRemind}>
                <Bell className="size-3.5" />
                Ingatkan seleksi
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={clearSelection}>
                Batalkan seleksi
              </Button>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-[20px] border border-border">
            <div className="max-h-[640px] overflow-auto">
              <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-muted/95 text-[11px] uppercase tracking-wide text-muted-foreground backdrop-blur">
                  <tr>
                    <th className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={(event) => togglePage(event.target.checked)}
                        aria-label="Pilih semua di halaman ini"
                        className="size-4 accent-[var(--color-primary)]"
                      />
                    </th>
                    <th className="px-3 py-2.5 font-semibold">Karyawan</th>
                    <th className="px-3 py-2.5 font-semibold">Atasan / PGS</th>
                    <th className="px-3 py-2.5 font-semibold">Tahap</th>
                    <th className="px-3 py-2.5 font-semibold">Sumber</th>
                    <th className="px-3 py-2.5 font-semibold">Waktu Sejak Diajukan</th>
                    <th className="sticky right-0 z-10 bg-muted/95 px-3 py-2.5 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {pageRows.map((item) => {
                    const reminded = remindedIds.has(item.id);
                    const escalated = escalatedIds.has(item.id);
                    return (
                      <tr key={item.id} className="align-top hover:bg-muted/25">
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={(event) => toggleRow(item.id, event.target.checked)}
                            aria-label={`Pilih ${item.employeeName}`}
                            className="size-4 accent-[var(--color-primary)]"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="font-semibold text-foreground">{item.employeeName}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.position} · {item.organization}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {item.id} · {item.hours} jam · {item.activityCount} aktivitas
                          </p>
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="font-medium text-foreground">{item.managerName}</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <PgsChip item={item} />
                            {item.managerRole === "definitif" ? (
                              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                Definitif
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <StageBadge stage={item.stage} />
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{SOURCE_LABEL[item.source]}</td>
                        <td className="px-3 py-2.5">
                          <p className={item.slaBreached ? "font-semibold text-destructive" : "tabular-nums text-foreground"}>
                            {item.waitingDays} hari lalu
                          </p>
                          <p className="text-[11px] text-muted-foreground">{formatSubmitted(item.submittedAt)}</p>
                        </td>
                        <td className="sticky right-0 z-[1] bg-card px-3 py-2.5">
                          <div className="relative z-[2] flex min-w-[120px] flex-col items-stretch gap-1">
                            {item.stage === "awaiting_manager" && item.pgsAccess !== "blocked" ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-8 justify-start px-2 text-xs"
                                disabled={reminded}
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  remindItems([item]);
                                }}
                              >
                                <Bell className="size-3.5" />
                                {reminded ? "Sudah diingatkan" : "Ingatkan"}
                              </Button>
                            ) : null}
                            {item.stage === "awaiting_hcbp" ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-8 justify-start px-2 text-xs"
                                disabled={escalated}
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  escalateItem(item);
                                }}
                              >
                                {escalated ? "Sudah dieskalasi" : "Eskalasi"}
                              </Button>
                            ) : null}
                            {item.pgsAccess === "blocked" ? (
                              <span className="px-1 text-[11px] text-muted-foreground">PGS belum aktif</span>
                            ) : null}
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 justify-start px-2 text-xs"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                setDetailItem(item);
                              }}
                            >
                              <FileSearch className="size-3.5" />
                              Lihat
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {pageRows.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">Tidak ada proposal pada filter ini.</div>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Halaman {formatCount(safePage)} dari {formatCount(pageCount)} · checkbox halaman ini tidak memuat seluruh
              antrian — gunakan “Pilih semua hasil filter” untuk aksi massal.
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={safePage <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft className="size-4" />
                Sebelumnya
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={safePage >= pageCount}
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              >
                Berikutnya
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </SectionPanel>
      </div>

      <Dialog open={Boolean(detailItem)} onOpenChange={(open) => !open && setDetailItem(null)}>
        <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 py-5">
            <DialogTitle>Detail pengajuan IDP</DialogTitle>
            <DialogDescription>
              Daftar butir pengembangan yang diajukan. Tampilan hanya baca untuk admin HQ.
            </DialogDescription>
          </DialogHeader>
          {detailItem ? (
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5 text-sm">
              <div className="rounded-[16px] border border-border bg-muted/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{detailItem.employeeName}</p>
                    <p className="text-muted-foreground">
                      {detailItem.position} · {detailItem.organization}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{detailItem.jobFamily}</p>
                  </div>
                  <StageBadge stage={detailItem.stage} />
                </div>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-xs text-muted-foreground">Atasan</dt>
                    <dd className="mt-1 font-medium">{detailItem.managerName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Sumber pengajuan</dt>
                    <dd className="mt-1 font-medium">{SOURCE_LABEL[detailItem.source]}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Diajukan</dt>
                    <dd className="mt-1 font-medium">{formatSubmitted(detailItem.submittedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Waktu Sejak Diajukan</dt>
                    <dd className={`mt-1 font-medium ${detailItem.slaBreached ? "text-destructive" : ""}`}>
                      {detailItem.waitingDays} hari lalu
                    </dd>
                  </div>
                </dl>
                {detailItem.notes ? (
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">{detailItem.notes}</p>
                ) : null}
                {detailItem.pgsNote ? (
                  <p className="mt-2 rounded-[12px] border border-warning/30 bg-warning-muted/60 px-3 py-2 text-xs leading-5">
                    {detailItem.pgsNote}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-foreground">Butir IDP yang diajukan</h3>
                  <p className="text-xs text-muted-foreground">
                    {formatCount(detailItems.length)} butir · total {formatCount(detailHours)} jam rencana
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {detailItems.map((proposed, index) => (
                  <article
                    key={proposed.id}
                    className="rounded-[16px] border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Butir {index + 1}
                        </p>
                        <h4 className="mt-1 text-base font-semibold text-foreground">{proposed.title}</h4>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <StatusBadge status="info">{ACTIVITY_TYPE_LABEL[proposed.activityType]}</StatusBadge>
                        <StatusBadge status="neutral">Prioritas {proposed.priority}</StatusBadge>
                      </div>
                    </div>

                    <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-muted-foreground">Alasan pengembangan</dt>
                        <dd className="mt-1 font-medium">{proposed.reasonTag}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Fokus kompetensi</dt>
                        <dd className="mt-1 font-medium">{proposed.competencyFocus}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Durasi rencana</dt>
                        <dd className="mt-1 font-medium tabular-nums">{proposed.durationHours} jam</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Target selesai</dt>
                        <dd className="mt-1 font-medium">{formatSubmitted(proposed.targetDate)}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs text-muted-foreground">Target keluaran</dt>
                        <dd className="mt-1 font-medium">{proposed.targetOutput}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs text-muted-foreground">Bukti penyelesaian yang dibutuhkan</dt>
                        <dd className="mt-1 text-muted-foreground">{proposed.evidenceRequired}</dd>
                      </div>
                      {proposed.notes ? (
                        <div className="sm:col-span-2">
                          <dt className="text-xs text-muted-foreground">Catatan butir</dt>
                          <dd className="mt-1 text-muted-foreground">{proposed.notes}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
          <DialogFooter className="gap-2 border-t border-border px-6 py-4 sm:justify-between">
            {detailItem?.stage === "awaiting_manager" && detailItem.pgsAccess !== "blocked" ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  remindItems([detailItem]);
                }}
              >
                <Bell className="size-4" />
                Ingatkan atasan
              </Button>
            ) : (
              <span />
            )}
            <Button type="button" onClick={() => setDetailItem(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
