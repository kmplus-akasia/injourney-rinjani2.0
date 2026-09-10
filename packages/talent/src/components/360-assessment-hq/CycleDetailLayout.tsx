import { ReactNode } from "react";
import { Link, useParams, useLocation } from "react-router";
import { Layout as AppShell } from "../shell/Layout";
import { assessmentCycles } from "../../lib/360-assessment-hq/data";
import { ChevronLeft, Play } from "lucide-react";
import { cn } from "../ui/utils";
import { format } from "date-fns";
import { toast } from "sonner@2.0.3";

export function CycleDetailLayout({ children }: { children: ReactNode }) {
  const { id } = useParams();
  const location = useLocation();
  const cycle = assessmentCycles.find(c => c.id === id);

  if (!cycle) {
    return (
      <AppShell>
        <div className="p-8 text-center">Siklus penilaian tidak ditemukan.</div>
      </AppShell>
    );
  }

  const handleActivate = () => {
    if (confirm("Siklus akan diaktifkan dan assessor akan menerima notifikasi. Lanjutkan?")) {
      toast.success("Siklus berhasil diaktifkan");
      // Update logic would go here
    }
  };

  const tabs = [
    { label: "Penetapan Assessor", path: `/talent/360-assessment-hq/${id}/assessors`, isActive: location.pathname.includes("/assessors") },
    { label: "Monitoring Penyelesaian", path: `/talent/360-assessment-hq/${id}/monitoring`, isActive: location.pathname.includes("/monitoring") },
    { label: "Hasil Penilaian", path: `/talent/360-assessment-hq/${id}/results`, isActive: location.pathname.includes("/results") },
  ];

  const getStatusBadge = (status: string) => {
    // Reusing badge logic (could be refactored to shared component)
    const styles: Record<string, string> = {
      draft: "bg-gray-100 text-gray-700 border-gray-200",
      configuring: "bg-blue-50 text-blue-700 border-blue-200",
      assigning: "bg-indigo-50 text-indigo-700 border-indigo-200",
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      scoring: "bg-amber-50 text-amber-700 border-amber-200",
      validated: "bg-purple-50 text-purple-700 border-purple-200",
      published: "bg-teal-50 text-teal-700 border-teal-200",
      closed: "bg-slate-100 text-slate-700 border-slate-200",
      archived: "bg-slate-100 text-slate-700 border-slate-200",
    };
     const labels: Record<string, string> = {
      draft: "Draft",
      configuring: "Konfigurasi",
      assigning: "Penetapan",
      active: "Aktif",
      scoring: "Scoring",
      validated: "Tervalidasi",
      published: "Terbit",
      closed: "Ditutup",
      archived: "Diarsipkan",
    };
    return (
      <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", styles[status] || styles.draft)}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Link to="/talent/360-assessment-hq" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft size={16} className="mr-1" />
            Kembali ke Daftar Siklus
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold font-sans text-slate-800">{cycle.name}</h1>
                {getStatusBadge(cycle.status)}
              </div>
              <p className="text-muted-foreground text-sm max-w-3xl">
                {cycle.description}
              </p>
              <div className="flex gap-6 mt-4 text-sm text-muted-foreground">
                <div>
                   <span className="font-semibold text-foreground">Periode:</span> {format(new Date(cycle.start_date), "dd MMM yyyy")} - {format(new Date(cycle.end_date), "dd MMM yyyy")}
                </div>
                <div>
                   <span className="font-semibold text-foreground">Jenis:</span> {cycle.assessment_type === "behavioral" ? "Perilaku" : "Kompetensi"}
                </div>
              </div>
            </div>

            {["configuring", "assigning"].includes(cycle.status) && (
              <button 
                onClick={handleActivate}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium text-sm transition-colors shadow-sm flex items-center gap-2"
              >
                <Play size={16} fill="currentColor" />
                Aktifkan Siklus
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex gap-8">
            {tabs.map(tab => (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors relative",
                  tab.isActive 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {children}
        </div>
      </div>
    </AppShell>
  );
}
