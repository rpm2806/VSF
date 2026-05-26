"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft, UploadCloud, FileImage } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const [idProofImage, setIdProofImage] = useState<File | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value)
      })
      if (profileImage) data.append("profileImage", profileImage)
      if (idProofImage) data.append("idProofImage", idProofImage)

      const response = await fetch("/api/signup", {
        method: "POST",
        body: data,
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to register")
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
    <div className="min-h-screen bg-[#f3fbf6] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#d1fae5_2px,transparent_2px)] bg-[size:32px_32px] opacity-40" />

      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/login" className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-900 transition-colors bg-white/80 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100/50">
          <div className="bg-emerald-700 px-8 py-10 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">Vriksh Students Federation</h1>
            <p className="text-emerald-100 text-lg">New Member Registration</p>
          </div>

          <form onSubmit={onSubmit} className="p-8 md:p-12 space-y-8">
            {/* Identity Role */}
            <div className="space-y-4 pb-8 border-b">
              <h2 className="text-xl font-semibold text-gray-800">1. Basic Identity</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="role">Registering as</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(val) => setFormData({...formData, role: val || "STUDENT"})}
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="ALUMNI">Alumni</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input 
                    id="fullName" 
                    required 
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4 pb-8 border-b">
              <h2 className="text-xl font-semibold text-gray-800">2. Contact Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number *</Label>
                  <Input 
                    id="mobileNumber" 
                    required 
                    pattern="[0-9]{10}"
                    placeholder="10-digit number"
                    value={formData.mobileNumber}
                    onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <Label htmlFor="currentAddress">Current Address</Label>
                  <Input 
                    id="currentAddress" 
                    value={formData.currentAddress}
                    onChange={e => setFormData({...formData, currentAddress: e.target.value})}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <Label htmlFor="permanentAddress">Permanent Address</Label>
                  <Input 
                    id="permanentAddress" 
                    value={formData.permanentAddress}
                    onChange={e => setFormData({...formData, permanentAddress: e.target.value})}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* Academic & Personal */}
            <div className="space-y-4 pb-8 border-b">
              <h2 className="text-xl font-semibold text-gray-800">3. Academic & Personal Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input 
                    id="dob" 
                    type="date"
                    value={formData.dob}
                    onChange={e => setFormData({...formData, dob: e.target.value})}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Input 
                    id="bloodGroup" 
                    placeholder="e.g. O+"
                    value={formData.bloodGroup}
                    onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
                  <Input 
                    id="aadhaarNumber"
                    required 
                    pattern="[0-9]{12}"
                    placeholder="12-digit Aadhaar"
                    value={formData.aadhaarNumber}
                    onChange={e => setFormData({...formData, aadhaarNumber: e.target.value})}
                    className="bg-gray-50 border-gray-200"
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
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Class / Year / Other</Label>
                  <Input 
                    id="class" 
                    value={formData.class}
                    onChange={e => setFormData({...formData, class: e.target.value})}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="lastSchool">Last School</Label>
                  <Input 
                    id="lastSchool" 
                    value={formData.lastSchool}
                    onChange={e => setFormData({...formData, lastSchool: e.target.value})}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="specialization">Specialization / Stream</Label>
                  <Input 
                    id="specialization" 
                    value={formData.specialization}
                    onChange={e => setFormData({...formData, specialization: e.target.value})}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>

                {formData.role === "ALUMNI" && (
                  <div className="space-y-2 col-span-1 md:col-span-3">
                    <Label htmlFor="workingAt">Currently Working At / Studying At</Label>
                    <Input 
                      id="workingAt" 
                      value={formData.workingAt}
                      onChange={e => setFormData({...formData, workingAt: e.target.value})}
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                )}
                
                <div className="space-y-2 col-span-1 md:col-span-3">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea 
                    id="bio"
                    className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell us a little bit about yourself..."
                  />
                </div>
              </div>
            </div>

            {/* Family Information */}
            <div className="space-y-4 pb-8 border-b">
              <h2 className="text-xl font-semibold text-gray-800">4. Family Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father&apos;s Name</Label>
                  <Input 
                    id="fatherName" 
                    value={formData.fatherName}
                    onChange={e => setFormData({...formData, fatherName: e.target.value})}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherName">Mother&apos;s Name</Label>
                  <Input 
                    id="motherName" 
                    value={formData.motherName}
                    onChange={e => setFormData({...formData, motherName: e.target.value})}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="parentContact">Parent&apos;s Contact Number</Label>
                  <Input 
                    id="parentContact" 
                    value={formData.parentContact}
                    onChange={e => setFormData({...formData, parentContact: e.target.value})}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">5. Verification Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="profileImage">Profile Photo</Label>
                  <div className="border-2 border-dashed border-emerald-200 rounded-xl p-6 text-center bg-emerald-50/50 hover:bg-emerald-50 transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      id="profileImage"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setProfileImage(e.target.files[0])
                        }
                      }}
                    />
                    <div className="flex flex-col items-center justify-center space-y-2 text-emerald-800">
                      {profileImage ? (
                        <>
                          <FileImage className="w-8 h-8 opacity-75" />
                          <span className="text-sm font-medium">{profileImage.name}</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 opacity-50" />
                          <span className="text-sm font-medium">Click to upload photo</span>
                          <span className="text-xs opacity-75">JPEG, PNG up to 5MB</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="idProofImage">ID Proof (Aadhaar/School ID)</Label>
                  <div className="border-2 border-dashed border-emerald-200 rounded-xl p-6 text-center bg-emerald-50/50 hover:bg-emerald-50 transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      id="idProofImage"
                      accept="image/*,application/pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setIdProofImage(e.target.files[0])
                        }
                      }}
                    />
                    <div className="flex flex-col items-center justify-center space-y-2 text-emerald-800">
                      {idProofImage ? (
                        <>
                          <FileImage className="w-8 h-8 opacity-75" />
                          <span className="text-sm font-medium">{idProofImage.name}</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 opacity-50" />
                          <span className="text-sm font-medium">Click to upload ID</span>
                          <span className="text-xs opacity-75">Image or PDF up to 5MB</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 flex justify-end">
              <Button type="submit" className="w-full md:w-auto min-w-[200px] h-12 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-200" disabled={loading}>
                {loading ? "Submitting..." : "Submit Registration"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
