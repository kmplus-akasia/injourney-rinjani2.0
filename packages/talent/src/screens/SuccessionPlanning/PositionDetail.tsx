import { useState } from "react";
import { 
  ArrowLeft,
  ArrowRight,
  Clock,
  Briefcase,
  GraduationCap,
  Calendar
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { TopTalentBadge, RiskProfileBadge } from "./components/Badges";
import { Position, Candidate } from "./types";
import { cn } from "../../components/ui/utils";

interface PositionDetailProps {
  position: Position;
  candidates: Candidate[];
  onBack: () => void;
  onSubmit: (rankings: any) => void;
  onCompare: (candidates: Candidate[]) => void;
}

export function PositionDetail({ position, candidates, onBack, onSubmit, onCompare }: PositionDetailProps) {
  const [activeTab, setActiveTab] = useState("candidates");
  const [selectedRankings, setSelectedRankings] = useState<Record<string, any>>({});

  const handleRankChange = (candidateId: string, rank: string | null) => {
    let newRankings = { ...selectedRankings };
    if (rank !== null) {
      Object.keys(newRankings).forEach(key => {
        if (newRankings[key] === rank) newRankings[key] = null;
      });
    }
    newRankings[candidateId] = rank;
    setSelectedRankings(newRankings);
  };

  const getCandidateByRank = (rank: string) => {
    const id = Object.keys(selectedRankings).find(key => selectedRankings[key] === rank);
    return id ? candidates.find(c => c.id === id) : null;
  };

  const primary = getCandidateByRank("primary");
  const secondary = getCandidateByRank("secondary");
  const tertiary = getCandidateByRank("tertiary");
  const isValid = !!primary && !!secondary && !!tertiary;

  return (
    <div className="flex min-h-full flex-col bg-background">
      <div className="sticky top-0 z-20 flex items-center justify-between rounded-[24px] border border-border bg-card px-4 py-4 shadow-sm sm:px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-muted" aria-label="Back to succession board">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">{position.title}</h1>
              <Badge variant="outline" className={cn(
                "border-0",
                position.vacancyStatus === "vacant" ? "bg-destructive/10 text-destructive" : "bg-warning-muted text-warning"
              )}>
                {position.vacancyStatus === "vacant" ? "Vacant" : "In Progress"}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{position.division} • {position.grade}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-border bg-card px-2 pb-0 pt-2 sm:px-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent border-b border-transparent w-full justify-start h-12 p-0 space-x-6">
                <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-3">Overview</TabsTrigger>
                <TabsTrigger value="candidates" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-3">Candidates</TabsTrigger>
                <TabsTrigger value="matchup" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-3">Match-Up</TabsTrigger>
                <TabsTrigger value="timeline" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-3">Timeline</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 p-2 sm:p-0 sm:pt-6">
            
            {activeTab === "overview" && (
              <div className="space-y-6 max-w-4xl">
                 <Card className="p-6">
                   <h3 className="text-lg font-bold text-slate-800 mb-4">Position Details</h3>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-400 uppercase">Division</label>
                          <p className="text-sm font-medium text-slate-800">{position.division}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-400 uppercase">Grade</label>
                          <p className="text-sm font-medium text-slate-800">{position.grade}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-400 uppercase">Type</label>
                          <p className="text-sm font-medium text-slate-800">{position.type === "ksp" ? "Key Strategic Position (KSP)" : "Struktural"}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                         <div>
                          <label className="text-xs font-semibold text-slate-400 uppercase">Current Incumbent</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <p className="text-sm font-medium text-slate-800">{position.incumbent || "Vacant"}</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-400 uppercase">Retirement Date</label>
                          <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
                             <Clock className="w-4 h-4 text-slate-400" />
                             {position.retirementDate || "-"}
                          </p>
                        </div>
                      </div>
                   </div>
                 </Card>

                 <Card className="p-6">
                   <h3 className="text-lg font-bold text-slate-800 mb-4">Requirements</h3>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                             <Briefcase className="w-4 h-4" />
                           </div>
                           <div>
                             <p className="text-xs text-slate-500">Min Experience</p>
                             <p className="text-sm font-medium text-slate-800">5 Years in Grade</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                             <GraduationCap className="w-4 h-4" />
                           </div>
                           <div>
                             <p className="text-xs text-slate-500">Education</p>
                             <p className="text-sm font-medium text-slate-800">Min. Bachelor Degree</p>
                           </div>
                         </div>
                      </div>
                   </div>
                 </Card>
              </div>
            )}

            {activeTab === "candidates" && (
              <div className="space-y-3">
                {candidates.map((candidate) => (
                  <Card key={candidate.id} className="p-4 border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Ranking Selection */}
                      <div className="flex flex-col gap-1.5 min-w-[100px]">
                        {(["primary", "secondary", "tertiary"] as const).map((rank) => (
                          <button
                            key={rank}
                            onClick={() => handleRankChange(candidate.id, selectedRankings[candidate.id] === rank ? null : rank)}
                            className={cn(
                              "text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm border transition-all text-center",
                              selectedRankings[candidate.id] === rank
                                ? rank === "primary" ? "bg-green-500 text-white border-green-600" 
                                  : rank === "secondary" ? "bg-blue-500 text-white border-blue-600"
                                  : "bg-amber-500 text-white border-amber-600"
                                : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                            )}
                          >
                            {rank}
                          </button>
                        ))}
                      </div>

                      {/* Candidate Info */}
                      <Avatar className="w-12 h-12 border border-slate-100">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${candidate.name}&background=random`} />
                        <AvatarFallback>{candidate.avatar}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-800">{candidate.name}</h3>
                          {candidate.isTopTalent && <TopTalentBadge />}
                          <RiskProfileBadge level={candidate.riskProfile} />
                        </div>
                        <p className="text-sm text-slate-500">{candidate.currentPosition}</p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-8">
                        <div className="w-[100px]">
                           <div className="text-xs text-slate-500 mb-1">EQS Score</div>
                           <span className="text-lg font-bold text-slate-800">{candidate.eqsScore}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => onCompare([candidate])}>
                            Compare
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {activeTab === "timeline" && (
              <div className="max-w-2xl">
                 <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-8">
                    <div className="relative pl-8">
                       <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm" />
                       <h4 className="font-bold text-slate-800">Review Started</h4>
                       <p className="text-sm text-slate-500">Started by System</p>
                       <p className="text-xs text-slate-400 mt-1">Jan 10, 2026</p>
                    </div>
                    <div className="relative pl-8">
                       <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm" />
                       <h4 className="font-bold text-slate-800">Candidates Shortlisted</h4>
                       <p className="text-sm text-slate-500">HCBP Selected 4 candidates</p>
                       <p className="text-xs text-slate-400 mt-1">Jan 12, 2026</p>
                    </div>
                    <div className="relative pl-8">
                       <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 border-4 border-white shadow-sm" />
                       <h4 className="font-bold text-slate-500">TC Review</h4>
                       <p className="text-sm text-slate-400">Pending</p>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === "matchup" && (
               <div className="flex flex-col items-center justify-center h-full py-12">
                  <p className="text-slate-500 mb-4">Select candidates from the "Candidates" tab to compare, or click below to compare all.</p>
                  <Button onClick={() => onCompare(candidates)}>Compare All Candidates</Button>
               </div>
            )}

          </div>
        </div>

        {/* Sidebar Selection Summary */}
        <div className="w-[320px] bg-white border-l border-neutral-200 flex flex-col shadow-sm z-10">
          <div className="p-6 border-b border-neutral-100">
            <h2 className="font-bold text-slate-800">Shortlist Selection</h2>
            <p className="text-sm text-slate-500 mt-1">Select min 3 candidates</p>
          </div>

          <div className="flex-1 p-6 space-y-6">
            <div className="space-y-4">
              {[
                { rank: "primary", label: "Primary Successor", candidate: primary, color: "bg-green-500" },
                { rank: "secondary", label: "Secondary Successor", candidate: secondary, color: "bg-blue-500" },
                { rank: "tertiary", label: "Tertiary Successor", candidate: tertiary, color: "bg-amber-500" }
              ].map((slot) => (
                <div key={slot.rank} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn("w-2 h-2 rounded-full", slot.color)} />
                    <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">{slot.label}</span>
                  </div>
                  
                  {slot.candidate ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${slot.candidate.name}&background=random`} />
                        <AvatarFallback>{slot.candidate.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{slot.candidate.name}</p>
                        <p className="text-xs text-slate-500">EQS: {slot.candidate.eqsScore}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400 italic pl-1">
                      No candidate selected
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-neutral-200 bg-neutral-50">
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onBack}>Cancel</Button>
              <Button className="flex-1" disabled={!isValid} onClick={() => onSubmit(selectedRankings)}>
                Submit to TC
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
