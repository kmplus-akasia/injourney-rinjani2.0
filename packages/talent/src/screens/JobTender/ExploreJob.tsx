import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import {
  Button,
  EmptyState,
  FilterRail,
  PageHeader,
  SearchInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rinjani/shared-ui";
import { JobTenderNav } from "@/components/job-tender/JobTenderNav";
import { JobTenderPageFrame } from "@/components/job-tender/JobTenderPageFrame";
import { PositionCard } from "@/components/job-tender/PositionCard";
import { mockPositions, mockSavedJobs } from "@/data/mockJobTenderData";

export default function ExploreJob() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [locationFilter, setLocationFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");

  const filteredPositions = useMemo(() => {
    return mockPositions.filter((pos) => {
      const matchesSearch =
        pos.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pos.organizationName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = locationFilter === "all" || pos.location === locationFilter;
      const matchesGrade = gradeFilter === "all" || pos.gradeJabatan.toString() === gradeFilter;
      return matchesSearch && matchesLocation && matchesGrade;
    });
  }, [searchTerm, locationFilter, gradeFilter]);

  const locations = Array.from(new Set(mockPositions.map((p) => p.location)));
  const grades = Array.from(new Set(mockPositions.map((p) => p.gradeJabatan))).sort((a, b) => a - b);

  const handleSave = (id: string) => {
    console.log("Save position", id);
  };

  const handleOpenPosition = (id: string) => {
    navigate(`/talent/explore/${id}`);
  };

  const isSaved = (id: string) => mockSavedJobs.some((job) => job.positionId === id);

  return (
    <JobTenderPageFrame>
      <PageHeader
        variant="workspace"
        eyebrow="Job Tender Marketplace"
        title="Explore Job"
        description="Temukan kesempatan karir internal yang sesuai dengan kualifikasi Anda."
        badge={
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
            <span className="size-2 rounded-full bg-primary" />
            Periode Q1 2026
          </span>
        }
      />

      <JobTenderNav />

      <FilterRail>
        <SearchInput
          className="min-w-0 w-full flex-1"
          placeholder="Cari posisi, unit kerja, atau kata kunci..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          onClear={() => setSearchTerm("")}
        />
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Lokasi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Lokasi</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={gradeFilter} onValueChange={setGradeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Grade</SelectItem>
            {grades.map((grade) => (
              <SelectItem key={grade} value={grade.toString()}>
                Grade {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" size="icon" aria-label="More filters">
          <SlidersHorizontal className="size-4" />
        </Button>
        <div className="flex shrink-0 rounded-lg bg-muted p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Grid view"
            className={viewMode === "grid" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}
            onClick={() => setViewMode("grid")}
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
            <List className="size-4" />
          </Button>
        </div>
      </FilterRail>

      {filteredPositions.length > 0 ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4"}>
          {filteredPositions.map((position) => (
            <PositionCard
              key={position.id}
              position={position}
              isSaved={isSaved(position.id)}
              onSave={handleSave}
              onApply={handleOpenPosition}
              onViewDetail={handleOpenPosition}
              className={viewMode === "list" ? "h-auto flex-row" : ""}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Tidak ada posisi yang ditemukan"
          description="Coba ubah kata kunci pencarian atau filter Anda untuk menemukan posisi yang sesuai."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setLocationFilter("all");
                setGradeFilter("all");
              }}
            >
              Reset Filter
            </Button>
          }
        />
      )}
    </JobTenderPageFrame>
  );
}
