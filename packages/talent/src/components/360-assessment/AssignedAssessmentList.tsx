import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { format, isAfter, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { 
  assessmentCycles, 
  assessorAssignments, 
  currentUser,
  employees
} from "../../lib/360-assessment/data";
import { Badge, Button, SectionPanel, StatusBadge } from "@rinjani/shared-ui";
import { CheckCircle2, Play, ChevronRight, X, User, Users, Briefcase, UserCheck } from "lucide-react";
import { cn } from "../../components/ui/utils";

export function AssignedAssessmentList() {
  const navigate = useNavigate();
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);

  // 1. Get my assignments
  const myAssignments = useMemo(() => 
    assessorAssignments.filter(a => a.assessor_id === currentUser.id),
  []);

  // 2. Group by Cycle
  const groupedData = useMemo(() => {
    const groups: Record<string, {
      cycle: typeof assessmentCycles[0],
      assignments: typeof myAssignments,
      total: number,
      completed: number,
      isOverdue: boolean,
      status: string
    }> = {};

    myAssignments.forEach(assignment => {
      const cycle = assessmentCycles.find(c => c.id === assignment.cycle_id);
      if (!cycle) return;

      if (!groups[cycle.id]) {
        const isOverdue = cycle.end_date 
          ? isAfter(new Date(), parseISO(cycle.end_date))
          : false;

        groups[cycle.id] = {
          cycle,
          assignments: [],
          total: 0,
          completed: 0,
          isOverdue,
          status: 'pending' // derived later
        };
      }

      groups[cycle.id].assignments.push(assignment);
      groups[cycle.id].total += 1;
      if (assignment.status === 'completed') {
        groups[cycle.id].completed += 1;
      }
    });

    // Derive aggregated status
    Object.values(groups).forEach(group => {
      if (group.completed === 0) group.status = 'not_started';
      else if (group.completed === group.total) group.status = 'completed';
      else group.status = 'in_progress';
    });

    return Object.values(groups);
  }, [myAssignments]);

  const handleOpenModal = (cycleId: string) => {
    setSelectedCycleId(cycleId);
  };

  const handleCloseModal = () => {
    setSelectedCycleId(null);
  };

  // Logic for the modal content
  const selectedCycleGroup = selectedCycleId ? groupedData.find(g => g.cycle.id === selectedCycleId) : null;
  
  const groupedAssignments = useMemo(() => {
    if (!selectedCycleGroup) return null;

    const grouped = {
      superior: [] as typeof myAssignments,
      peer: [] as typeof myAssignments,
      subordinate: [] as typeof myAssignments,
      self: [] as typeof myAssignments
    };

    selectedCycleGroup.assignments.forEach(a => {
      // Only show assignments that are NOT completed in the "To Do" list? 
      // Or show all with status?
      // User said "target untuk dinilai", usually implies todo. 
      // But showing completed with a checkmark is good UX.
      if (grouped[a.channel as keyof typeof grouped]) {
        grouped[a.channel as keyof typeof grouped].push(a);
      }
    });
    return grouped;
  }, [selectedCycleGroup]);

  if (groupedData.length === 0) {
    return (
      <SectionPanel
        title="Penilaian yang Ditugaskan"
        description="Tidak ada penilaian yang perlu Anda isi saat ini."
      >
        <div className="rounded-[20px] border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Tidak ada penilaian yang perlu Anda isi.</p>
        </div>
      </SectionPanel>
    );
  }

  return (
    <SectionPanel
      title="Penilaian yang Ditugaskan"
      description="Assessment yang menunggu Anda isi untuk periode aktif."
      contentClassName="p-0"
    >
      <div className="overflow-hidden rounded-[20px] border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 font-medium text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Nama Assessment</th>
                <th className="w-[150px] px-4 py-3">Tipe</th>
                <th className="w-[180px] px-4 py-3">Target Dinilai</th>
                <th className="w-[150px] px-4 py-3">Batas Waktu</th>
                <th className="w-[150px] px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {groupedData.map((item) => (
                <tr key={item.cycle.id} className="transition-colors hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{item.cycle.name}</div>
                    {item.cycle.description ? (
                      <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{item.cycle.description}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={item.cycle.assessment_type === "behavioral" ? "info" : "neutral"}>
                      {item.cycle.assessment_type === "behavioral" ? "Perilaku" : "Kompetensi"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {item.completed} / {item.total} Selesai
                        </span>
                        <span className="font-medium">{Math.round((item.completed / item.total) * 100)}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${item.completed === item.total ? "bg-success" : "bg-primary"}`}
                          style={{ width: `${(item.completed / item.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${item.isOverdue ? "font-medium text-destructive" : "text-muted-foreground"}`}>
                        {item.cycle.end_date && format(new Date(item.cycle.end_date), "dd MMM yyyy", { locale: id })}
                      </span>
                      {item.isOverdue ? <StatusBadge status="destructive">TERLAMBAT</StatusBadge> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {item.status === "completed" ? (
                      <Button variant="outline" disabled className="w-full justify-center border-success/20 bg-success/5 text-success">
                        <CheckCircle2 size={14} />
                        Selesai
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => handleOpenModal(item.cycle.id)}
                        disabled={item.isOverdue && item.status !== "in_progress"}
                        className="w-full justify-center"
                        variant={item.isOverdue ? "outline" : "primary"}
                      >
                        <Play size={14} fill="currentColor" />
                        Isi Penilaian
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Target Selection Modal */}
      {selectedCycleId && selectedCycleGroup && groupedAssignments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/40 p-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Pilih Target Penilaian</h2>
                <p className="text-sm text-muted-foreground">{selectedCycleGroup.cycle.name}</p>
              </div>
              <button 
                onClick={handleCloseModal}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid gap-6">
                 {/* Atasan */}
                 {groupedAssignments.superior.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Briefcase size={14} /> Atasan
                      </h3>
                      <div className="grid gap-2">
                        {groupedAssignments.superior.map(assignment => (
                          <AssessmentCard 
                            key={assignment.id} 
                            assignment={assignment} 
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rekan */}
                  {groupedAssignments.peer.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Users size={14} /> Rekan Kerja
                      </h3>
                      <div className="grid gap-2">
                        {groupedAssignments.peer.map(assignment => (
                          <AssessmentCard 
                            key={assignment.id} 
                            assignment={assignment} 
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bawahan */}
                  {groupedAssignments.subordinate.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <User size={14} /> Bawahan
                      </h3>
                      <div className="grid gap-2">
                        {groupedAssignments.subordinate.map(assignment => (
                          <AssessmentCard 
                            key={assignment.id} 
                            assignment={assignment} 
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Diri Sendiri */}
                  {groupedAssignments.self.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <UserCheck size={14} /> Diri Sendiri
                      </h3>
                      <div className="grid gap-2">
                        {groupedAssignments.self.map(assignment => (
                          <AssessmentCard 
                            key={assignment.id} 
                            assignment={assignment} 
                          />
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
            
            <div className="flex shrink-0 justify-end border-t border-border bg-muted/20 p-4">
              <Button
                type="button"
                onClick={handleCloseModal}
                variant="outline"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </SectionPanel>
  );
}

function AssessmentCard({ assignment }: { assignment: any }) {
  const navigate = useNavigate();
  const name = employees.find(e => e.id === assignment.assessee_id)?.name || assignment.assessee_id;
  const position = employees.find(e => e.id === assignment.assessee_id)?.current_position_title || "-";
  const isCompleted = assignment.status === 'completed';

  return (
    <button
      onClick={() => !isCompleted && navigate(`/talent/360-assessment/fill/${assignment.id}`)}
      disabled={isCompleted}
      className={cn(
        "w-full flex items-center justify-between p-4 bg-card border border-border rounded-lg transition-all text-left group",
        isCompleted ? "opacity-75 cursor-default bg-muted/10" : "hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm cursor-pointer"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "size-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
          isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground group-hover:bg-white group-hover:text-primary"
        )}>
          {isCompleted ? <CheckCircle2 size={20} /> : name.charAt(0)}
        </div>
        <div>
          <div className="font-semibold text-foreground">{name}</div>
          <div className="text-xs text-muted-foreground">{position}</div>
        </div>
      </div>
      
      {isCompleted ? (
        <div className="text-sm font-medium text-emerald-600 flex items-center gap-1">
          Selesai
        </div>
      ) : (
        <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-200">
          <span className="text-sm font-medium">Mulai</span>
          <ChevronRight size={16} />
        </div>
      )}
    </button>
  );
}
