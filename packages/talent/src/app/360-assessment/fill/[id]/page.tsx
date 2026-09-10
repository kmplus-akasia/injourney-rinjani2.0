import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router";
import { Layout as AppShell } from "../../../../components/shell/Layout";
import {
  assessorAssignments,
  assessmentCycles,
  assessmentInstruments,
  instrumentQuestions,
  employees,
  completeAssignment,
} from "../../../../lib/360-assessment/data";
import { ChevronLeft, CheckCircle2, Save } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { cn } from "../../../../components/ui/utils";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@rinjani/shared-ui";

export default function FillQuestionnairePage() {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, { score: number | null, comment: string }>>({});

  // 1. Load Data
  const assignment = assessorAssignments.find(a => a.id === params.id);
  
  // Hooks must be called unconditionally, but if no assignment, we handle render.
  
  const cycle = useMemo(() => 
    assignment ? assessmentCycles.find(c => c.id === assignment.cycle_id) : null
  , [assignment]);
  
  const instrument = useMemo(() => 
    cycle ? assessmentInstruments.find(i => i.id === cycle.instrument_id) : null
  , [cycle]);
  
  const questions = useMemo(() => 
    instrument ? instrumentQuestions.filter(q => q.instrument_id === instrument.id).sort((a, b) => a.question_order - b.question_order) : []
  , [instrument]);

  const assessee = useMemo(() => 
    assignment ? employees.find(e => e.id === assignment.assessee_id) : null
  , [assignment]);

  // Group questions by competency
  const groupedQuestions = useMemo(() => {
    const groups: Record<string, typeof questions> = {};
    questions.forEach(q => {
      if (!groups[q.competency_name]) groups[q.competency_name] = [];
      groups[q.competency_name].push(q);
    });
    return groups;
  }, [questions]);

  // Initialize answers
  useEffect(() => {
    if (questions.length > 0) {
      const initialAnswers: Record<string, { score: number | null, comment: string }> = {};
      questions.forEach(q => {
        initialAnswers[q.id] = { score: null, comment: "" };
      });
      
      // If mock submission exists (mock logic: pre-fill some if in_progress)
      // In a real app we'd load from DB. Here we just init empty or partial if hardcoded.
      // For SUB-005 (ASG-012), it says 3 answered. I won't implement complex mock answer loading 
      // unless I hardcode them in data.ts. Let's start fresh or assumed saved.
      
      setAnswers(initialAnswers);
    }
  }, [questions]);

  const isReadOnly =
    assignment?.status === "completed" ||
    cycle?.status === "archived" ||
    searchParams.get("readonly") === "true";

  useEffect(() => {
    if (isReadOnly) return undefined;
    const timer = window.setInterval(() => {
      setIsSaving(true);
      window.setTimeout(() => setIsSaving(false), 800);
    }, 30000);
    return () => window.clearInterval(timer);
  }, [answers, isReadOnly]);

  if (!assignment || !cycle || !instrument) {
    return (
      <AppShell>
        <div className="p-8 text-center">Data penugasan tidak ditemukan.</div>
      </AppShell>
    );
  }

  // Derived state
  const totalQuestions = questions.length;
  const answeredCount = Object.values(answers).filter(a => a.score !== null).length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Handlers
  const handleScoreChange = (questionId: string, score: number) => {
    if (isReadOnly) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], score }
    }));
    triggerAutoSave();
  };

  const handleCommentChange = (questionId: string, comment: string) => {
    if (isReadOnly) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], comment }
    }));
  };

  const triggerAutoSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const persistSubmit = () => {
    if (answeredCount < totalQuestions) {
      toast.error("Mohon lengkapi semua pertanyaan sebelum submit.");
      return;
    }
    setIsSubmitting(true);
    if (assignment) completeAssignment(assignment.id);
    window.setTimeout(() => {
      setIsSubmitting(false);
      setConfirmOpen(false);
      toast.success("Penilaian berhasil dikirim!");
      navigate("/talent/360-assessment");
    }, 800);
  };

  const handleSubmit = () => {
    if (answeredCount < totalQuestions) {
      toast.error("Mohon lengkapi semua pertanyaan sebelum submit.");
      return;
    }
    setConfirmOpen(true);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto flex gap-8 items-start relative">
        {/* Main Content */}
        <div className="flex-1 space-y-6 pb-20">
          
          {/* Header */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <Link to="/talent/360-assessment" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
              <ChevronLeft size={16} className="mr-1" />
              Kembali
            </Link>
            
            <div className="flex justify-between items-start">
               <div>
                  <h1 className="text-3xl font-bold font-sans text-slate-800 mb-1">{cycle.name}</h1>
                  <p className="text-muted-foreground">
                    Assessee: <span className="font-semibold text-foreground">{assessee?.name || assignment.assessee_id}</span> • 
                    Posisi: {assessee?.current_position_title || "-"}
                  </p>
               </div>
               {isSaving && (
                 <span className="text-xs text-muted-foreground flex items-center gap-1 animate-pulse">
                   <Save size={12} /> Tersimpan otomatis
                 </span>
               )}
            </div>

            <div className="mt-6">
               <div className="flex justify-between text-sm mb-2">
                 <span className="font-medium text-foreground">Progress Pengisian</span>
                 <span className="text-muted-foreground">{answeredCount} dari {totalQuestions} terjawab ({progressPercent}%)</span>
               </div>
               <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-primary transition-all duration-300"
                   style={{ width: `${progressPercent}%` }}
                 />
               </div>
            </div>
          </div>

          {/* Questionnaire */}
          {Object.entries(groupedQuestions).map(([competency, groupQuestions]) => (
            <div key={competency} className="space-y-4">
              <div className="flex items-center gap-3 py-2 border-b border-border mb-4">
                 <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                   {groupQuestions[0].competency_name.charAt(0)}
                 </div>
                 <h2 className="text-lg font-bold text-foreground">{competency}</h2>
              </div>

              {groupQuestions.map((q, idx) => (
                <div key={q.id} id={`q-${q.id}`} className="bg-card border border-border rounded-lg p-6 shadow-sm scroll-mt-32">
                  <div className="flex gap-4">
                    <span className="text-sm font-medium text-muted-foreground min-w-[24px]">
                      {q.question_order}.
                    </span>
                    <div className="flex-1">
                      <p className="text-foreground font-medium mb-1">{q.question_text}</p>
                      <p className="text-sm text-muted-foreground italic mb-6">Indicator: {q.behavior_indicator}</p>

                      {/* Likert Scale */}
                      <div className="flex items-center justify-between gap-4 mb-6 bg-muted/30 p-4 rounded-lg">
                        <span className="text-xs font-semibold text-muted-foreground w-20 text-right">{instrument.scale_min_label}</span>
                        <div className="flex-1 flex justify-between px-4">
                          {Array.from({ length: instrument.scale_points }).map((_, i) => {
                            const val = i + 1;
                            const isSelected = answers[q.id]?.score === val;
                            return (
                              <label key={val} className="flex flex-col items-center gap-2 cursor-pointer group">
                                <input 
                                  type="radio" 
                                  name={`q-${q.id}`} 
                                  value={val}
                                  checked={isSelected}
                                  onChange={() => handleScoreChange(q.id, val)}
                                  disabled={isReadOnly}
                                  className="sr-only"
                                />
                                <div className={cn(
                                  "size-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                                  isSelected 
                                    ? "border-primary bg-primary text-primary-foreground shadow-md scale-110" 
                                    : "border-muted-foreground/30 text-muted-foreground group-hover:border-primary/50 group-hover:text-primary"
                                )}>
                                  {val}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground w-20">{instrument.scale_max_label}</span>
                      </div>

                      {/* Comment */}
                      <div>
                        <textarea
                          placeholder="Tambahkan komentar (opsional)..."
                          value={answers[q.id]?.comment || ""}
                          onChange={(e) => handleCommentChange(q.id, e.target.value)}
                          disabled={isReadOnly}
                          className="w-full text-sm p-3 rounded-md border border-input bg-transparent focus:ring-1 focus:ring-ring focus:border-ring resize-none h-20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Footer Actions */}
          <div className="fixed bottom-0 left-[64px] right-0 p-4 bg-card border-t border-border z-20 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:left-[250px] transition-all">
             <div className="max-w-4xl w-full mx-auto flex justify-end gap-3">
               <Link 
                 to="/talent/360-assessment"
                 className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
               >
                 Simpan & Keluar
               </Link>
               {isReadOnly ? (
                 <div className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200 flex items-center gap-2">
                   <CheckCircle2 size={16} />
                   Penilaian Selesai
                 </div>
               ) : (
                 <Button
                   type="button"
                   onClick={handleSubmit}
                   disabled={answeredCount < totalQuestions || isSubmitting}
                 >
                   {isSubmitting ? "Mengirim..." : "Submit Penilaian"}
                 </Button>
               )}
             </div>
          </div>
        </div>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kirim penilaian ini?</DialogTitle>
              <DialogDescription>
                Jawaban tidak dapat diubah setelah dikirim. Pastikan seluruh pertanyaan sudah diisi.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
                Lanjut mengisi
              </Button>
              <Button type="button" onClick={persistSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Mengirim..." : "Konfirmasi kirim"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sidebar Nav (Desktop) */}
        <div className="hidden xl:block w-64 sticky top-[80px] self-start max-h-[calc(100vh-100px)] overflow-y-auto pr-2 custom-scrollbar">
           <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
             <h3 className="font-bold text-sm mb-4 text-foreground">Navigasi Soal</h3>
             <div className="space-y-6">
               {Object.entries(groupedQuestions).map(([competency, groupQuestions]) => (
                 <div key={competency}>
                   <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 line-clamp-1" title={competency}>
                     {competency}
                   </div>
                   <div className="grid grid-cols-5 gap-2">
                     {groupQuestions.map(q => {
                       const isAnswered = answers[q.id]?.score !== null;
                       return (
                         <a 
                           key={q.id} 
                           href={`#q-${q.id}`}
                           className={cn(
                             "size-8 rounded flex items-center justify-center text-xs font-medium transition-colors border",
                             isAnswered 
                               ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" 
                               : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
                           )}
                         >
                           {q.question_order}
                         </a>
                       );
                     })}
                   </div>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>
    </AppShell>
  );
}
