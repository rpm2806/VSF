"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Megaphone, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function AddAnnouncementDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error("Failed to create announcement")

      toast.success("Announcement broadcasted successfully")
      setOpen(false)
      setFormData({ title: "", content: "" })
      router.refresh()
    } catch (_err) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200" />}>
        <Plus className="h-4 w-4" /> Broadcast Announcement
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-emerald-600" /> 
            New Announcement
          </DialogTitle>
          <DialogDescription>
            Broadcast a message to all students and volunteers. They will see this on their dashboard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              placeholder="e.g., Upcoming Welfare Drive" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Message Content</Label>
            <Textarea 
              id="content" 
              placeholder="Write your announcement details here..." 
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              required
              rows={5}
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? "Broadcasting..." : "Broadcast Now"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
