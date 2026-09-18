import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Button,
  EmptyState,
  PageHeader,
  StatusBadge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@rinjani/shared-ui";
import { ApplicationCard } from "@/components/job-tender/ApplicationCard";
import { JobTenderNav } from "@/components/job-tender/JobTenderNav";
import { JobTenderPageFrame } from "@/components/job-tender/JobTenderPageFrame";
import { mockApplications } from "@/data/mockJobTenderData";

export default function MyApplications() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const filteredApplications = mockApplications.filter((app) => {
    if (activeTab === "all") return true;
    return app.status === activeTab;
  });

  return (
    <JobTenderPageFrame>
      <PageHeader
        variant="workspace"
        eyebrow="Job Tender Marketplace"
        title="My Applications"
        description="Pantau status aplikasi pekerjaan yang telah Anda ajukan."
        badge={<StatusBadge status="info">{mockApplications.length} aplikasi aktif</StatusBadge>}
      />

      <JobTenderNav />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 h-auto w-full flex-wrap justify-start md:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="screening">Screening</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {filteredApplications.length > 0 ? (
            <div className="grid gap-4">
              {filteredApplications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onViewDetail={(id) => navigate(`/talent/my-applications/${id}`)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Belum ada aplikasi"
              description={
                activeTab === "all"
                  ? "Anda belum mengajukan aplikasi untuk posisi apapun saat ini."
                  : `Tidak ada aplikasi dengan status "${activeTab}".`
              }
              action={
                activeTab === "all" ? (
                  <Button onClick={() => navigate("/talent/explore")}>Explore Jobs</Button>
                ) : undefined
              }
            />
          )}
        </TabsContent>
      </Tabs>
    </JobTenderPageFrame>
  );
}
