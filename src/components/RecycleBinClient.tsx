"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import {
  Trash2, RotateCcw, Clock, HeartHandshake,
  Receipt, Bell, AlertTriangle, RefreshCw, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// ─── Types ────────────────────────────────────────────────────────────────────
interface DeletedDonation {
  id: string
  amount: number
  status: string
  paymentMethod: string | null
  notes: string | null
  deletedAt: string
  student: { fullName: string; federationId: string }
  verifiedBy: { name: string } | null
}

interface DeletedExpense {
  id: string
  title: string
  amount: number
  category: string
  description: string | null
  status: string
  deletedAt: string
}

interface DeletedAnnouncement {
  id: string
  title: string
  content: string
  deletedAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysLeft(deletedAt: string) {
  const deleted = new Date(deletedAt)
  const expiry = new Date(deleted)
  expiry.setMonth(expiry.getMonth() + 3)
  const diff = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr)
  const now = Date.now()
  const diff = Math.floor((now - date.getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`
  return date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" })
}

// ─── ExpiryBadge ──────────────────────────────────────────────────────────────
function ExpiryBadge({ deletedAt }: { deletedAt: string }) {
  const days = daysLeft(deletedAt)
  if (days <= 7) return <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[10px]"><AlertTriangle className="w-2.5 h-2.5 mr-1" />{days}d left</Badge>
  if (days <= 30) return <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px]"><Clock className="w-2.5 h-2.5 mr-1" />{days}d left</Badge>
  return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]"><Clock className="w-2.5 h-2.5 mr-1" />{days}d left</Badge>
}

// ─── RecycleBinClient ─────────────────────────────────────────────────────────
export default function RecycleBinClient() {
  const [donations, setDonations] = useState<DeletedDonation[]>([])
  const [expenses, setExpenses] = useState<DeletedExpense[]>([])
  const [announcements, setAnnouncements] = useState<DeletedAnnouncement[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [tab, setTab] = useState<"all" | "donations" | "expenses" | "announcements">("all")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/recycle-bin")
      if (!res.ok) throw new Error("Failed to load")
      const data = await res.json()
      setDonations(data.donations)
      setExpenses(data.expenses)
      setAnnouncements(data.announcements)
    } catch {
      toast.error("Failed to load recycle bin")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const restore = async (type: string, id: string) => {
    setActionId(id)
    try {
      const res = await fetch("/api/recycle-bin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id })
      })
      if (!res.ok) throw new Error("Failed to restore")
      toast.success("Item restored successfully")
      fetchData()
    } catch {
      toast.error("Could not restore item")
    } finally {
      setActionId(null)
    }
  }

  const permanentDelete = async (type: string, id: string, label: string) => {
    if (!confirm(`Permanently delete "${label}"? This CANNOT be undone and it will be gone forever.`)) return
    setActionId(id)
    try {
      const res = await fetch("/api/recycle-bin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id })
      })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Permanently deleted")
      fetchData()
    } catch {
      toast.error("Could not delete item")
    } finally {
      setActionId(null)
    }
  }

  const total = donations.length + expenses.length + announcements.length

  const tabs = [
    { key: "all", label: "All", count: total },
    { key: "donations", label: "Payments", count: donations.length, icon: HeartHandshake },
    { key: "expenses", label: "Expenses", count: expenses.length, icon: Receipt },
    { key: "announcements", label: "Announcements", count: announcements.length, icon: Bell },
  ] as const

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recycle Bin</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Deleted items are kept for <strong>3 months</strong> before permanent removal.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              tab === t.key
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            {"icon" in t && t.icon && <t.icon className="w-4 h-4" />}
            {t.label}
            {t.count > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                tab === t.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-44 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : total === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Trash2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Recycle bin is empty</h3>
          <p className="text-muted-foreground text-sm mt-1">Deleted items will appear here for 3 months.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* ── Donations ── */}
          {(tab === "all" || tab === "donations") && donations.map(d => (
            <div key={d.id} className="group relative rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payment</p>
                    <p className="font-bold text-emerald-600">₹{d.amount}</p>
                  </div>
                </div>
                <ExpiryBadge deletedAt={d.deletedAt} />
              </div>

              <div className="space-y-1">
                <p className="font-medium text-sm">{d.student.fullName}</p>
                <p className="text-xs text-muted-foreground font-mono">{d.student.federationId}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px]">{d.status}</Badge>
                  {d.paymentMethod && <Badge variant="outline" className="text-[10px]">{d.paymentMethod}</Badge>}
                  {d.notes && <span className="text-xs text-muted-foreground italic">({d.notes})</span>}
                </div>
                {d.verifiedBy && (
                  <p className="text-xs text-muted-foreground">Verified by: <span className="font-medium text-foreground">{d.verifiedBy.name}</span></p>
                )}
              </div>

              <p className="text-xs text-muted-foreground">Deleted {timeAgo(d.deletedAt)}</p>

              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" className="flex-1 h-8 gap-1 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
                  disabled={actionId === d.id} onClick={() => restore("donation", d.id)}>
                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                  disabled={actionId === d.id} onClick={() => permanentDelete("donation", d.id, `₹${d.amount} payment`)}
                  title="Delete permanently">
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}

          {/* ── Expenses ── */}
          {(tab === "all" || tab === "expenses") && expenses.map(e => (
            <div key={e.id} className="group relative rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                    <Receipt className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Expense</p>
                    <p className="font-bold text-orange-600">₹{e.amount}</p>
                  </div>
                </div>
                <ExpiryBadge deletedAt={e.deletedAt} />
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-sm">{e.title}</p>
                {e.description && <p className="text-xs text-muted-foreground line-clamp-2">{e.description}</p>}
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px]">{e.category}</Badge>
                  <Badge variant="outline" className={`text-[10px] ${e.status === "APPROVED" ? "text-emerald-700" : e.status === "REJECTED" ? "text-rose-700" : "text-orange-700"}`}>
                    {e.status}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">Deleted {timeAgo(e.deletedAt)}</p>

              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" className="flex-1 h-8 gap-1 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
                  disabled={actionId === e.id} onClick={() => restore("expense", e.id)}>
                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                  disabled={actionId === e.id} onClick={() => permanentDelete("expense", e.id, e.title)}
                  title="Delete permanently">
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}

          {/* ── Announcements ── */}
          {(tab === "all" || tab === "announcements") && announcements.map(a => (
            <div key={a.id} className="group relative rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Announcement</p>
                </div>
                <ExpiryBadge deletedAt={a.deletedAt} />
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-sm">{a.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-3">{a.content}</p>
              </div>

              <p className="text-xs text-muted-foreground">Deleted {timeAgo(a.deletedAt)}</p>

              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" className="flex-1 h-8 gap-1 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
                  disabled={actionId === a.id} onClick={() => restore("announcement", a.id)}>
                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                  disabled={actionId === a.id} onClick={() => permanentDelete("announcement", a.id, a.title)}
                  title="Delete permanently">
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
