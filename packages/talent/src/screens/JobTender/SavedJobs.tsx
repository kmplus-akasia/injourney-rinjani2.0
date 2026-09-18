import { useState } from "react";
import { useNavigate } from "react-router";
import { Button, EmptyState, FilterRail, PageHeader, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, StatusBadge } from "@rinjani/shared-ui";
import { JobTenderNav } from "@/components/job-tender/JobTenderNav";
import { JobTenderPageFrame } from "@/components/job-tender/JobTenderPageFrame";
import { PositionCard } from "@/components/job-tender/PositionCard";
import { mockPositions, mockSavedJobs } from "@/data/mockJobTenderData";

export default function SavedJobs() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("deadline");

  const savedJobsList = mockSavedJobs
    .map((saved) => {
      const position = mockPositions.find((p) => p.id === saved.positionId);
      return { ...saved, position };
    })
    .filter((item) => item.position);

  const sortedJobs = [...savedJobsList].sort((a, b) => {
    if (sortBy === "deadline") {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
  });

  const handleOpenPosition = (id: string) => {
    navigate(`/talent/explore/${id}`);
  };

  const handleRemove = (id: string) => {
    console.log("Remove saved job", id);
  };

  return (
    <JobTenderPageFrame>
      <PageHeader
        variant="workspace"
        eyebrow="Job Tender Marketplace"
        title="Saved Jobs"
        description="Daftar posisi yang Anda simpan untuk dilamar nanti."
        badge={<StatusBadge status="info">{savedJobsList.length} posisi tersimpan</StatusBadge>}
      />

      <JobTenderNav />

      <FilterRail>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deadline">Batas Waktu (Terdekat)</SelectItem>
            <SelectItem value="savedDate">Tanggal Simpan (Terbaru)</SelectItem>
          </SelectContent>
        </Select>
      </FilterRail>

      {sortedJobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sortedJobs.map((item) => (
            <PositionCard
              key={item.id}
              position={item.position!}
              isSaved
              onSave={() => handleRemove(item.positionId)}
              onApply={handleOpenPosition}
              onViewDetail={handleOpenPosition}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Belum ada posisi tersimpan"
          description="Simpan posisi yang menarik saat Anda menjelajahi lowongan untuk dilamar nanti."
          action={<Button onClick={() => navigate("/talent/explore")}>Explore Jobs</Button>}
        />
      )}
    </JobTenderPageFrame>
  );
}
