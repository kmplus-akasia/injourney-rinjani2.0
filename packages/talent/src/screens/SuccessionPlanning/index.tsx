import { useState } from "react";
import { User } from "lucide-react";
import { Button, PageHeader } from "@rinjani/shared-ui";
import { Layout } from "../../components/shell/Layout";
import { SuccessionBoard } from "./SuccessionBoard";
import { PositionDetail } from "./PositionDetail";
import { ProfileMatchUp } from "./ProfileMatchUp";
import { TCVoting } from "./TCVoting";
import { BeritaAcara } from "./BeritaAcara";
import { EmployeeSuccessionView } from "./EmployeeSuccessionView";
import { mockPositions, mockCandidates } from "./mockData";
import { Position, Candidate } from "./types";

export function SuccessionPlanning() {
  const [currentView, setCurrentView] = useState<"board" | "detail" | "voting" | "berita_acara" | "employee">("board");
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [showMatchUp, setShowMatchUp] = useState(false);
  const [compareCandidates, setCompareCandidates] = useState<Candidate[]>([]);

  const handleSelectPosition = (position: Position) => {
    setSelectedPosition(position);
    setCurrentView("detail");
  };

  const handleBackToBoard = () => {
    setCurrentView("board");
    setSelectedPosition(null);
  };

  const handleSubmitShortlist = (rankings: unknown) => {
    console.log("Submitting rankings", rankings);
    setCurrentView("voting");
  };

  const handleCompare = (candidates: Candidate[]) => {
    setCompareCandidates(candidates.length > 0 ? candidates : mockCandidates);
    setShowMatchUp(true);
  };

  const handleVoteSubmit = (vote: string, comment: string) => {
    console.log("Vote submitted", vote, comment);
    setCurrentView("berita_acara");
  };

  const isEmployeeView = currentView === "employee";
  const showWorkspaceHeader = currentView === "board" || currentView === "employee";

  return (
    <Layout>
      <div className="mx-auto max-w-[var(--layout-max-width-workspace)] space-y-6 px-4 pb-10 pt-8 md:px-6 lg:px-8">
        {showWorkspaceHeader ? (
          <PageHeader
            variant="workspace"
            eyebrow="Talent Management"
            title={isEmployeeView ? "My Succession Status" : "Succession Planning"}
            description={
              isEmployeeView
                ? "Positions where you have been selected as a potential successor."
                : "Manage succession plans for critical positions."
            }
            actions={
              <Button
                variant="outline"
                onClick={() => setCurrentView(isEmployeeView ? "board" : "employee")}
              >
                <User className="size-4" />
                {isEmployeeView ? "Admin view" : "Employee view"}
              </Button>
            }
          />
        ) : null}

        {currentView === "board" ? (
          <SuccessionBoard positions={mockPositions} onSelectPosition={handleSelectPosition} />
        ) : null}

        {currentView === "detail" && selectedPosition ? (
          <PositionDetail
            position={selectedPosition}
            candidates={mockCandidates}
            onBack={handleBackToBoard}
            onSubmit={handleSubmitShortlist}
            onCompare={handleCompare}
          />
        ) : null}

        {currentView === "voting" && selectedPosition ? (
          <TCVoting
            position={selectedPosition}
            candidate={mockCandidates[0]}
            onBack={() => setCurrentView("detail")}
            onSubmit={handleVoteSubmit}
          />
        ) : null}

        {currentView === "berita_acara" && selectedPosition ? (
          <BeritaAcara
            position={selectedPosition}
            onBack={() => setCurrentView("voting")}
            onComplete={handleBackToBoard}
          />
        ) : null}

        {currentView === "employee" ? <EmployeeSuccessionView /> : null}

        {showMatchUp && selectedPosition ? (
          <ProfileMatchUp
            candidates={compareCandidates}
            position={selectedPosition}
            onClose={() => setShowMatchUp(false)}
          />
        ) : null}
      </div>
    </Layout>
  );
}
