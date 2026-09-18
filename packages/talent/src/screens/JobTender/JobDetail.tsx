import { useNavigate, useParams } from "react-router";
import { Bookmark, Building2, CheckCircle2, Clock, Info, MapPin, Share2, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Button, PageHeader, SectionPanel } from "@rinjani/shared-ui";
import { JobTenderPageFrame } from "@/components/job-tender/JobTenderPageFrame";
import { StatusBadge } from "@/components/job-tender/StatusBadge";
import { mockPositions } from "@/data/mockJobTenderData";

export default function JobDetail() {
  const { id: positionId } = useParams();
  const navigate = useNavigate();
  const position = mockPositions.find((p) => p.id === positionId);

  if (!position) {
    return (
      <JobTenderPageFrame maxWidthClassName="max-w-4xl">
        <PageHeader
          variant="workspace"
          title="Posisi tidak ditemukan"
          description="The vacancy is no longer available in this prototype."
          actions={
            <Button variant="outline" onClick={() => navigate("/talent/explore")}>
              Back to Explore
            </Button>
          }
        />
      </JobTenderPageFrame>
    );
  }

  const timeLeft = formatDistanceToNow(new Date(position.deadline), { addSuffix: true, locale: id });

  return (
    <JobTenderPageFrame maxWidthClassName="max-w-4xl">
      <Button variant="ghost" className="w-fit px-0 text-muted-foreground hover:text-primary" onClick={() => navigate("/talent/explore")}>
        ← Back to Explore
      </Button>

      <PageHeader
        variant="workspace"
        eyebrow={position.organizationName}
        title={position.title}
        description={`${position.company} · Deadline ${new Date(position.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`}
        badge={<StatusBadge status={position.status} />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Share vacancy">
              <Share2 className="size-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Save vacancy">
              <Bookmark className="size-4" />
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-foreground">
          <MapPin className="mr-2 size-4 text-muted-foreground" />
          {position.location}
        </span>
        <span className="inline-flex items-center rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-foreground">
          <Info className="mr-2 size-4 text-muted-foreground" />
          Grade {position.gradeJabatan}
        </span>
        <span className="inline-flex items-center rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-foreground">
          <Building2 className="mr-2 size-4 text-muted-foreground" />
          {position.bandJabatan}
        </span>
        <span className="inline-flex items-center rounded-lg border border-warning/20 bg-warning-muted px-3 py-1.5 text-sm font-medium text-warning">
          <Clock className="mr-2 size-4" />
          Berakhir {timeLeft}
        </span>
      </div>

      <SectionPanel title="Job Description">
        <div className="space-y-4 text-sm leading-6 text-muted-foreground">
          <p>{position.description}</p>
          <p>
            This internal vacancy is open to eligible InJourney employees who meet grade, job family, and disciplinary requirements.
          </p>
        </div>
      </SectionPanel>

      <SectionPanel title="Requirements">
        <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
          <li>Minimal Grade Jabatan {position.gradeJabatan - 1} (maksimal Grade {position.gradeJabatan + 2})</li>
          <li>Pengalaman minimal 2 tahun di bidang {position.jobFamilyName}</li>
          <li>Memiliki rating kinerja minimal "Baik" dalam 2 tahun terakhir</li>
          <li>Tidak sedang menjalani hukuman disiplin tingkat sedang atau berat</li>
        </ul>
      </SectionPanel>

      <SectionPanel className="border-success/20 bg-success-muted/70">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="size-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Anda eligible untuk posisi ini</h3>
            <p className="text-sm text-muted-foreground">Profil Anda memenuhi persyaratan dasar untuk melamar posisi ini.</p>
            <div className="grid grid-cols-1 gap-2 text-sm text-foreground md:grid-cols-2">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-success" /> Grade Jabatan Match
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-success" /> Job Family Match
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-success" /> Disciplinary Check Pass
              </span>
            </div>
          </div>
        </div>
      </SectionPanel>

      <div className="flex flex-col gap-3 rounded-[24px] border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center text-sm text-muted-foreground">
          <Users className="mr-2 size-4" />
          <span className="mr-1 font-semibold text-foreground">{position.applicantCount}</span> pelamar saat ini
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 sm:flex-none">
            Save Job
          </Button>
          <Button className="flex-1 sm:flex-none">Apply Now</Button>
        </div>
      </div>
    </JobTenderPageFrame>
  );
}
