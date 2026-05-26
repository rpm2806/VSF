"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Shield, ShieldOff, Key } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

function ResetPasswordDialog({ volunteerId, volunteerName }: { volunteerId: string, volunteerName: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState("")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/users/${volunteerId}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword })
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || "Failed to reset password")
      }

      toast.success("Password reset successfully")
      setOpen(false)
      setNewPassword("")
      router.refresh()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 px-3" title="Reset Password">
        <Key className="h-4 w-4 text-amber-500" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter a new password for {volunteerName}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor={`password-${volunteerId}`}>New Password</Label>
            <Input 
              id={`password-${volunteerId}`}
              required 
              minLength={6}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function VolunteerTableClient({ volunteers }: { volunteers: any[] }) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredVolunteers = volunteers.filter((v: any) => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error()
      toast.success(`Volunteer is now ${newStatus.toLowerCase()}`)
      router.refresh()
    } catch {
      toast.error("Failed to update status")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 bg-background p-2 rounded-md border shadow-sm max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <Input 
          placeholder="Search by name or email..." 
          className="border-0 focus-visible:ring-0 shadow-none h-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email (User ID)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVolunteers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No volunteers found.
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              filteredVolunteers.map((v: any) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>{v.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      v.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {v.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(v.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <ResetPasswordDialog volunteerId={v.id} volunteerName={v.name} />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toggleStatus(v.id, v.status)}
                      title={v.status === "ACTIVE" ? "Deactivate Volunteer" : "Reactivate Volunteer"}
                    >
                      {v.status === "ACTIVE" ? <ShieldOff className="h-4 w-4 text-rose-500" /> : <Shield className="h-4 w-4 text-emerald-500" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
