"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Search, Eye, FileText, ImageIcon, CheckCircle2, Clock, RefreshCw } from "lucide-react"

const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })

const fmtDateTime = (d: string | Date) =>
  new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })

const TYPE_LABELS: Record<string, string> = {
  EDUCATIONAL: "📚 Educational",
  FINANCIAL: "💰 Financial",
  WELFARE: "🤝 Welfare",
  EMERGENCY: "🚨 Emergency",
  COMPLAINT: "📋 Complaint",
  OTHER: "💬 Other",
}

const STATUS_CONFIG: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
  PENDING:  { label: "Pending",  class: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",  icon: <Clock className="w-3 h-3" /> },
  REVIEWED: { label: "Reviewed", class: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",       icon: <Eye className="w-3 h-3" /> },
  RESOLVED: { label: "Resolved", class: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400", icon: <CheckCircle2 className="w-3 h-3" /> },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function QueriesClient({ requests }: { requests: any[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [filterType, setFilterType] = useState("ALL")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selected, setSelected] = useState<any | null>(null)
  const [adminNote, setAdminNote] = useState("")
  const [updating, setUpdating] = useState(false)

  const filtered = requests.filter(r => {
    if (filterStatus !== "ALL" && r.status !== filterStatus) return false
    if (filterType !== "ALL" && r.supportType !== filterType) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      r.fullName?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.mobileNumber?.includes(q) ||
      r.studentId?.toLowerCase().includes(q)
    )
  })

  const pendingCount = requests.filter(r => r.status === "PENDING").length

  const openDetail = (r: typeof requests[0]) => {
    setSelected(r)
    setAdminNote(r.adminNote || "")
  }

  const updateStatus = async (status: string) => {
    if (!selected) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/support-requests/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Marked as ${status.toLowerCase()}`)
      setSelected(null)
      router.refresh()
    } catch {
      toast.error("Failed to update")
    } finally {
      setUpdating(false)
    }
  }

  const isImage = (url: string) => url?.startsWith("data:image")

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Queries", value: requests.length, color: "text-foreground" },
          { label: "Pending", value: pendingCount, color: "text-amber-600" },
          { label: "Resolved", value: requests.filter(r => r.status === "RESOLVED").length, color: "text-emerald-600" },
        ].map(c => (
          <div key={c.label} className="rounded-2xl border bg-card p-4 text-center shadow-sm">
            <div className={`text-3xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, mobile…" className="pl-8 bg-background"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? "ALL")}>
          <SelectTrigger className="w-[150px] bg-background"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REVIEWED">Reviewed</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={(v) => setFilterType(v ?? "ALL")}>
          <SelectTrigger className="w-[170px] bg-background"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            {Object.entries(TYPE_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No queries found.
                </TableCell>
              </TableRow>
            ) : filtered.map(r => {
              const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.PENDING
              return (
                <TableRow key={r.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => openDetail(r)}>
                  <TableCell>
                    <div className="font-medium">{r.fullName}</div>
                    {r.studentId && <div className="text-xs text-muted-foreground font-mono">{r.studentId}</div>}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{r.mobileNumber}</div>
                    <div className="text-xs text-muted-foreground">{r.email}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{TYPE_LABELS[r.supportType] || r.supportType}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {fmtDate(r.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`gap-1 text-xs ${sc.class}`}>
                      {sc.icon} {sc.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" className="gap-1.5 h-8">
                      <Eye className="w-3.5 h-3.5" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      {selected && (
        <Dialog open={!!selected} onOpenChange={v => !v && setSelected(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span>{TYPE_LABELS[selected.supportType] || selected.supportType}</span>
                <Badge variant="outline" className={`gap-1 text-xs ${STATUS_CONFIG[selected.status]?.class}`}>
                  {STATUS_CONFIG[selected.status]?.icon} {STATUS_CONFIG[selected.status]?.label}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 mt-2">
              {/* Student Info */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-muted/30 border border-border/60">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Name</p>
                  <p className="font-semibold">{selected.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mobile</p>
                  <p className="font-semibold">{selected.mobileNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm break-all">{selected.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Student / Federation ID</p>
                  <p className="text-sm font-mono">{selected.studentId || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Submitted On</p>
                  <p className="text-sm">{fmtDateTime(selected.createdAt)}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</p>
                <div className="p-4 rounded-2xl bg-card border border-border/60 text-sm leading-relaxed whitespace-pre-wrap">
                  {selected.description}
                </div>
              </div>

              {/* Attachment */}
              {selected.attachmentUrl && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Attachment</p>
                  {isImage(selected.attachmentUrl) ? (
                    <div className="rounded-2xl overflow-hidden border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selected.attachmentUrl} alt="attachment" className="w-full max-h-80 object-contain bg-muted" />
                    </div>
                  ) : (
                    <a
                      href={selected.attachmentUrl}
                      download={selected.attachmentName || "attachment.pdf"}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-muted/30 hover:bg-muted transition-colors"
                    >
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{selected.attachmentName || "attachment.pdf"}</p>
                        <p className="text-xs text-muted-foreground">Click to download PDF</p>
                      </div>
                    </a>
                  )}
                </div>
              )}

              {/* Admin Note */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Admin Note (internal)</p>
                <Textarea
                  placeholder="Add a note about this query…"
                  rows={3}
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  className="bg-background resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-1">
                <Button variant="outline" onClick={() => setSelected(null)} className="flex-1">
                  Close
                </Button>
                {selected.status !== "REVIEWED" && (
                  <Button variant="outline" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/20 flex-1"
                    onClick={() => updateStatus("REVIEWED")} disabled={updating}>
                    <Eye className="w-4 h-4" /> Mark Reviewed
                  </Button>
                )}
                {selected.status !== "RESOLVED" && (
                  <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 flex-1"
                    onClick={() => updateStatus("RESOLVED")} disabled={updating}>
                    {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Mark Resolved
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
