import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  assessmentCycles, 
  assessmentResults, 
  assessorAssignments, 
  currentUser 
} from "../../lib/360-assessment/data";
import { ChevronRight, Filter } from "lucide-react";
import { Link } from "react-router";
import { Badge, Button, FilterRail, SectionPanel } from "@rinjani/shared-ui";

export function HistoryList() {
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Get closed/archived cycles
  const historicalCycles = assessmentCycles.filter(c => ['closed', 'archived'].includes(c.status));

  // Build list items
  let items: any[] = [];

  historicalCycles.forEach(cycle => {
    const cycleYear = new Date(cycle.start_date).getFullYear().toString();

    // 1. As Assessee
    const result = assessmentResults.find(r => r.cycle_id === cycle.id && r.assessee_id === currentUser.id);
    if (result) {
      items.push({
        id: `history-assessee-${cycle.id}`,
        cycle,
        role: "Peserta",
        year: cycleYear,
        score: result.overall_score,
        max_score: result.overall_max_score,
        link: `/talent/360-assessment/report/${result.id}`
      });
    }

    // 2. As Assessor
    const assignment = assessorAssignments.find(a => a.cycle_id === cycle.id && a.assessor_id === currentUser.id);
    if (assignment) {
      items.push({
        id: `history-assessor-${cycle.id}`,
        cycle,
        role: "Penilai",
        year: cycleYear,
        score: null,
        link: `/talent/360-assessment/fill/${assignment.id}?readonly=true`
      });
    }
  });

  // Filter
  const filteredItems = items.filter(item => {
    if (yearFilter !== "all" && item.year !== yearFilter) return false;
    if (roleFilter !== "all" && item.role !== roleFilter) return false;
    return true;
  });

  // Get unique years for filter
  const years = Array.from(new Set(items.map(i => i.year))).sort((a: any, b: any) => b - a);

  if (filteredItems.length === 0) {
    return (
      <SectionPanel
        title="Riwayat Penilaian"
        description="Belum ada riwayat penilaian yang tersedia."
      >
        <div className="rounded-[20px] border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Belum ada riwayat penilaian.</p>
        </div>
      </SectionPanel>
    );
  }

  return (
    <SectionPanel
      title="Riwayat Penilaian"
      description="Assessment yang telah ditutup dan masih relevan untuk ditinjau kembali."
      contentClassName="p-0"
    >
      <div className="space-y-4">
        <FilterRail
          title="Filters"
          description="Gunakan filter untuk membatasi riwayat berdasarkan tahun dan peran."
          actionsClassName="w-full"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Filter size={16} className="pointer-events-none absolute left-2.5 top-2.5 text-muted-foreground" />
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="h-9 appearance-none rounded-md border border-border bg-background py-2 pl-9 pr-8 text-sm focus:border-ring focus:ring-1 focus:ring-ring"
              >
                <option value="all">Semua Tahun</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 appearance-none rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-ring focus:ring-1 focus:ring-ring"
            >
              <option value="all">Semua Peran</option>
              <option value="Peserta">Sebagai Peserta</option>
              <option value="Penilai">Sebagai Penilai</option>
            </select>
          </div>
        </FilterRail>

        <div className="overflow-hidden rounded-[20px] border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Judul Assessment</th>
                  <th className="w-[120px] px-4 py-3">Peran</th>
                  <th className="w-[120px] px-4 py-3">Jenis</th>
                  <th className="w-[150px] px-4 py-3">Periode</th>
                  <th className="w-[100px] px-4 py-3">Nilai</th>
                  <th className="w-[50px] px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{item.cycle.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={item.role === "Peserta" ? "info" : "warning"}>{item.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={item.cycle.assessment_type === "behavioral" ? "info" : "neutral"}>
                        {item.cycle.assessment_type === "behavioral" ? "Perilaku" : "Kompetensi"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(item.cycle.start_date), "MMM yyyy", { locale: id })} -{" "}
                      {format(new Date(item.cycle.end_date), "MMM yyyy", { locale: id })}
                    </td>
                    <td className="px-4 py-3">
                      {item.role === "Peserta" && item.score !== null ? (
                        <span className="font-semibold text-foreground">
                          {item.score.toFixed(2)}{" "}
                          <span className="text-xs font-normal text-muted-foreground">/ {item.max_score}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild variant="ghost" size="icon" className="size-8 rounded-full">
                        <Link to={item.link} aria-label={`Buka detail ${item.cycle.name}`}>
                          <ChevronRight size={16} />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SectionPanel>
  );
}
