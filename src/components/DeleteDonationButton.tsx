"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DeleteDonationButton({ id, amount }: { id: string; amount: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Permanently delete this ₹${amount} payment record? This will also delete any receipt. This cannot be undone.`)) return
    setLoading(true)
    try {
      const res = await fetch("/api/donations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "Failed to delete")
      }
      toast.success("Payment record deleted")
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not delete payment")
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
      className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
      title="Delete payment record (Master Admin only)"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </Button>
  )
}
