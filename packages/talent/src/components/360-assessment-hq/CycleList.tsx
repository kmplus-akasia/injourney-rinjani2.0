import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { 
  Plus, 
  Upload, 
  RefreshCw, 
  Search, 
  MoreHorizontal,
  FileText,
  BarChart,
  Eye,
  Settings,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../ui/utils";
import { assessmentCycles, employees } from "../../lib/360-assessment-hq/data";
import { AssessmentUploadModal } from "./AssessmentUploadModal";
import { ChangeSuperiorModal } from "./ChangeSuperiorModal";

export function CycleList() {
  const [activeTab, setActiveTab] = useState<"active" | "dashboard" | "archive">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isChangeSuperiorModalOpen, setIsChangeSuperiorModalOpen] = useState(false);
  const navigate = useNavigate();


  // Filter cycles based on tab and search
  const filteredCycles = useMemo(() => {
    let filtered = assessmentCycles;

    // Filter by tab status groups
    if (activeTab === "active") {
      filtered = filtered.filter(c => ["draft", "configuring", "assigning", "active"].includes(c.status));
    } else if (activeTab === "dashboard") {
      filtered = filtered.filter(c => ["scoring", "validated", "published"].includes(c.status));
    } else if (activeTab === "archive") {
      filtered = filtered.filter(c => ["closed", "archived"].includes(c.status));
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(query));
    }

    return filtered;
  }, [activeTab, searchQuery]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      active: assessmentCycles.filter(c => ["draft", "configuring", "assigning", "active"].includes(c.status)).length,
      dashboard: assessmentCycles.filter(c => ["scoring", "validated", "published"].includes(c.status)).length,
      archive: assessmentCycles.filter(c => ["closed", "archived"].includes(c.status)).length,
    };
  }, []);

  const getCreatorName = (id: string) => {
    return employees.find(e => e.id === id)?.name || id;
  };

  const getStatusBadge = (status: string) => {
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

  const getTypeBadge = (type: string) => {
    return (
      <span className={cn(
        "px-2 py-0.5 rounded text-xs font-medium border",
        type === "behavioral" ? "bg-purple-50 text-purple-700 border-purple-200" :
        type === "competency" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
        "bg-gray-50 text-gray-700 border-gray-200"
      )}>
        {type === "behavioral" ? "Perilaku" : type === "competency" ? "Kompetensi" : "Custom"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-sans text-slate-800">360 Assessment HQ</h1>
          <p className="text-muted-foreground mt-1">
            Kelola siklus penilaian 360 derajat, instrumen, dan hasil penilaian.
          </p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={() => setIsChangeSuperiorModalOpen(true)}
             className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors"
           >
             <RefreshCw size={16} />
             Ganti Atasan
           </button>
           <button 
             onClick={() => setIsUploadModalOpen(true)}
             className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors"
           >
             <Upload size={16} />
             Unggah Assessment
           </button>
           <Link 
             to="/talent/360-assessment-hq/create"
             className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium text-sm transition-colors shadow-sm"
           >
             <Plus size={16} />
             Buat Assessment
           </Link>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-1">
        <div className="flex gap-6 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("active")}
            className={cn(
              "pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2",
              activeTab === "active" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
            )}
          >
            Aktif
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
              activeTab === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {counts.active}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={cn(
              "pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2",
              activeTab === "dashboard" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
            )}
          >
            Dashboard
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
              activeTab === "dashboard" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {counts.dashboard}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("archive")}
            className={cn(
              "pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2",
              activeTab === "archive" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
            )}
          >
            Arsip
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
              activeTab === "archive" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {counts.archive}
            </span>
          </button>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari siklus penilaian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="px-4 py-3">Judul Assessment</th>
                <th className="px-4 py-3 w-[120px]">Peserta</th>
                <th className="px-4 py-3 w-[120px]">Jenis</th>
                <th className="px-4 py-3 w-[180px]">Pembuat</th>
                <th className="px-4 py-3 w-[140px]">Status</th>
                <th className="px-4 py-3 w-[140px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCycles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    {activeTab === "active" && "Belum ada siklus penilaian aktif. Klik 'Buat Assessment' untuk memulai."}
                    {activeTab === "dashboard" && "Belum ada siklus yang sedang dalam proses review."}
                    {activeTab === "archive" && "Belum ada siklus yang diarsipkan."}
                    {searchQuery && " Tidak ada hasil yang cocok dengan pencarian Anda."}
                  </td>
                </tr>
              ) : (
                filteredCycles.map((cycle) => (
                  <tr key={cycle.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-4 py-3">
                      <Link to={`/talent/360-assessment-hq/${cycle.id}`} className="font-medium text-foreground hover:text-primary transition-colors block">
                        {cycle.name}
                      </Link>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(cycle.updated_at), "dd MMM yyyy")}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-foreground">
                        <Users size={14} className="text-muted-foreground" />
                        {cycle.total_assessee} orang
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getTypeBadge(cycle.assessment_type)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-foreground">{getCreatorName(cycle.created_by)}</div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(cycle.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        {["draft"].includes(cycle.status) && (
                          <Link 
                            to={`/talent/360-assessment-hq/${cycle.id}/edit`}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                            title="Edit"
                          >
                            <Settings size={16} />
                          </Link>
                        )}
                         {["active", "configuring", "assigning"].includes(cycle.status) && (
                          <Link 
                            to={`/talent/360-assessment-hq/${cycle.id}/monitoring`}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                            title="Monitor"
                          >
                            <BarChart size={16} />
                          </Link>
                        )}
                        {["scoring", "validated", "published", "closed"].includes(cycle.status) && (
                          <Link 
                            to={`/talent/360-assessment-hq/${cycle.id}/results`}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                            title="Lihat Hasil"
                          >
                            <FileText size={16} />
                          </Link>
                        )}
                         <Link 
                            to={`/talent/360-assessment-hq/${cycle.id}`}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                            title="Detail"
                          >
                            <Eye size={16} />
                          </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground flex justify-between items-center">
          <span>Menampilkan {filteredCycles.length} dari {filteredCycles.length} siklus</span>
          <div className="flex gap-2">
            <button disabled className="px-2 py-1 rounded border border-border bg-background opacity-50 cursor-not-allowed">Previous</button>
            <button disabled className="px-2 py-1 rounded border border-border bg-background opacity-50 cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>
      {/* Modals */}
      <AssessmentUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
      <ChangeSuperiorModal 
        isOpen={isChangeSuperiorModalOpen} 
        onClose={() => setIsChangeSuperiorModalOpen(false)} 
      />
    </div>
  );
}
