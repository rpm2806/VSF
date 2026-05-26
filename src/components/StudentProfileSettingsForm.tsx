"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function StudentProfileSettingsForm({ student }: { student: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    mobileNumber: student.mobileNumber || "",
    email: student.email || "",
    fatherName: student.fatherName || "",
    motherName: student.motherName || "",
    parentContact: student.parentContact || "",
    bloodGroup: student.bloodGroup || "",
    lastSchool: student.lastSchool || "",
    specialization: student.specialization || "",
    permanentAddress: student.permanentAddress || "",
    currentAddress: student.currentAddress || "",
    bio: student.bio || "",
    workingAt: student.workingAt || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/students/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error("Failed to update profile")

      toast.success("Profile updated successfully")
      router.refresh()
    } catch (_err) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl bg-card p-6 rounded-2xl border shadow-sm mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="mobileNumber">Personal Mobile Number</Label>
          <Input id="mobileNumber" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bloodGroup">Blood Group</Label>
          <Input id="bloodGroup" name="bloodGroup" placeholder="e.g., O+" value={formData.bloodGroup} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastSchool">Last School / College</Label>
          <Input id="lastSchool" name="lastSchool" value={formData.lastSchool} onChange={handleChange} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Input id="specialization" name="specialization" value={formData.specialization} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="permanentAddress">Permanent Address</Label>
          <Input id="permanentAddress" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentAddress">Current Address</Label>
          <Input id="currentAddress" name="currentAddress" value={formData.currentAddress} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fatherName">Father&apos;s Name</Label>
          <Input id="fatherName" name="fatherName" value={formData.fatherName} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="motherName">Mother&apos;s Name</Label>
          <Input id="motherName" name="motherName" value={formData.motherName} onChange={handleChange} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="parentContact">Parent/Guardian Contact Number</Label>
          <Input id="parentContact" name="parentContact" value={formData.parentContact} onChange={handleChange} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea 
            id="bio" 
            name="bio" 
            value={formData.bio} 
            onChange={handleChange} 
            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {student.status === "ALUMNI" && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="workingAt">Working At</Label>
            <Input id="workingAt" name="workingAt" value={formData.workingAt} onChange={handleChange} placeholder="e.g. Google, self-employed" />
          </div>
        )}
      </div>

      <div className="pt-4 flex justify-end border-t">
        <Button type="submit" disabled={loading} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white mt-4">
          <Save className="w-4 h-4" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
