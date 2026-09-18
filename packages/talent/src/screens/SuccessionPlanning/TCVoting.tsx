import { useState } from "react";
import { 
  ArrowLeft,
  Calendar,
  Check,
  X,
  Minus,
  MessageSquare,
  Users
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Textarea } from "../../components/ui/textarea";
import { Progress } from "../../components/ui/progress";
import { cn } from "../../components/ui/utils";
import { Position, Candidate } from "./types";
import { TopTalentBadge, RiskProfileBadge } from "./components/Badges";

interface TCVotingProps {
  position: Position;
  candidate: Candidate;
  onBack: () => void;
  onSubmit: (vote: "agree" | "disagree" | "abstain", comment: string) => void;
}

export function TCVoting({ position, candidate, onBack, onSubmit }: TCVotingProps) {
  const [vote, setVote] = useState<"agree" | "disagree" | "abstain" | null>(null);
  const [comment, setComment] = useState("");

  const mockVotes = [
    { name: "Direktur Utama", role: "Chair", vote: "agree", date: "2026-01-20" },
    { name: "Direktur HC", role: "Member", vote: "agree", date: "2026-01-20" },
    { name: "Direktur Keuangan", role: "Member", vote: "pending", date: null },
  ];

  return (
    <div className="mx-auto flex min-h-full max-w-4xl flex-col bg-background">
      
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary mb-2" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Board
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Succession Voting</h1>
            <p className="text-slate-500">Talent Committee Tier {position.tcTier === "tier_1" ? "1" : position.tcTier === "tier_2" ? "2" : "3"}</p>
          </div>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">
             Ends in 2 days
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Voting Area */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Proposal Card */}
          <Card className="p-6">
             <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Proposed Successor</h3>
             <div className="flex gap-4">
                <Avatar className="w-20 h-20 rounded-xl border-2 border-slate-100">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${candidate.name}&background=random`} />
                  <AvatarFallback>{candidate.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                    {candidate.name}
                    {candidate.isTopTalent && <TopTalentBadge />}
                  </h2>
                  <p className="text-slate-500 mb-3">{candidate.currentPosition}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                      EQS: {candidate.eqsScore}
                    </Badge>
                    <RiskProfileBadge level={candidate.riskProfile} />
                    <Badge variant="outline" className="bg-slate-50">{candidate.readiness.replace(/_/g, " ")}</Badge>
                  </div>
                </div>
             </div>
          </Card>

          {/* Voting Action */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Cast Your Vote</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => setVote("agree")}
                className={cn(
                  "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                  vote === "agree" 
                    ? "border-green-500 bg-green-50 text-green-700" 
                    : "border-slate-100 hover:border-green-200 hover:bg-green-50/50 text-slate-600"
                )}
              >
                <div className={cn("p-2 rounded-full", vote === "agree" ? "bg-green-200" : "bg-slate-100")}>
                  <Check className="w-6 h-6" />
                </div>
                <span className="font-bold">SETUJU</span>
              </button>

              <button
                onClick={() => setVote("disagree")}
                className={cn(
                  "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                  vote === "disagree" 
                    ? "border-red-500 bg-red-50 text-red-700" 
                    : "border-slate-100 hover:border-red-200 hover:bg-red-50/50 text-slate-600"
                )}
              >
                <div className={cn("p-2 rounded-full", vote === "disagree" ? "bg-red-200" : "bg-slate-100")}>
                  <X className="w-6 h-6" />
                </div>
                <span className="font-bold">TOLAK</span>
              </button>

              <button
                onClick={() => setVote("abstain")}
                className={cn(
                  "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                  vote === "abstain" 
                    ? "border-slate-500 bg-slate-50 text-slate-700" 
                    : "border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-600"
                )}
              >
                <div className={cn("p-2 rounded-full", vote === "abstain" ? "bg-slate-200" : "bg-slate-100")}>
                  <Minus className="w-6 h-6" />
                </div>
                <span className="font-bold">ABSTAIN</span>
              </button>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comments (Optional)
              </label>
              <Textarea 
                placeholder="Add your justification or notes here..." 
                className="min-h-[100px]"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button size="lg" disabled={!vote} onClick={() => vote && onSubmit(vote, comment)}>
                Submit Vote
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-800 mb-4">Quorum Status</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Votes Cast</span>
                  <span className="font-medium">2/3 (66%)</span>
                </div>
                <Progress value={66} className="h-2" />
              </div>
              <div className={cn(
                "text-xs p-2 rounded bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-2"
              )}>
                <Users className="w-3 h-3" />
                Need 75% for quorum
              </div>
            </div>
          </Card>

          <Card className="p-6">
             <h3 className="font-bold text-slate-800 mb-4">Vote History</h3>
             <div className="space-y-4">
               {mockVotes.map((v, i) => (
                 <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0 border-slate-100">
                    <div className={cn(
                      "w-2 h-2 mt-1.5 rounded-full shrink-0",
                      v.vote === "agree" ? "bg-green-500" : v.vote === "pending" ? "bg-slate-300" : "bg-red-500"
                    )} />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{v.name}</p>
                      <p className="text-xs text-slate-500">{v.role}</p>
                      {v.date && <p className="text-[10px] text-slate-400 mt-1">{v.date}</p>}
                    </div>
                 </div>
               ))}
             </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
