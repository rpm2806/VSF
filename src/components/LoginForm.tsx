"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { GraduationCap, ShieldCheck, User, Calendar, Lock, Shield } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"student" | "admin">("student")

  // Student Form State
  const [aadhaarNumber, setAadhaarNumber] = useState("")
  const [dob, setDob] = useState("")

  // Admin Form State
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await signIn("student-login", {
        aadhaarNumber,
        dob,
        redirect: false,
      })

      if (res?.error) {
        toast.error("Invalid Aadhaar Number or Date of Birth")
      } else {
        toast.success("Login successful")
        router.push("/dashboard")
      }
    } catch (_err) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await signIn("admin-login", {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        toast.error("Invalid credentials")
      } else {
        toast.success("Login successful")
        router.push("/dashboard")
      }
    } catch (_err) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full bg-white rounded-3xl shadow-2xl flex overflow-hidden min-h-[600px] border border-gray-100">
      {/* Left Panel */}
      <div className="w-full md:w-[45%] bg-[#f7fdf9] flex-col items-center justify-between p-12 relative overflow-hidden hidden md:flex border-r border-gray-100">
        <div className="flex flex-col items-center w-full z-10 relative mt-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
            <GraduationCap className="w-8 h-8 text-emerald-700" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
          <p className="text-sm text-gray-500 text-center mb-10 max-w-[200px] leading-relaxed">
            Access your account to continue your journey
          </p>

          <div className="flex flex-col w-full gap-2 px-4">
            <button 
              type="button"
              onClick={() => setActiveTab("student")}
              className={cn(
                "px-6 py-4 rounded-xl flex items-center gap-3 transition-all text-sm", 
                activeTab === "student" 
                  ? "bg-[#eaf5ef] text-emerald-800 border-l-4 border-emerald-600 font-semibold" 
                  : "text-gray-500 hover:bg-gray-50 font-medium"
              )}
            >
              <GraduationCap className="w-5 h-5" />
              Student Portal
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab("admin")}
              className={cn(
                "px-6 py-4 rounded-xl flex items-center gap-3 transition-all text-sm", 
                activeTab === "admin" 
                  ? "bg-[#eaf5ef] text-emerald-800 border-l-4 border-emerald-600 font-semibold" 
                  : "text-gray-500 hover:bg-gray-50 font-medium"
              )}
            >
              <ShieldCheck className="w-5 h-5" />
              Admin / Volunteer
            </button>
          </div>
        </div>
        
        <div className="w-[120%] relative h-[250px] mt-8 z-0 -mb-10 opacity-90">
          <Image src="/login-illustration.png" alt="Illustration" fill className="object-contain object-bottom" priority />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-[55%] p-8 md:p-16 flex flex-col bg-white">
        {/* Mobile Tabs */}
        <div className="flex md:hidden gap-2 mb-8 bg-gray-50 p-1 rounded-xl">
          <button 
            type="button"
            onClick={() => setActiveTab("student")}
            className={cn("flex-1 py-2 text-sm rounded-lg font-medium transition-all", activeTab === "student" ? "bg-white shadow-sm text-emerald-700" : "text-gray-500")}
          >
            Student
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("admin")}
            className={cn("flex-1 py-2 text-sm rounded-lg font-medium transition-all", activeTab === "admin" ? "bg-white shadow-sm text-emerald-700" : "text-gray-500")}
          >
            Admin
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full justify-center"
            >
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {activeTab === "student" ? "Student Portal" : "Admin Access"}
                </h1>
                <p className="text-gray-500 text-sm max-w-[280px] mx-auto leading-relaxed">
                  {activeTab === "student" 
                    ? "Enter your Aadhaar Number and Date of Birth to login" 
                    : "Enter your registered email and password to securely access the system"}
                </p>
              </div>

              {activeTab === "student" ? (
                <form onSubmit={handleStudentLogin} className="space-y-6 w-full max-w-sm mx-auto">
                  <div className="space-y-2">
                    <Label htmlFor="aadhaarNumber" className="text-gray-700 font-semibold">Aadhaar Number</Label>
                    <div className="relative">
                      <User className="w-5 h-5 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input 
                        id="aadhaarNumber" 
                        type="text" 
                        placeholder="Enter 12-digit Aadhaar" 
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value)}
                        className="pl-10 h-12 bg-background border-input focus-visible:ring-emerald-500 text-foreground"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob" className="text-foreground font-semibold">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="w-5 h-5 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                      <Input 
                        id="dob" 
                        type="date" 
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="pl-10 h-12 bg-background border-input focus-visible:ring-emerald-500 text-foreground [&::-webkit-calendar-picker-indicator]:opacity-0"
                        required
                      />
                      <Calendar className="w-5 h-5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button type="submit" className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-base rounded-xl gap-2 shadow-lg shadow-emerald-200" disabled={loading}>
                      <Lock className="w-4 h-4" />
                      {loading ? "Authenticating..." : "Login to Portal"}
                    </Button>
                    <div className="mt-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        New to Vriksh?{" "}
                        <Link href="/signup" className="text-emerald-700 font-semibold hover:underline">
                          Register now
                        </Link>
                      </p>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAdminLogin} className="space-y-6 w-full max-w-sm mx-auto">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-semibold">Email Address</Label>
                    <div className="relative">
                      <User className="w-5 h-5 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your@email.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-background border-input focus-visible:ring-emerald-500 text-foreground"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-semibold">Password</Label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input 
                        id="password" 
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 bg-background border-input focus-visible:ring-emerald-500 text-foreground"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button type="submit" className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-base rounded-xl gap-2 shadow-lg shadow-emerald-200" disabled={loading}>
                      <Lock className="w-4 h-4" />
                      {loading ? "Authenticating..." : "Login to System"}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Area */}
        <div className="mt-12 flex flex-col items-center">
          <div className="flex items-center w-full max-w-xs mb-4">
            <div className="flex-1 h-px bg-border"></div>
            <span className="px-4 text-xs text-muted-foreground font-medium">Secure & Trusted</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>
          <div className="flex items-center gap-2 text-emerald-600">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium">Your data is safe with us</span>
          </div>
        </div>
      </div>
    </div>
  )
}
