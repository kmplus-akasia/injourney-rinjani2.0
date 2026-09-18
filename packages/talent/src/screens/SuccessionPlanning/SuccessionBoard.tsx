import { useState } from "react";
import {
  Filter,
  LayoutGrid,
  List as ListIcon,
  AlertTriangle,
  Clock,
  CircleDot,
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  FilterRail,
  SearchInput,
} from "@rinjani/shared-ui";
import { TCTierBadge } from "./components/Badges";
import { Position } from "./types";
import { cn } from "../../components/ui/utils";

interface SuccessionBoardProps {
  positions: Position[];
  onSelectPosition: (position: Position) => void;
}

type ViewMode = "board" | "list";

const columns = [
  {
    id: "vacant",
    title: "Vacant",
    accent: "border-destructive/20 bg-destructive/5",
    bar: "bg-destructive",
    iconWrap: "bg-destructive text-destructive-foreground",
    icon: AlertTriangle,
  },
  {
    id: "vacant_soon",
    title: "Vacant Soon",
    accent: "border-warning/20 bg-warning-muted",
    bar: "bg-warning",
    iconWrap: "bg-warning text-warning-foreground",
    icon: Clock,
  },
  {
    id: "to_review",
    title: "To Be Reviewed",
    accent: "border-primary/20 bg-primary/5",
    bar: "bg-primary",
    iconWrap: "bg-primary text-primary-foreground",
    icon: CircleDot,
  },
  {
    id: "filled",
    title: "Filled",
    accent: "border-success/20 bg-success-muted",
    bar: "bg-success",
    iconWrap: "bg-success text-success-foreground",
    icon: CheckCircle2,
  },
] as const;

export function SuccessionBoard({ positions, onSelectPosition }: SuccessionBoardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPositions = positions.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.division.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const columnsWithPositions = columns.map((col) => ({
    ...col,
    positions: filteredPositions.filter((p) => p.vacancyStatus === col.id),
  }));

  return (
    <div className="space-y-6">
      <FilterRail>
        <SearchInput
          className="min-w-0 w-full flex-1"
          placeholder="Search positions..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onClear={() => setSearchQuery("")}
        />
        <Button variant="outline" className="gap-2">
          <Filter className="size-4" />
          Filter
        </Button>
        <div className="flex shrink-0 rounded-lg bg-muted p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Board view"
            className={viewMode === "board" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}
            onClick={() => setViewMode("board")}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="List view"
            className={viewMode === "list" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}
            onClick={() => setViewMode("list")}
          >
            <ListIcon className="size-4" />
          </Button>
        </div>
      </FilterRail>

      {viewMode === "board" ? (
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {columnsWithPositions.map((col) => (
            <div key={col.id} className="flex min-w-0 flex-col gap-4">
              <div className={cn("flex items-center justify-between rounded-xl border p-3", col.accent)}>
                <div className="flex items-center gap-2">
                  <div className={cn("rounded-full p-1.5", col.iconWrap)}>
                    <col.icon className="size-3.5" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{col.title}</span>
                </div>
                <Badge variant="neutral">{col.positions.length}</Badge>
              </div>

              <div className="flex flex-col gap-3">
                {col.positions.map((pos) => (
                  <Card
                    key={pos.id}
                    className="group relative cursor-pointer gap-0 overflow-hidden border-border transition-all hover:shadow-md"
                    onClick={() => onSelectPosition(pos)}
                  >
                    <div className={cn("absolute bottom-0 left-0 top-0 w-1", col.bar)} />
                    <CardContent className="p-4 pl-5">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{pos.title}</h3>
                          <p className="mt-0.5 text-xs text-muted-foreground">{pos.division}</p>
                        </div>
                        <button
                          type="button"
                          className="text-muted-foreground/40 opacity-0 transition-opacity hover:text-muted-foreground group-hover:opacity-100"
                          aria-label="Position actions"
                        >
                          <MoreHorizontal className="size-4" />
                        </button>
                      </div>

                      <div className="mb-3 flex flex-wrap gap-1.5">
                        <Badge variant="neutral" className="text-[10px]">
                          {pos.grade}
                        </Badge>
                        {pos.type === "ksp" ? (
                          <Badge variant="info" className="text-[10px]">
                            KSP
                          </Badge>
                        ) : null}
                        <TCTierBadge tier={pos.tcTier} />
                      </div>

                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <div
                          className={cn(
                            "flex items-center gap-1.5 text-xs font-medium",
                            pos.candidateCount < pos.minCandidates ? "text-warning" : "text-muted-foreground",
                          )}
                        >
                          {pos.candidateCount < pos.minCandidates ? <AlertTriangle className="size-3.5" /> : null}
                          {pos.candidateCount}/{pos.minCandidates} candidates
                        </div>
                        {pos.incumbent ? (
                          <div className="text-right text-[10px] text-muted-foreground">
                            Retiring: {new Date(pos.retirementDate!).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                          </div>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/50 p-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-4">Position</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Vacancy Status</div>
            <div className="col-span-2">Candidates</div>
            <div className="col-span-2 text-right">Action</div>
          </div>
          <div>
            {filteredPositions.map((pos) => (
              <div
                key={pos.id}
                onClick={() => onSelectPosition(pos)}
                className="grid cursor-pointer grid-cols-12 items-center gap-4 border-b border-border p-4 last:border-0 hover:bg-muted/40"
              >
                <div className="col-span-4">
                  <h3 className="text-sm font-semibold text-foreground">{pos.title}</h3>
                  <p className="text-xs text-muted-foreground">{pos.division}</p>
                </div>
                <div className="col-span-2 flex flex-wrap gap-1">
                  {pos.type === "ksp" ? (
                    <Badge variant="info" className="text-[10px]">
                      KSP
                    </Badge>
                  ) : null}
                  <Badge variant="neutral" className="text-[10px]">
                    {pos.grade}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <Badge
                    variant={
                      pos.vacancyStatus === "vacant"
                        ? "destructive"
                        : pos.vacancyStatus === "vacant_soon"
                          ? "warning"
                          : pos.vacancyStatus === "to_review"
                            ? "info"
                            : "success"
                    }
                  >
                    {pos.vacancyStatus.replace("_", " ")}
                  </Badge>
                </div>
                <div className="col-span-2 text-sm text-muted-foreground">
                  {pos.candidateCount}/{pos.minCandidates} candidates
                </div>
                <div className="col-span-2 text-right">
                  <Button size="sm" variant="ghost">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
