"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Upload, X, FileText, ImageIcon, Loader2, Send, MessageSquareHeart } from "lucide-react"

interface Props {
  open: boolean
  onClose: () => void
}

const SUPPORT_TYPES = [
  { value: "EDUCATIONAL", label: "📚 Educational Support" },
  { value: "FINANCIAL", label: "💰 Financial Assistance" },
  { value: "WELFARE", label: "🤝 Welfare Initiative" },
  { value: "EMERGENCY", label: "🚨 Emergency Help" },
  { value: "COMPLAINT", label: "📋 Complaint / Grievance" },
  { value: "OTHER", label: "💬 Other" },
]

export function ReachOutDialog({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [attachment, setAttachment] = useState<{ name: string; base64: string; type: string } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    studentId: "",
    supportType: "",
    description: "",
  })

  const handleField = (key: string, val: string) =>
    setForm(f => ({ ...f, [key]: val }))

  const handleFile = (file: File) => {
    const maxMB = 4
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`File too large. Max ${maxMB}MB allowed.`)
      return
    }
    const reader = new FileReader()
    reader.onload = e => {
      setAttachment({ name: file.name, base64: e.target?.result as string, type: file.type })
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.supportType) { toast.error("Please select a support type."); return }
    if (form.description.trim().length < 20) { toast.error("Please describe your issue in at least 20 characters."); return }

    setLoading(true)
    try {
      const res = await fetch("/api/support-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          attachmentUrl: attachment?.base64 || null,
          attachmentName: attachment?.name || null,
        }),
      })

      if (!res.ok) throw new Error("Failed to submit")

      toast.success("Your query has been submitted! Our team will get back to you soon. 💚")
      setForm({ fullName: "", email: "", mobileNumber: "", studentId: "", supportType: "", description: "" })
      setAttachment(null)
      onClose()
    } catch {
      toast.error("Failed to submit. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const isImage = attachment?.type.startsWith("image/")

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Reach Out to VSF</DialogTitle>
              <DialogDescription className="text-sm mt-0.5">
                Fill in your details and describe how we can help. Admin will respond to you.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Personal Details */}
          <div className="p-4 rounded-2xl border border-border/60 bg-muted/30 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Personal Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="reach-name">Full Name <span className="text-destructive">*</span></Label>
                <Input id="reach-name" placeholder="Your full name" value={form.fullName}
                  onChange={e => handleField("fullName", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reach-mobile">Mobile Number <span className="text-destructive">*</span></Label>
                <Input id="reach-mobile" placeholder="10-digit mobile" value={form.mobileNumber}
                  onChange={e => handleField("mobileNumber", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reach-email">Email Address <span className="text-destructive">*</span></Label>
                <Input id="reach-email" type="email" placeholder="your@email.com" value={form.email}
                  onChange={e => handleField("email", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reach-sid">Federation / Student ID <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input id="reach-sid" placeholder="e.g. VSF-2024-001" value={form.studentId}
                  onChange={e => handleField("studentId", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Query Details */}
          <div className="p-4 rounded-2xl border border-border/60 bg-muted/30 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Query Details</p>
            <div className="space-y-1.5">
              <Label>Type of Support <span className="text-destructive">*</span></Label>
              <Select value={form.supportType} onValueChange={v => handleField("supportType", v ?? "")}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select what you need help with…" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reach-desc">Describe Your Requirement <span className="text-destructive">*</span></Label>
              <Textarea
                id="reach-desc"
                placeholder="Please describe your situation, what kind of support you need, and any relevant details…"
                rows={4}
                value={form.description}
                onChange={e => handleField("description", e.target.value)}
                className="bg-background resize-none"
                required
              />
              <p className="text-xs text-muted-foreground text-right">{form.description.length} / min. 20 chars</p>
            </div>
          </div>

          {/* Attachment */}
          <div className="space-y-2">
            <Label>Attachment <span className="text-muted-foreground text-xs">(Photo or PDF, max 4MB — optional)</span></Label>
            {!attachment ? (
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors
                  ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Drop file here or <span className="text-primary underline">browse</span></p>
                <p className="text-xs text-muted-foreground mt-1">Supports: JPG, PNG, PDF</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-muted/30">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                {isImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={attachment.base64} alt="preview" className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.name}</p>
                  <p className="text-xs text-muted-foreground">{attachment.type}</p>
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setAttachment(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Privacy note */}
          <p className="text-xs text-muted-foreground text-center px-4">
            🔒 Your query is private and will only be reviewed by the VSF admin team.
          </p>

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? "Submitting…" : "Submit Query"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
