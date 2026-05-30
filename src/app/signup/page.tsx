"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft, UploadCloud, FileImage, FileText, Camera } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { compressImage } from "@/lib/image-compressor"
import { CameraCapture } from "@/components/CameraCapture"

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    role: "STUDENT",
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
    batch: "",
    joiningYear: new Date().getFullYear().toString(),
    workingAt: "",
  })

  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string>("")
  const [idProofImage, setIdProofImage] = useState<File | null>(null)
  const [idProofPreview, setIdProofPreview] = useState<string>("")

  const [profileCameraOpen, setProfileCameraOpen] = useState(false)
  const [idProofCameraOpen, setIdProofCameraOpen] = useState(false)

  const handleProfileCapture = async (file: File) => {
    const toastId = toast.loading("Processing captured profile photo...")
    try {
      const optimized = await compressImage(file)
      setProfileImage(optimized)
      setProfilePreview(URL.createObjectURL(optimized))
      toast.success("Profile photo captured and optimized!", { id: toastId })
    } catch (err) {
      toast.error("Failed to process captured image.", { id: toastId })
    }
  }

  const handleIdProofCapture = async (file: File) => {
    const toastId = toast.loading("Processing captured ID proof...")
    try {
      const optimized = await compressImage(file)
      setIdProofImage(optimized)
      setIdProofPreview(URL.createObjectURL(optimized))
      toast.success("ID proof captured and optimized!", { id: toastId })
    } catch (err) {
      toast.error("Failed to process captured image.", { id: toastId })
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.bloodGroup.trim()) {
      toast.error("Please enter your Blood Group.")
      setLoading(false)
      return
    }

    if (!profileImage) {
      toast.error("Please upload your Profile Photo.")
      setLoading(false)
      return
    }
    if (!idProofImage) {
      toast.error("Please upload your ID Proof photo.")
      setLoading(false)
      return
    }

    // Strict validation: PNG, JPG, JPEG only
    const validExtensions = ["png", "jpg", "jpeg"]
    const getExtension = (fileName: string) => fileName.split('.').pop()?.toLowerCase() || ""
    
    const profileExt = getExtension(profileImage.name)
    const idProofExt = getExtension(idProofImage.name)

    if (!validExtensions.includes(profileExt) || !profileImage.type.startsWith("image/")) {
      toast.error("Profile Photo must be a PNG, JPG or JPEG image file only.")
      setLoading(false)
      return
    }
    if (!validExtensions.includes(idProofExt) || !idProofImage.type.startsWith("image/")) {
      toast.error("ID Proof must be a PNG, JPG or JPEG image file only.")
      setLoading(false)
      return
    }

    if (profileImage.size > 4 * 1024 * 1024) {
      toast.error("Profile Photo exceeds 4MB. Please upload a smaller image.")
      setLoading(false)
      return
    }
    if (idProofImage.size > 4 * 1024 * 1024) {
      toast.error("ID Proof Photo exceeds 4MB. Please upload a smaller image.")
      setLoading(false)
      return
    }

    try {
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          // Normalize text values to uppercase
          let upperVal = typeof value === "string" ? value.toUpperCase() : value
          if (key === "batch" && formData.role === "OTHER") {
            upperVal = "OTHER"
          }
          data.append(key, upperVal)
        }
      })
      if (formData.role === "OTHER" && !formData.batch) {
        data.append("batch", "OTHER")
      }
      if (profileImage) data.append("profileImage", profileImage)
      if (idProofImage) data.append("idProofImage", idProofImage)

      const response = await fetch("/api/signup", {
        method: "POST",
        body: data,
      })

      if (!response.ok) {
        let errMsg = "Failed to register"
        try {
          const err = await response.json()
          errMsg = err.error || errMsg
        } catch (_) {
          try {
            const rawText = await response.text()
            errMsg = rawText || errMsg
          } catch (__) {}
        }
        throw new Error(errMsg)
      }
      
      toast.success("Registration submitted! Awaiting admin approval.")
      router.push("/login")
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#d1fae5_2px,transparent_2px)] bg-[size:32px_32px] opacity-40" />

      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/login" className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-primary transition-colors bg-white/80 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>

        <div className="bg-card text-card-foreground rounded-3xl shadow-xl overflow-hidden border border-border">
          <div className="bg-primary px-8 py-10 text-primary-foreground text-center">
            <h1 className="text-3xl font-bold mb-2">Vriksh Students Federation</h1>
            <p className="text-primary-foreground/80 text-lg">New Member Registration</p>
          </div>

          <form onSubmit={onSubmit} className="p-8 md:p-12 space-y-8">
            {/* Identity Role */}
            <div className="space-y-4 pb-8 border-b">
              <h2 className="text-xl font-bold text-primary font-bold">1. Basic Identity</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold mb-1.5 block" htmlFor="role">Registering as</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(val) => setFormData({...formData, role: val || "STUDENT"})}
                  >
                    <SelectTrigger className="bg-background border-input text-foreground focus-visible:ring-primary placeholder:text-muted-foreground font-medium">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="ALUMNI">Alumni</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold mb-1.5 block" htmlFor="fullName">Full Name *</Label>
                  <Input 
                    id="fullName" 
                    required 
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    className="bg-background border-input text-foreground focus-visible:ring-primary placeholder:text-muted-foreground font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4 pb-8 border-b">
              <h2 className="text-xl font-bold text-primary font-bold">2. Contact Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold mb-1.5 block" htmlFor="mobileNumber">Mobile Number *</Label>
                  <Input 
                    id="mobileNumber" 
                    required 
                    pattern="[0-9]{10}"
                    placeholder="10-digit number"
                    value={formData.mobileNumber}
                    onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
                    className="bg-background border-input text-foreground focus-visible:ring-primary placeholder:text-muted-foreground font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold mb-1.5 block" htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="bg-background border-input text-foreground focus-visible:ring-primary placeholder:text-muted-foreground font-medium"
                  />
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <Label className="text-foreground font-semibold mb-1.5 block" htmlFor="currentAddress">Current Address</Label>
                  <Input 
                    id="currentAddress" 
                    value={formData.currentAddress}
                    onChange={e => setFormData({...formData, currentAddress: e.target.value})}
                    className="bg-background border-input text-foreground focus-visible:ring-primary placeholder:text-muted-foreground font-medium"
                  />
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <Label className="text-foreground font-semibold mb-1.5 block" htmlFor="permanentAddress">Permanent Address</Label>
                  <Input 
                    id="permanentAddress" 
                    value={formData.permanentAddress}
                    onChange={e => setFormData({...formData, permanentAddress: e.target.value})}
                    className="bg-background border-input text-foreground focus-visible:ring-primary placeholder:text-muted-foreground font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Academic & Personal */}
            <div className="space-y-4 pb-8 border-b">
              <h2 className="text-xl font-bold text-primary font-bold">3. Academic & Personal Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold mb-1.5 block" htmlFor="dob">Date of Birth *</Label>
                  <Input 
                    id="dob" 
                    type="date"
                    required
                    value={formData.dob}
                    onChange={e => setFormData({...formData, dob: e.target.value})}
                    className="bg-background border-input text-foreground focus-visible:ring-primary placeholder:text-muted-foreground font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold mb-1.5 block" htmlFor="bloodGroup">Blood Group *</Label>
                  <Input 
                    id="bloodGroup" 
                    required
                    placeholder="e.g. O+"
                    value={formData.bloodGroup}
                    onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                    className="bg-background border-input text-foreground focus-visible:ring-primary placeholder:text-muted-foreground font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold mb-1.5 block" htmlFor="aadhaarNumber">Aadhaar Number *</Label>
                  <Input 
                    id="aadhaarNumber"
                    required 
                    pattern="[0-9]{12}"
                    placeholder="12-digit Aadhaar"
                    value={formData.aadhaarNumber}
                    onChange={e => setFormData({...formData, aadhaarNumber: e.target.value})}
                    className="bg-background border-input text-foreground focus-visible:ring-primary placeholder:text-muted-foreground font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold mb-1.5 block" htmlFor="joiningYear">Joining year at Vriksh *</Label>
                  <Input 
                    id="joiningYear" 
                    type="number" 
                    required 
                    value={formData.joiningYear}
                    onChange={e => setFormData({...formData, joiningYear: e.target.value})}
                    className="bg-background border-input text-foreground focus-visible:ring-primary placeholder:text-muted-foreground font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold mb-1.5 block" htmlFor="class">Class / Graduated in 20XX *</Label>
                  <Input 
                    id="class" 
                    required
                    value={formData.class}
                    onChange={e => setFormData({...formData, class: e.target.value})}
                    className="bg-background border-input text-foreground focus-visible:ring-primary placeholder:text-muted-foreground font-medium"
                  />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label className="text-foreground font-semibold mb-1.5 block" htmlFor="lastSchool">Current/Last - School/College *</Label>
                  <Input 
                    id="lastSchool" 
                    required
                    value={formData.lastSchool}
                    onChange={e => setFormData({...formData, lastSchool: e.target.value})}
                    className="bg-background border-input text-foreground focus-visible:ring-primary placeholder:text-muted-foreground font-medium"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-foreground font-semibold mb-1.5 block" htmlFor="specialization">Specialization / Stream</Label>
                  <Input 
                    id="specialization" 
                    value={formData.specialization}
                    onChange={e => setFormData({...formData, specialization: e.target.value})}
                    className="bg-background border-input text-foreground focus-visible:ring-primary placeholder:text-muted-foreground font-medium"
                  />
                </div>

                {formData.role === "ALUMNI" && (
                  <div className="space-y-2 col-span-1 md:col-span-3">
                    <Label className="text-foreground font-semibold mb-1.5 block" htmlFor="workingAt">Currently Working At / Studying At</Label>
                    <Input 
                      id="workingAt" 
                      value={formData.workingAt}
                      onChange={e => setFormData({...formData, workingAt: e.target.value})}
                      className="bg-background border-input text-foreground focus-visible:ring-primary placeholder:text-muted-foreground font-medium"
                    />
                  </div>
                )}
                
                <div className="space-y-2 col-span-1 md:col-span-3">
                  <Label className="text-foreground font-semibold mb-1.5 block" htmlFor="bio">Bio</Label>
                  <textarea 
                    id="bio"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-foreground font-medium"
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell us a little bit about yourself..."
                  />
                </div>
              </div>
            </div>

            {/* Family Information */}
            <div className="space-y-4 pb-8 border-b">
              <h2 className="text-xl font-bold text-primary font-bold">4. Family Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold mb-1.5 block" htmlFor="fatherName">Father&apos;s Name *</Label>
                  <Input 
                    id="fatherName" 
                    required
                    value={formData.fatherName}
                    onChange={e => setFormData({...formData, fatherName: e.target.value})}
                    className="bg-background border-input text-foreground focus-visible:ring-primary placeholder:text-muted-foreground font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold mb-1.5 block" htmlFor="motherName">Mother&apos;s Name *</Label>
                  <Input 
                    id="motherName" 
                    required
                    value={formData.motherName}
                    onChange={e => setFormData({...formData, motherName: e.target.value})}
                    className="bg-background border-input text-foreground focus-visible:ring-primary placeholder:text-muted-foreground font-medium"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-foreground font-semibold mb-1.5 block" htmlFor="parentContact">Parent&apos;s Contact Number *</Label>
                  <Input 
                    id="parentContact" 
                    required
                    value={formData.parentContact}
                    onChange={e => setFormData({...formData, parentContact: e.target.value})}
                    className="bg-background border-input text-foreground focus-visible:ring-primary placeholder:text-muted-foreground font-medium"
                  />
                </div>
              </div>
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-primary font-bold">5. Verification Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold mb-1.5 block">Profile Photo *</Label>
                  <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 text-center bg-muted/40 hover:bg-muted/60 transition-colors flex flex-col items-center justify-center min-h-[180px] relative">
                    <input 
                      type="file" 
                      id="profileImage"
                      accept="image/png, image/jpeg, image/jpg"
                      className="hidden"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0]
                          const toastId = toast.loading("Processing profile photo...")
                          try {
                            const optimized = await compressImage(file)
                            setProfileImage(optimized)
                            setProfilePreview(URL.createObjectURL(optimized))
                            toast.success("Profile photo optimized successfully!", { id: toastId })
                          } catch (err) {
                            toast.error("Failed to process image.", { id: toastId })
                          }
                        }
                      }}
                    />
                    <div className="flex flex-col items-center justify-center space-y-4 text-primary w-full">
                      {profilePreview ? (
                        <div className="flex flex-col items-center space-y-3">
                          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/40 shadow-md">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={profilePreview} 
                              alt="Profile Preview" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground max-w-[200px] truncate">{profileImage?.name}</span>
                          <div className="flex items-center gap-3 mt-1">
                            <label htmlFor="profileImage" className="text-xs font-bold text-primary hover:underline cursor-pointer">
                              Upload New
                            </label>
                            <span className="text-xs text-muted-foreground/50">|</span>
                            <button 
                              type="button" 
                              onClick={() => setProfileCameraOpen(true)} 
                              className="text-xs font-bold text-primary hover:underline cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                            >
                              Use Camera
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="p-3 bg-primary/10 rounded-full text-primary animate-pulse">
                            <UploadCloud className="w-8 h-8" />
                          </div>
                          <span className="text-sm font-semibold text-foreground">Select Profile Photo</span>
                          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center max-w-[320px] px-2">
                            <label 
                              htmlFor="profileImage" 
                              className="flex items-center justify-center rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs px-4 py-2.5 cursor-pointer transition-all border border-primary/20 flex-1 hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <UploadCloud className="w-4 h-4 mr-2 text-primary" />
                              Upload File
                            </label>
                            <button 
                              type="button" 
                              onClick={() => setProfileCameraOpen(true)}
                              className="flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold text-xs px-4 py-2.5 transition-all border border-emerald-200 dark:border-emerald-900/40 flex-1 hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              Use Camera
                            </button>
                          </div>
                          <span className="text-[11px] font-semibold text-rose-500 max-w-[220px] leading-tight">Only PNG, JPG or JPEG accepted (max 4MB)</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold mb-1.5 block">ID Proof Photo (Aadhaar/School ID) *</Label>
                  <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 text-center bg-muted/40 hover:bg-muted/60 transition-colors flex flex-col items-center justify-center min-h-[180px] relative">
                    <input 
                      type="file" 
                      id="idProofImage"
                      accept="image/png, image/jpeg, image/jpg"
                      className="hidden"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0]
                          const toastId = toast.loading("Processing ID proof...")
                          try {
                            const optimized = await compressImage(file)
                            setIdProofImage(optimized)
                            setIdProofPreview(URL.createObjectURL(optimized))
                            toast.success("ID proof optimized successfully!", { id: toastId })
                          } catch (err) {
                            toast.error("Failed to process image.", { id: toastId })
                          }
                        }
                      }}
                    />
                    <div className="flex flex-col items-center justify-center space-y-4 text-primary w-full">
                      {idProofPreview ? (
                        <div className="flex flex-col items-center space-y-3">
                          <div className="relative w-40 h-24 rounded-lg overflow-hidden border-2 border-primary/40 shadow-md">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={idProofPreview} 
                              alt="ID Proof Preview" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground max-w-[200px] truncate">{idProofImage?.name}</span>
                          <div className="flex items-center gap-3 mt-1">
                            <label htmlFor="idProofImage" className="text-xs font-bold text-primary hover:underline cursor-pointer">
                              Upload New
                            </label>
                            <span className="text-xs text-muted-foreground/50">|</span>
                            <button 
                              type="button" 
                              onClick={() => setIdProofCameraOpen(true)} 
                              className="text-xs font-bold text-primary hover:underline cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                            >
                              Use Camera
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="p-3 bg-primary/10 rounded-full text-primary animate-pulse">
                            <UploadCloud className="w-8 h-8" />
                          </div>
                          <span className="text-sm font-semibold text-foreground">Select ID Proof Photo</span>
                          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center max-w-[320px] px-2">
                            <label 
                              htmlFor="idProofImage" 
                              className="flex items-center justify-center rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs px-4 py-2.5 cursor-pointer transition-all border border-primary/20 flex-1 hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <UploadCloud className="w-4 h-4 mr-2 text-primary" />
                              Upload File
                            </label>
                            <button 
                              type="button" 
                              onClick={() => setIdProofCameraOpen(true)}
                              className="flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold text-xs px-4 py-2.5 transition-all border border-emerald-200 dark:border-emerald-900/40 flex-1 hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              Use Camera
                            </button>
                          </div>
                          <span className="text-[11px] font-semibold text-rose-500 max-w-[220px] leading-tight">Only PNG, JPG or JPEG accepted (max 4MB)</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 flex justify-end">
              <Button type="submit" className="w-full md:w-auto min-w-[200px] h-12 text-lg bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl shadow-lg shadow-primary/10" disabled={loading}>
                {loading ? "Submitting..." : "Submit Registration"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <CameraCapture
        open={profileCameraOpen}
        onClose={() => setProfileCameraOpen(false)}
        onCapture={handleProfileCapture}
        title="Capture Profile Photo"
      />

      <CameraCapture
        open={idProofCameraOpen}
        onClose={() => setIdProofCameraOpen(false)}
        onCapture={handleIdProofCapture}
        title="Capture ID Proof Photo"
      />
    </div>
  )
}
