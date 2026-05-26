"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus } from "lucide-react"

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

export function AddVolunteerDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to create volunteer")
      }
      
      toast.success("Volunteer added successfully!")
      setOpen(false)
      router.refresh()
      
      setFormData({
        name: "",
        email: "",
        password: ""
      })
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" /> Add Volunteer
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Volunteer</DialogTitle>
          <DialogDescription>
            Create a new volunteer account. They will be able to manage students and donations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input 
              id="name" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (User ID) *</Label>
            <Input 
              id="email" 
              type="email"
              required 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Temporary Password *</Label>
            <Input 
              id="password" 
              type="text"
              required 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div className="pt-4 space-x-2 flex justify-end">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Volunteer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
