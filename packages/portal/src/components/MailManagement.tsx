import React, { useState } from "react";
import { Mail, Plus, Edit2, Trash2, Send, Eye, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { EmailTemplateEditor } from "./EmailTemplateEditor";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { toast } from "sonner";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  logo: string;
  header: string;
  body: string;
  footer: string;
  createdAt: string;
  updatedAt: string;
}

interface MailManagementProps {
  onBack?: () => void;
}

export function MailManagement({ onBack }: MailManagementProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: "1",
      name: "Welcome Email",
      subject: "Selamat Datang di Perusahaan Kami",
      logo: "",
      header: "Congratulations, you are invited to [stages] stages 🎉!",
      body: "Dear [candidate_name],\n\nCongratulations on advancing to the interview stage! We have scheduled your interview for the [job_position] role in [company] with our team. Please find the details below:\n\nInterview Date: [interview_date_and_start_time]\nLocation/Link: [interview_location_or_link]\nInterviewer(s): [interviewer_name], [interviewer_position]\n\nPlease confirm your availability by contacting the contact below. For further information, we will contact you personally and you can track the progress of the job status through the profile page on the website.\n\nBest regards,\n[company] Recruitment Team\n[contact_person_email]",
      footer: "PT Aviani Pariwisata Indonesia\n(Present)\n\nGedung Samali Lantai 14 & 16, Jl. TB Simatupang No. 11,\nKota Jakarta Pusat, 10560",
      createdAt: "2026-01-20",
      updatedAt: "2026-01-20",
    },
    {
      id: "jt-result",
      name: "Result Notice",
      subject: "Application result for [job_position]",
      logo: "",
      header: "Your Job Tender application result",
      body: "Dear [candidate_name],\n\nYour application for [job_position] at [company] is now [result_status].\n\nReason: [result_reason]\n\nYou can track this outcome from Job Tender Marketplace.\n\nBest regards,\n[company] Recruitment Team",
      footer: "PT Aviani Pariwisata Indonesia\n(Present)\n\nGedung Samali Lantai 14 & 16, Jl. TB Simatupang No. 11,\nKota Jakarta Pusat, 10560",
      createdAt: "2026-09-18",
      updatedAt: "2026-09-18",
    },
    {
      id: "jt-reminder",
      name: "Saved Job Reminder",
      subject: "[horizon] reminder: [job_position] deadline",
      logo: "",
      header: "Saved Job deadline reminder",
      body: "Dear [candidate_name],\n\nThis is an [horizon] reminder. The application deadline for [job_position] at [company] is [deadline].\n\nOpen Saved Jobs to apply before the vacancy closes.\n\nBest regards,\n[company] Recruitment Team",
      footer: "PT Aviani Pariwisata Indonesia\n(Present)\n\nGedung Samali Lantai 14 & 16, Jl. TB Simatupang No. 11,\nKota Jakarta Pusat, 10560",
      createdAt: "2026-09-18",
      updatedAt: "2026-09-18",
    },
    {
      id: "2",
      name: "Offboarding Notice",
      subject: "Terima Kasih Atas Dedikasi Anda",
      logo: "",
      header: "Terima Kasih Atas Kontribusi Anda",
      body: "Kepada [nama],\n\nKami ingin mengucapkan terima kasih atas kontribusi dan dedikasi Anda selama bekerja dengan kami di posisi [posisi].\n\nProses offboarding Anda akan dimulai pada [tanggal]. Tim HR akan menghubungi Anda untuk mengatur detail lebih lanjut mengenai:\n\n- Serah terima pekerjaan\n- Pengembalian aset perusahaan\n- Penyelesaian administrasi\n- Exit interview\n\nKami berharap yang terbaik untuk karir Anda selanjutnya.\n\nSalam hormat,\nTim HR",
      footer: "Informasi lebih lanjut dapat menghubungi:\nEmail: hr@perusahaan.com\nTelp: (021) 1234567",
      createdAt: "2026-01-18",
      updatedAt: "2026-01-18",
    },
  ]);

  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sendingTemplate, setSendingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");

  const handleCreateNew = () => {
    setEditingTemplate(undefined);
    setShowEditor(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handlePreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
  };

  const handleSave = (template: EmailTemplate) => {
    if (template.id) {
      // Update existing template
      setTemplates(
        templates.map((t) =>
          t.id === template.id
            ? { ...template, updatedAt: new Date().toISOString().split("T")[0] }
            : t
        )
      );
    } else {
      // Create new template
      const newTemplate: EmailTemplate = {
        ...template,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setTemplates([newTemplate, ...templates]);
    }
    setShowEditor(false);
    setEditingTemplate(undefined);
  };

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (templateToDelete) {
      setTemplates(templates.filter((t) => t.id !== templateToDelete));
      setTemplateToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleSendEmail = (template: EmailTemplate) => {
    setSendingTemplate(template);
    setShowSendDialog(true);
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If editor is open, show only the editor
  if (showEditor) {
    return (
      <EmailTemplateEditor
        template={editingTemplate}
        onSave={handleSave}
        onCancel={() => {
          setShowEditor(false);
          setEditingTemplate(undefined);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-foreground" style={{ fontSize: "var(--text-3xl)" }}>
              Mail Management
            </h1>
            <p className="text-muted-foreground mt-1" style={{ fontSize: "var(--text-base)" }}>
              Kelola template email dan kirim email ke karyawan
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Buat Template Baru
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <Input
              type="search"
              placeholder="Cari template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-muted-foreground" style={{ fontSize: "var(--text-sm)" }}>
            {filteredTemplates.length} template
          </div>
        </div>

        {/* Templates Table */}
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Template</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead>Diperbarui</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? "Tidak ada template yang ditemukan" : "Belum ada template"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.subject}</TableCell>
                    <TableCell>{template.createdAt}</TableCell>
                    <TableCell>{template.updatedAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(template)}
                          title="Preview Template"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendEmail(template)}
                          title="Kirim Email"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(template)}
                          title="Edit Template"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(template.id)}
                          className="text-destructive-foreground hover:text-destructive-foreground"
                          title="Hapus Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground" style={{ fontSize: "var(--text-sm)" }}>
                  Total Templates
                </p>
                <p className="font-semibold" style={{ fontSize: "var(--text-xl)" }}>
                  {templates.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Send className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-muted-foreground" style={{ fontSize: "var(--text-sm)" }}>
                  Email Terkirim (Bulan Ini)
                </p>
                <p className="font-semibold" style={{ fontSize: "var(--text-xl)" }}>
                  47
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-chart-2/10 rounded-lg">
                <Eye className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-muted-foreground" style={{ fontSize: "var(--text-sm)" }}>
                  Open Rate
                </p>
                <p className="font-semibold" style={{ fontSize: "var(--text-xl)" }}>
                  87%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Template</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus template ini? Aksi ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>Hapus</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Send Email Dialog (Placeholder) */}
        {showSendDialog && sendingTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="font-semibold mb-4" style={{ fontSize: "var(--text-xl)" }}>
                Kirim Email
              </h3>
              <p className="text-muted-foreground mb-4" style={{ fontSize: "var(--text-base)" }}>
                Template: <span className="font-medium text-foreground">{sendingTemplate.name}</span>
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Penerima</label>
                  <Input
                    placeholder="Email penerima atau pilih dari daftar karyawan"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      if (recipientEmail) {
                        // Simulate sending email
                        toast.success(`Email berhasil dikirim ke ${recipientEmail}`);
                        setShowSendDialog(false);
                        setRecipientEmail("");
                      } else {
                        toast.error("Mohon masukkan email penerima");
                      }
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Kirim Email
                  </Button>
                  <Button variant="outline" onClick={() => setShowSendDialog(false)}>
                    Batal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Slide-in Panel */}
        {previewTemplate && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setPreviewTemplate(null)}
            />
            
            {/* Slide-in Panel from Right */}
            <div className="fixed top-0 right-0 h-full w-full max-w-3xl bg-background border-l border-border shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
              {/* Header */}
              <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="font-semibold text-foreground" style={{ fontSize: "var(--text-2xl)" }}>
                    Preview Email Template
                  </h2>
                  <p className="text-muted-foreground mt-1" style={{ fontSize: "var(--text-sm)" }}>
                    {previewTemplate.name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewTemplate(null)}
                  className="shrink-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Preview Content */}
              <div className="p-8 bg-muted/20">
                <div className="max-w-[700px] mx-auto">
                  {/* Subject Line */}
                  <div className="mb-6 p-4 bg-card border border-border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Subject:</p>
                    <p className="font-medium text-foreground">{previewTemplate.subject}</p>
                  </div>

                  {/* Email Container - Clean Professional Style */}
                  <div className="bg-background shadow-lg border border-border overflow-hidden flex flex-col" style={{ minHeight: "800px" }}>
                    {/* Email Body - Clean Style */}
                    <div className="bg-background flex-1">
                      <div className="px-12 py-10">
                        {/* Logo Section - Centered at Top */}
                        {previewTemplate.logo && (
                          <div className="flex justify-center mb-8">
                            <img src={previewTemplate.logo} alt="Logo" className="h-16 object-contain" />
                          </div>
                        )}

                        {/* Header/Title Section */}
                        {previewTemplate.header && (
                          <div className="mb-6">
                            <h1
                              className="font-semibold text-foreground"
                              style={{ fontSize: "var(--text-2xl)", lineHeight: "1.3" }}
                            >
                              {previewTemplate.header}
                            </h1>
                          </div>
                        )}

                        {/* Body Section */}
                        <div className="mb-8">
                          <div
                            className="whitespace-pre-wrap text-foreground"
                            style={{
                              fontSize: "var(--text-base)",
                              lineHeight: "1.7"
                            }}
                          >
                            {previewTemplate.body}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Section - Stick to Bottom with Different Background */}
                    {previewTemplate.footer && (
                      <div className="bg-muted/50 border-t border-border px-12 py-8 mt-auto">
                        <div className="flex items-start justify-between gap-8">
                          {/* Footer Text */}
                          <div className="flex-1">
                            <div
                              className="whitespace-pre-wrap text-foreground"
                              style={{ fontSize: "var(--text-sm)", lineHeight: "1.6" }}
                            >
                              {previewTemplate.footer}
                            </div>
                          </div>

                          {/* Logo Only */}
                          {previewTemplate.logo && (
                            <div className="flex flex-col items-end">
                              <img src={previewTemplate.logo} alt="Logo" className="h-10 object-contain opacity-80" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}