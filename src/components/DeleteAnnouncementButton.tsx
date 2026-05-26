"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DeleteAnnouncementButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Delete announcement "${title}"? This cannot be undone.`)) return
    setLoading(true)
    try {
      const res = await fetch("/api/announcements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Announcement deleted")
      router.refresh()
    } catch {
      toast.error("Could not delete announcement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
      title="Delete announcement"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}
