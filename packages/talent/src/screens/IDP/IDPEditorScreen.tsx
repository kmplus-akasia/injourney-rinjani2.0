import { useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Plus,
  BookOpen,
  Search,
  PenTool,
  Loader2
} from "lucide-react";
import { toast } from "sonner@2.0.3";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/components/ui/utils";

import { Layout } from "@/components/shell/Layout";
import { 
  mockIDPCycles, 
  mockIDPRecords, 
  mockIDPActivities,
  mockEmployees
} from "@/data/idpData";
import { IDPStatusBadge, IDPStatus } from "@/components/idp/IDPStatusBadge";
import { DraggableActivityCard } from "@/components/idp/DraggableActivityCard";

export function IDPEditorScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gapSource = searchParams.get("source");
  const gapReason = searchParams.get("reason");
  const gapCompetency = searchParams.get("competency");
  const activeCycle = mockIDPCycles.find(c => c.status === 'active');
  const currentEmployee = mockEmployees[0];
  const currentIDPRecord = mockIDPRecords.find(
    r => r.employee_id === currentEmployee.id && r.cycle_id === activeCycle?.id
  ) || {
    ...mockIDPRecords[2], // Fallback to a draft record
    status: 'draft'
  };

  // Initial activities state
  const initialActivities = mockIDPActivities.filter(a => a.idp_record_id === currentIDPRecord.id);
  // If empty (new draft), maybe add some dummy or empty list
  // For demo purposes, we'll use a mix if the record is empty
  const [activities, setActivities] = useState(
    initialActivities.length > 0 ? initialActivities : mockIDPActivities.slice(0, 3)
  );

  const [employeeNotes, setEmployeeNotes] = useState(currentIDPRecord.employee_notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Calculations
  const totalHours = activities.reduce((sum, act) => sum + act.duration_hours, 0);
  const minHours = activeCycle?.min_development_hours || 40;
  const isHoursMet = totalHours >= minHours;
  const activityCount = activities.length;

  // Validation
  const validateIDP = () => {
    const errors = [];
    if (totalHours < minHours) {
      errors.push(`Total jam pengembangan kurang dari minimum (${minHours} jam)`);
    }
    if (activities.length === 0) {
      errors.push("Minimal harus ada 1 aktivitas");
    }
    return errors;
  };

  const validationErrors = validateIDP();
  const isValid = validationErrors.length === 0;

  // Drag and Drop Handler
  const moveActivity = useCallback((dragIndex: number, hoverIndex: number) => {
    setActivities((prevActivities) => {
      const updatedActivities = [...prevActivities];
      const [draggedActivity] = updatedActivities.splice(dragIndex, 1);
      updatedActivities.splice(hoverIndex, 0, draggedActivity);
      return updatedActivities;
    });
  }, []);

  // Handlers
  const handleDeleteActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
    toast.success("Aktivitas dihapus");
  };

  const handleEditActivity = (id: string) => {
    toast.info("Fitur edit aktivitas akan membuka modal detail (Coming Soon)");
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Draft IDP berhasil disimpan", {
        description: `Terakhir disimpan: ${new Date().toLocaleTimeString()}`
      });
    }, 1000);
  };

  const handleSubmit = () => {
    if (!isValid) {
      toast.error("Tidak dapat mensubmit IDP", {
        description: "Mohon perbaiki error validasi sebelum submit."
      });
      return;
    }
    setShowSubmitDialog(true);
  };

  const confirmSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSubmitDialog(false);
      toast.success("IDP Berhasil Disubmit", {
        description: "Menunggu persetujuan dari Manager Anda."
      });
      navigate("/talent/idp/dashboard");
    }, 1500);
  };

  return (
    <Layout>
      <DndProvider backend={HTML5Backend}>
        <div className="min-h-screen bg-muted/30 pb-20">
          
          {/* Header */}
          <div className="bg-background border-b border-border sticky top-0 z-20">
            <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/talent/idp/dashboard">
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                </Button>
                <div>
                  <h1 className="font-sans font-semibold text-lg flex items-center gap-3 text-foreground">
                    Susun IDP {activeCycle?.name}
                    <IDPStatusBadge status={currentIDPRecord.status as IDPStatus} />
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground hidden md:inline-block">
                  Terakhir disimpan: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                <Button 
                  variant="outline" 
                  onClick={handleSaveDraft} 
                  disabled={isSaving || isSubmitting}
                  className="bg-background border-border text-foreground hover:bg-muted"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Simpan Draft
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !isValid}
                  className={!isValid ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground" : "bg-primary hover:bg-primary/90 text-primary-foreground"}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Submit Approval
                </Button>
              </div>
            </div>
          </div>

          {gapSource || gapCompetency ? (
            <div className="max-w-5xl mx-auto px-6 pt-4">
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm" role="status">
                <p className="font-medium text-foreground">System-generated IDP from competency gap</p>
                <p className="text-muted-foreground">
                  Source: {gapSource === "system-generated" ? "System-generated" : gapSource ?? "—"}.
                  Reason tag: {gapReason === "gap-kompetensi" ? "Gap Kompetensi" : gapReason ?? "—"}.
                  {gapCompetency ? ` Focus competency: ${gapCompetency}.` : ""}
                </p>
              </div>
            </div>
          ) : null}

          <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Editor */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Activity List */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h2 className="font-sans font-semibold text-lg text-foreground">
                      Daftar Aktivitas
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {activityCount} aktivitas
                    </span>
                 </div>

                 {activities.length > 0 ? (
                   <div>
                      {activities.map((activity, index) => (
                        <DraggableActivityCard
                          key={activity.id}
                          id={activity.id}
                          index={index}
                          activity={activity}
                          moveActivity={moveActivity}
                          onDelete={handleDeleteActivity}
                          onEdit={handleEditActivity}
                        />
                      ))}
                   </div>
                 ) : (
                   <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/30">
                     <p className="text-muted-foreground">Belum ada aktivitas. Tambahkan aktivitas baru di bawah.</p>
                   </div>
                 )}
              </div>

              {/* Add Activity Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-card hover:bg-muted border-dashed border-2 hover:border-primary hover:text-primary transition-all text-muted-foreground" asChild>
                  <Link to="/talent/idp/recommendations">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Dari Rekomendasi</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-card hover:bg-muted border-dashed border-2 hover:border-primary hover:text-primary transition-all text-muted-foreground" asChild>
                  <Link to="/talent/idp/catalog">
                    <div className="p-2 bg-primary/10 text-primary rounded-full">
                      <Search className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Dari Katalog</span>
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col gap-2 bg-card hover:bg-muted border-dashed border-2 hover:border-primary hover:text-primary transition-all text-muted-foreground"
                  onClick={() => toast.info("Fitur Tambah Custom Activity (Coming Soon)")}
                >
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-full">
                      <PenTool className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Aktivitas Custom</span>
                </Button>
              </div>

              {/* Notes Section */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">Catatan untuk Atasan (Opsional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    placeholder="Tuliskan catatan tambahan mengenai rencana pengembangan Anda..."
                    value={employeeNotes}
                    onChange={(e) => setEmployeeNotes(e.target.value)}
                    className="min-h-[120px] resize-none bg-background border-border text-foreground"
                    maxLength={500}
                  />
                  <div className="text-right text-xs text-muted-foreground mt-2">
                    {employeeNotes.length} / 500 karakter
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Right Column: Sticky Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                
                {/* Summary Card */}
                <Card className={cn("border-t-4 shadow-md bg-card border-border", isHoursMet ? "border-t-emerald-500" : "border-t-amber-500")}>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                        Ringkasan Jam
                      </h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl font-bold font-sans text-foreground">
                          {totalHours}
                          <span className="text-base font-normal text-muted-foreground ml-1">jam</span>
                        </span>
                        <Badge variant={isHoursMet ? "default" : "outline"} className={isHoursMet ? "bg-emerald-600 hover:bg-emerald-700" : "text-amber-600 border-amber-200 bg-amber-50"}>
                           Target: {minHours} jam
                        </Badge>
                      </div>
                      <Progress 
                        value={(totalHours / minHours) * 100} 
                        className="h-2.5 bg-muted" 
                        indicatorClassName={isHoursMet ? "bg-emerald-500" : "bg-amber-500"} 
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        {isHoursMet 
                          ? "Target minimum jam pengembangan terpenuhi." 
                          : `Kurang ${minHours - totalHours} jam lagi untuk memenuhi minimum.`}
                      </p>
                    </div>

                    <div className="border-t border-border pt-4">
                       <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Status Validasi
                       </h3>
                       {isValid ? (
                         <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg text-sm font-medium border border-emerald-100">
                           <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                           <span>Siap untuk disubmit</span>
                         </div>
                       ) : (
                         <div className="space-y-2">
                           <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm border border-amber-100">
                             <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                             <div className="space-y-1">
                               <span className="font-medium">Perlu Perhatian:</span>
                               <ul className="list-disc list-inside text-xs space-y-1 pl-1">
                                 {validationErrors.map((err, idx) => (
                                   <li key={idx}>{err}</li>
                                 ))}
                               </ul>
                             </div>
                           </div>
                         </div>
                       )}
                    </div>
                  </CardContent>
                </Card>

                {/* Help Box */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                  <p className="font-medium mb-1 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Butuh Bantuan?
                  </p>
                  <p className="text-blue-600/80 text-xs">
                    Gunakan menu Rekomendasi untuk menemukan kursus yang sesuai dengan gap kompetensi Anda.
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* Submit Confirmation Dialog */}
          <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Konfirmasi Submit IDP</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Apakah Anda yakin ingin mensubmit IDP ini untuk persetujuan Manager?
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4 space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Aktivitas:</span>
                    <span className="font-medium text-foreground">{activityCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Jam:</span>
                    <span className="font-medium text-foreground">{totalHours} jam</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <Checkbox 
                    id="terms" 
                    checked={agreeToTerms} 
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)} 
                  />
                  <Label htmlFor="terms" className="text-sm font-normal leading-tight cursor-pointer text-muted-foreground">
                    Saya memahami bahwa IDP tidak dapat diubah setelah disubmit, kecuali diminta revisi oleh atasan.
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSubmitDialog(false)} className="border-border text-foreground">Batal</Button>
                <Button 
                  onClick={confirmSubmit} 
                  disabled={!agreeToTerms || isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Submit IDP
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </DndProvider>
    </Layout>
  );
}
