"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Edit } from "lucide-react"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EditStudentDialog({ student, existingBatches = [] }: { student: any; existingBatches?: string[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isCustomBatch, setIsCustomBatch] = useState(false)
  
  const allBatches = Array.from(new Set([...existingBatches, student.batch].filter(Boolean))).sort() as string[]
  
  const [formData, setFormData] = useState({
    fullName: student.fullName || "",
    mobileNumber: student.mobileNumber || "",
    email: student.email || "",
    class: student.class || "",
    batch: student.batch || "",
    bloodGroup: student.bloodGroup || "",
    aadhaarNumber: student.aadhaarNumber || "",
    dob: student.dob || "",
    duesAmount: (() => {
      if (student.advanceBalance && student.advanceBalance > 0) {
        return `-${student.advanceBalance}`;
      }
      return student.pendingDues !== undefined ? student.pendingDues.toString() : (student.duesAmount ? student.duesAmount.toString() : "0");
    })(),
    parentsName: student.parentsName || "",
    fatherName: student.fatherName || "",
    motherName: student.motherName || "",
    parentContact: student.parentContact || "",
    lastSchool: student.lastSchool || "",
    specialization: student.specialization || "",
    permanentAddress: student.permanentAddress || "",
    currentAddress: student.currentAddress || "",
    bio: student.bio || "",
    workingAt: student.workingAt || "",
    joiningYear: student.joiningYear ? student.joiningYear.toString() : new Date().getFullYear().toString(),
    donationStartDate: student.donationStartDate ? new Date(student.donationStartDate).toISOString().split('T')[0] : "",
    status: student.status || "ACTIVE",
    role: student.role || "STUDENT"
  })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.bloodGroup.trim()) {
      toast.error("Please enter Blood Group.")
      setLoading(false)
      return
    }

    try {
      // Convert all text values to uppercase
      const uppercaseData: any = { ...formData }
      Object.keys(uppercaseData).forEach(key => {
        const val = uppercaseData[key]
        if (typeof val === "string") {
          uppercaseData[key] = val.toUpperCase()
        }
      })

      const response = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(uppercaseData)
      })

      if (!response.ok) throw new Error("Failed to update student")
      
      toast.success("Student updated successfully!")
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
      <DialogTrigger render={<Button variant="ghost" size="sm" className="h-8 text-amber-600 hover:text-amber-800 hover:bg-amber-50" />}>
        <Edit className="h-4 w-4 mr-2" /> Edit
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student Data</DialogTitle>
          <DialogDescription>
            Update pending information for {student.federationId}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                required 
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input 
                id="mobileNumber" 
                required 
                value={formData.mobileNumber}
                onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aadhaarNumber">Aadhaar No.</Label>
              <Input 
                id="aadhaarNumber" 
                value={formData.aadhaarNumber}
                onChange={e => setFormData({...formData, aadhaarNumber: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Input 
                id="class" 
                value={formData.class}
                onChange={e => setFormData({...formData, class: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch">Batch</Label>
              {isCustomBatch ? (
                <div className="flex gap-2">
                  <Input 
                    id="batch" 
                    placeholder="Enter custom batch"
                    value={formData.batch}
                    onChange={e => setFormData({...formData, batch: e.target.value})}
                    autoFocus
                  />
                  <Button type="button" variant="outline" onClick={() => {
                    setIsCustomBatch(false)
                    setFormData({...formData, batch: student.batch || ""})
                  }}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Select 
                  value={formData.batch} 
                  onValueChange={(value) => {
                    if (value === "CREATE_CUSTOM") {
                      setIsCustomBatch(true)
                      setFormData({...formData, batch: ""})
                    } else {
                      setFormData({...formData, batch: value || ""})
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {allBatches.map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                    <SelectItem value="CREATE_CUSTOM" className="text-primary font-medium">
                      + Create Custom Batch
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group *</Label>
              <Input 
                id="bloodGroup" 
                required
                placeholder="e.g. O+"
                value={formData.bloodGroup}
                onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input 
                id="dob" 
                type="date"
                value={formData.dob}
                onChange={e => setFormData({...formData, dob: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="joiningYear">Joining Year *</Label>
              <Input 
                id="joiningYear" 
                type="number"
                required
                value={formData.joiningYear}
                onChange={e => setFormData({...formData, joiningYear: e.target.value})}
              />
            </div>
          </div>

          <div className="border-t pt-4 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fatherName">Father&apos;s Name</Label>
              <Input 
                id="fatherName" 
                value={formData.fatherName}
                onChange={e => setFormData({...formData, fatherName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motherName">Mother&apos;s Name</Label>
              <Input 
                id="motherName" 
                value={formData.motherName}
                onChange={e => setFormData({...formData, motherName: e.target.value})}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="parentContact">Parent Contact</Label>
              <Input 
                id="parentContact" 
                value={formData.parentContact}
                onChange={e => setFormData({...formData, parentContact: e.target.value})}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="lastSchool">Current/Last - School/College</Label>
              <Input 
                id="lastSchool" 
                value={formData.lastSchool}
                onChange={e => setFormData({...formData, lastSchool: e.target.value})}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input 
                id="specialization" 
                value={formData.specialization}
                onChange={e => setFormData({...formData, specialization: e.target.value})}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="permanentAddress">Permanent Address</Label>
              <Input 
                id="permanentAddress" 
                value={formData.permanentAddress}
                onChange={e => setFormData({...formData, permanentAddress: e.target.value})}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="currentAddress">Current Address</Label>
              <Input 
                id="currentAddress" 
                value={formData.currentAddress}
                onChange={e => setFormData({...formData, currentAddress: e.target.value})}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea 
                id="bio"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
              />
            </div>
            {formData.status === "ALUMNI" && (
              <div className="space-y-2 col-span-2">
                <Label htmlFor="workingAt">Working At</Label>
                <Input 
                  id="workingAt" 
                  placeholder="e.g. Google, self-employed, etc."
                  value={formData.workingAt}
                  onChange={e => setFormData({...formData, workingAt: e.target.value})}
                />
              </div>
            )}
          </div>

          <div className="border-t pt-4 grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: (v as string) || "ACTIVE"})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ALUMNI">Alumni</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formData.role} onValueChange={v => setFormData({...formData, role: (v as string) || "STUDENT"})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="ALUMNI">Alumni</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duesAmount">Dues Amount (₹)</Label>
              <Input 
                id="duesAmount" 
                type="number"
                value={formData.duesAmount}
                onChange={e => setFormData({...formData, duesAmount: e.target.value})}
              />
              <p className="text-[10px] text-muted-foreground leading-tight">
                Entering an amount will automatically calculate the dues start date for this user.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="donationStartDate">Custom Dues Start Date</Label>
              <Input 
                id="donationStartDate" 
                type="date"
                value={formData.donationStartDate}
                onChange={e => setFormData({...formData, donationStartDate: e.target.value})}
              />
              <p className="text-[10px] text-muted-foreground leading-tight">
                Or select a specific date from when daily dues should accumulate.
              </p>
            </div>
          </div>

          <div className="pt-4 space-x-2 flex justify-end">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
