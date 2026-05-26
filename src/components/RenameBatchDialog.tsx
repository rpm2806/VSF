"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Pencil } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function RenameBatchDialog({ oldName }: { oldName: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newName, setNewName] = useState(oldName)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || newName === oldName) return

    setLoading(true)
    try {
      const response = await fetch("/api/batches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldName, newName: newName.trim() })
      })

      if (!response.ok) throw new Error("Failed to rename batch")
      
      toast.success("Batch renamed successfully!")
      setOpen(false)
      router.refresh()
    } catch (_err) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 gap-2">
        <Pencil className="h-4 w-4" /> Rename Batch
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename Batch</DialogTitle>
          <DialogDescription>
            This will change the batch name for all students currently in &quot;{oldName}&quot;.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">New Batch Name</Label>
            <Input 
              id="name" 
              required 
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
          </div>
          <div className="pt-4 space-x-2 flex justify-end">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
