import { Link } from "react-router";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { assessmentCycles, assessmentResults, currentUser } from "../../lib/360-assessment/data";
import { ChevronRight } from "lucide-react";
import { Badge, Button, SectionPanel, StatusBadge } from "@rinjani/shared-ui";

export function MyAssessmentList() {
  // Filter results for current user
  const myResults = assessmentResults.filter(r => r.assessee_id === currentUser.id);

  // Join with cycle data
  const data = myResults.map(result => {
    const cycle = assessmentCycles.find(c => c.id === result.cycle_id);
    return {
      ...result,
      cycle,
    };
  }).filter(item => item.cycle); // Ensure cycle exists

  if (data.length === 0) {
    return (
      <SectionPanel
        title="Penilaian Saya"
        description="Belum ada assessment 360 untuk Anda saat ini."
      >
        <div className="rounded-[20px] border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Belum ada penilaian 360 untuk Anda saat ini.</p>
        </div>
      </SectionPanel>
    );
  }

  return (
    <SectionPanel
      title="Penilaian Saya"
      description="Riwayat assessment 360 yang Anda jalani sebagai peserta."
      contentClassName="p-0"
    >
      <div className="overflow-hidden rounded-[20px] border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 font-medium text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Judul Assessment</th>
                <th className="w-[120px] px-4 py-3">Jenis</th>
                <th className="w-[120px] px-4 py-3">Status</th>
                <th className="w-[150px] px-4 py-3">Periode</th>
                <th className="w-[100px] px-4 py-3">Nilai</th>
                <th className="w-[50px] px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((item) => (
                <tr key={item.id} className="group transition-colors hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{item.cycle?.name}</div>
                    <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {item.cycle?.description || "Tidak ada deskripsi"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={item.cycle?.assessment_type === "behavioral" ? "info" : "neutral"}>
                      {item.cycle?.assessment_type === "behavioral" ? "Perilaku" : "Kompetensi"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.cycle?.status as any} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.cycle?.start_date && format(new Date(item.cycle.start_date), "dd MMM yyyy", { locale: id })}
                    <span className="mx-1">-</span>
                    {item.cycle?.end_date && format(new Date(item.cycle.end_date), "dd MMM yyyy", { locale: id })}
                  </td>
                  <td className="px-4 py-3">
                    {item.status === "published" ? (
                      <span className="font-semibold text-foreground">
                        {item.overall_score.toFixed(2)}{" "}
                        <span className="text-xs font-normal text-muted-foreground">/ {item.overall_max_score}</span>
                      </span>
                    ) : (
                      <span className="text-xs italic text-muted-foreground">Menunggu Hasil</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.status === "published" && (
                      <Button asChild variant="ghost" size="icon" className="size-8 rounded-full">
                        <Link to={`/talent/360-assessment/report/${item.id}`} aria-label={`Lihat laporan ${item.cycle?.name}`}>
                          <ChevronRight size={16} />
                        </Link>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionPanel>
  );
}
