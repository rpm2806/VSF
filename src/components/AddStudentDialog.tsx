"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Camera, Upload, X, ImageIcon } from "lucide-react"

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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { CameraCapture } from "@/components/CameraCapture"


export function AddStudentDialog({ initialBatch, existingBatches = [] }: { initialBatch?: string; existingBatches?: string[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isCustomBatch, setIsCustomBatch] = useState(false)

  // Image state
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [idProofImageFile, setIdProofImageFile] = useState<File | null>(null)
  const [idProofImagePreview, setIdProofImagePreview] = useState<string | null>(null)
  const [cameraTarget, setCameraTarget] = useState<"profile" | "idProof" | null>(null)
  
  const profileInputRef = useRef<HTMLInputElement>(null)
  const idProofInputRef = useRef<HTMLInputElement>(null)

  const allBatches = Array.from(new Set([...existingBatches, initialBatch].filter(Boolean))).sort() as string[]
  
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    fatherName: "",
    motherName: "",
    parentContact: "",
    aadhaarNumber: "",
    dob: "",
    lastSchool: "",
    specialization: "",
    permanentAddress: "",
    currentAddress: "",
    bio: "",
    bloodGroup: "",
    class: "",
    batch: initialBatch || "",
    joiningYear: new Date().getFullYear().toString(),
    donationStartDate: "",
    duesAmount: 0
  })

  const handleFileSelect = (file: File, target: "profile" | "idProof") => {
    if (file.size > 4 * 1024 * 1024) {
      toast.error("File size must be under 4MB.")
      return
    }
    const previewUrl = URL.createObjectURL(file)
    if (target === "profile") {
      setProfileImageFile(file)
      setProfileImagePreview(previewUrl)
    } else {
      setIdProofImageFile(file)
      setIdProofImagePreview(previewUrl)
    }
  }

  const handleCameraCapture = (file: File) => {
    if (cameraTarget) {
      handleFileSelect(file, cameraTarget)
    }
    setCameraTarget(null)
  }

  const clearImage = (target: "profile" | "idProof") => {
    if (target === "profile") {
      setProfileImageFile(null)
      setProfileImagePreview(null)
      if (profileInputRef.current) profileInputRef.current.value = ""
    } else {
      setIdProofImageFile(null)
      setIdProofImagePreview(null)
      if (idProofInputRef.current) idProofInputRef.current.value = ""
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.bloodGroup.trim()) {
      toast.error("Please enter Blood Group.")
      setLoading(false)
      return
    }

    try {
      // Build FormData for file upload support
      const submitData = new FormData()
      
      // Add all text fields (uppercased)
      Object.entries(formData).forEach(([key, value]) => {
        const val = typeof value === "string" ? value.toUpperCase() : value.toString()
        submitData.append(key, val)
      })

      // Add image files
      if (profileImageFile) {
        submitData.append("profileImage", profileImageFile)
      }
      if (idProofImageFile) {
        submitData.append("idProofImage", idProofImageFile)
      }

      const response = await fetch("/api/students", {
        method: "POST",
        body: submitData
      })

      if (!response.ok) throw new Error("Failed to create student")
      
      toast.success("Student added successfully!")
      setOpen(false)
      router.refresh()
      
      // Reset form
      setFormData({
        fullName: "",
        mobileNumber: "",
        email: "",
        fatherName: "",
        motherName: "",
        parentContact: "",
        aadhaarNumber: "",
        dob: "",
        lastSchool: "",
        specialization: "",
        permanentAddress: "",
        currentAddress: "",
        bio: "",
        bloodGroup: "",
        class: "",
        batch: initialBatch || "",
        joiningYear: new Date().getFullYear().toString(),
        donationStartDate: "",
        duesAmount: 0
      })
      clearImage("profile")
      clearImage("idProof")
    } catch (_err) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" /> Add Student
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter student details. Federation ID will be auto-generated.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          {/* Photo & ID Proof Upload Section */}
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Photo & ID Proof
            </Label>
            <div className="grid grid-cols-2 gap-4">
              {/* Profile Photo */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Profile Photo</Label>
                {profileImagePreview ? (
                  <div className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profileImagePreview}
                      alt="Profile preview"
                      className="w-full h-28 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => clearImage("profile")}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 text-xs h-9"
                      onClick={() => profileInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5" /> Upload
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 text-xs h-9"
                      onClick={() => setCameraTarget("profile")}
                    >
                      <Camera className="h-3.5 w-3.5" /> Camera
                    </Button>
                  </div>
                )}
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file, "profile")
                  }}
                />
              </div>
              {/* ID Proof */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">ID Proof</Label>
                {idProofImagePreview ? (
                  <div className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={idProofImagePreview}
                      alt="ID proof preview"
                      className="w-full h-28 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => clearImage("idProof")}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 text-xs h-9"
                      onClick={() => idProofInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5" /> Upload
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 text-xs h-9"
                      onClick={() => setCameraTarget("idProof")}
                    >
                      <Camera className="h-3.5 w-3.5" /> Camera
                    </Button>
                  </div>
                )}
                <input
                  ref={idProofInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file, "idProof")
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input 
              id="fullName" 
              required 
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobileNumber">Mobile Number *</Label>
            <Input 
              id="mobileNumber" 
              required 
              pattern="[0-9]{10}"
              value={formData.mobileNumber}
              onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
                    setFormData({...formData, batch: ""})
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
          </div>
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="aadhaarNumber">Aadhaar No.</Label>
              <Input 
                id="aadhaarNumber" 
                value={formData.aadhaarNumber}
                onChange={e => setFormData({...formData, aadhaarNumber: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="duesAmount">Dues Amount (₹)</Label>
              <Input 
                id="duesAmount" 
                type="number"
                value={formData.duesAmount}
                onChange={e => setFormData({...formData, duesAmount: parseFloat(e.target.value) || 0})}
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
            <div className="space-y-2 col-span-2">
              <Label htmlFor="fatherName">Father&apos;s Name</Label>
              <Input 
                id="fatherName" 
                value={formData.fatherName}
                onChange={e => setFormData({...formData, fatherName: e.target.value})}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="motherName">Mother&apos;s Name</Label>
              <Input 
                id="motherName" 
                value={formData.motherName}
                onChange={e => setFormData({...formData, motherName: e.target.value})}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="parentContact">Parent&apos;s Contact</Label>
              <Input 
                id="parentContact" 
                value={formData.parentContact}
                onChange={e => setFormData({...formData, parentContact: e.target.value})}
              />
            </div>
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
          <div className="space-y-2">
            <Label htmlFor="joiningYear">Joining year at Vriksh *</Label>
            <Input 
              id="joiningYear" 
              type="number" 
              required 
              value={formData.joiningYear}
              onChange={e => setFormData({...formData, joiningYear: e.target.value})}
            />
          </div>
          <div className="pt-4 space-x-2 flex justify-end">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Student"}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Camera Capture Modal */}
      <CameraCapture
        open={cameraTarget !== null}
        onClose={() => setCameraTarget(null)}
        onCapture={handleCameraCapture}
        title={cameraTarget === "profile" ? "Capture Profile Photo" : "Capture ID Proof"}
      />
    </Dialog>
  )
}
