import { useState } from "react";
import { 
  FileText, 
  Download, 
  KeyRound, 
  Check, 
  Clock,
  ChevronLeft
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Position } from "./types";
import { cn } from "../../components/ui/utils";

interface BeritaAcaraProps {
  position: Position;
  onBack: () => void;
  onComplete: () => void;
}

export function BeritaAcara({ position, onBack, onComplete }: BeritaAcaraProps) {
  const [step, setStep] = useState<"preview" | "otp" | "signed">("preview");
  const [otp, setOtp] = useState("");

  const handleSign = () => {
    // Simulate API call
    setTimeout(() => {
      setStep("signed");
      setTimeout(onComplete, 2000);
    }, 1500);
  };

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-background">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
           <h1 className="text-2xl font-bold text-slate-800">Digital Signature</h1>
           <p className="text-slate-500">Berita Acara Penetapan Successor - {position.title}</p>
           <Badge variant="outline" className="font-mono bg-slate-100">BA/TC/INJ/2026/001</Badge>
        </div>

        <Card className="overflow-hidden">
          {/* Document Preview Placeholder */}
          <div className="bg-slate-100 p-8 flex flex-col items-center justify-center min-h-[300px] border-b border-slate-200">
             <FileText className="w-16 h-16 text-slate-300 mb-4" />
             <p className="text-sm text-slate-500 font-medium">Document Preview</p>
             <div className="w-48 h-2 bg-slate-200 rounded mt-4" />
             <div className="w-32 h-2 bg-slate-200 rounded mt-2" />
             <Button variant="outline" className="mt-6 gap-2">
               <Download className="w-4 h-4" /> Download PDF
             </Button>
          </div>

          <div className="p-8">
            {step === "preview" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800">Signatories</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Direktur Utama</p>
                        <p className="text-xs text-slate-500">Chair</p>
                      </div>
                      <div className="flex items-center text-green-700 text-sm gap-1">
                        <Check className="w-4 h-4" /> Signed
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm ring-2 ring-primary/10">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">You (Direktur HC)</p>
                        <p className="text-xs text-slate-500">Member</p>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                   <Button variant="ghost" onClick={onBack}>Cancel</Button>
                   <Button onClick={() => setStep("otp")}>Sign Document</Button>
                </div>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-slate-800">Verify Identity</h3>
                  <p className="text-sm text-slate-500">Enter the 6-digit OTP sent to your phone</p>
                </div>

                <div className="max-w-[240px] mx-auto">
                  <Input 
                    className="text-center text-2xl tracking-widest font-mono h-14" 
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <p className="text-xs text-center text-slate-400 mt-2 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" /> Expires in 02:45
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                   <Button variant="ghost" onClick={() => setStep("preview")}>Back</Button>
                   <Button onClick={handleSign} disabled={otp.length < 6}>Verify & Sign</Button>
                </div>
              </div>
            )}

            {step === "signed" && (
              <div className="text-center space-y-6 py-6 animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Successfully Signed!</h3>
                  <p className="text-slate-500">The document has been finalized.</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
