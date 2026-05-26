"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, MapPin, Phone, Mail, GraduationCap, Heart, CreditCard, Calendar, User } from "lucide-react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function StudentProfileDialog({ student }: { student: any }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" />}>
        <Eye className="w-4 h-4 mr-2" /> View Profile
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4 mb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                {student.fullName}
                <div className="text-sm font-mono text-muted-foreground font-normal">{student.federationId}</div>
              </div>
            </DialogTitle>
            <Badge variant={student.status === "ACTIVE" ? "default" : "outline"} className={student.status === "ACTIVE" ? "bg-emerald-500" : ""}>
              {student.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground border-b pb-2">Contact Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 text-muted-foreground">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Student Mobile</div>
                  {student.mobileNumber || "N/A"}
                </div>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Parent Contact</div>
                  {student.parentContact || "N/A"}
                </div>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground">
                <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Email Address</div>
                  {student.email || "N/A"}
                </div>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="grid grid-cols-1 gap-2 w-full">
                  <div>
                    <div className="font-medium text-foreground">Permanent Address</div>
                    {student.permanentAddress || "N/A"}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Current Address</div>
                    {student.currentAddress || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground border-b pb-2">Academic & Personal</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 text-muted-foreground">
                <GraduationCap className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Class & Batch</div>
                  {student.class || "N/A"} / Batch {student.batch || "N/A"}
                </div>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div>
                    <div className="font-medium text-foreground">Joining year at Vriksh</div>
                    {student.joiningYear}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Date of Birth</div>
                    {student.dob || "N/A"}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground">
                <Heart className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Blood Group</div>
                  {student.bloodGroup || "N/A"}
                </div>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground">
                <CreditCard className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Aadhaar Number</div>
                  {student.aadhaarNumber || "N/A"}
                </div>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground">
                <GraduationCap className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div>
                    <div className="font-medium text-foreground">Last School</div>
                    {student.lastSchool || "N/A"}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Specialization</div>
                    {student.specialization || "N/A"}
                  </div>
                </div>
              </div>
              {student.bio && (
                <div className="flex items-start gap-3 text-muted-foreground">
                  <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">Bio</div>
                    <div className="text-sm italic">&quot;{student.bio}&quot;</div>
                  </div>
                </div>
              )}
              {student.status === "ALUMNI" && student.workingAt && (
                <div className="flex items-start gap-3 text-muted-foreground">
                  <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">Working At</div>
                    {student.workingAt}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t space-y-4">
          <h3 className="font-semibold text-foreground border-b pb-2">Family Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-foreground">Father&apos;s Name</div>
              <div className="text-muted-foreground">{student.fatherName || "N/A"}</div>
            </div>
            <div>
              <div className="font-medium text-foreground">Mother&apos;s Name</div>
              <div className="text-muted-foreground">{student.motherName || "N/A"}</div>
            </div>
            <div className="col-span-2">
              <div className="font-medium text-foreground">Parent Contact Number</div>
              <div className="text-muted-foreground">{student.parentContact || "N/A"}</div>
            </div>
          </div>
        </div>

        {(student.profileImage || student.idProofImage) && (
          <div className="mt-6 pt-6 border-t space-y-4">
            <h3 className="font-semibold text-foreground border-b pb-2">Verification Documents</h3>
            <div className="grid grid-cols-2 gap-4">
              {student.profileImage && (
                <div className="space-y-2">
                  <div className="font-medium text-sm text-foreground">Profile Photo</div>
                  <a href={student.profileImage} target="_blank" rel="noopener noreferrer" className="block w-32 h-32 relative rounded-xl overflow-hidden border shadow-sm hover:ring-2 hover:ring-emerald-500 transition-all">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={student.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  </a>
                </div>
              )}
              {student.idProofImage && (
                <div className="space-y-2">
                  <div className="font-medium text-sm text-foreground">ID Proof (Aadhaar)</div>
                  <a href={student.idProofImage} target="_blank" rel="noopener noreferrer" className="block w-full max-w-[200px] h-32 relative rounded-xl overflow-hidden border shadow-sm hover:ring-2 hover:ring-emerald-500 transition-all">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={student.idProofImage} alt="ID Proof" className="w-full h-full object-cover" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t bg-muted -mx-6 -mb-6 p-6 rounded-b-lg flex justify-between items-center">
          <div>
            <div className="text-sm font-medium text-foreground">Total Pending Dues</div>
            <div className="text-xs text-muted-foreground">
              ₹1/day since {student.donationStartDate ? new Date(student.donationStartDate).toLocaleDateString() : "joining"}
            </div>
          </div>
          <div className="text-2xl font-bold text-orange-600">
            ₹{(student.pendingDues || 0).toLocaleString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
