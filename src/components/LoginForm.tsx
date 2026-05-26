"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ShieldCheck, User, Calendar, Lock, Shield } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./ThemeToggle"

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
    <div className="w-full bg-card text-card-foreground rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[600px] border border-border transition-colors duration-300">
      {/* Left Panel */}
      <div className="w-full md:w-[45%] bg-muted/40 flex flex-col items-center justify-between p-10 relative overflow-hidden hidden md:flex border-r border-border">
        {/* Subtle decorative shapes */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center w-full z-10 relative mt-4">
          {/* VSF Logo replacement and beautification */}
          <div className="relative w-20 h-20 mb-5 rounded-full overflow-hidden shadow-lg border-2 border-primary/20 bg-background flex items-center justify-center p-1">
            <Image src="/logo.png" alt="VSF Logo" width={72} height={72} className="object-contain rounded-full" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1.5 text-center">Vriksh Students Federation</h2>
          <p className="text-xs text-muted-foreground text-center mb-8 max-w-[220px] leading-relaxed">
            Empowering education and building futures. Access your account to continue.
          </p>

          <div className="flex flex-col w-full gap-2 px-2">
            <button 
              type="button"
              onClick={() => setActiveTab("student")}
              className={cn(
                "px-5 py-3.5 rounded-xl flex items-center gap-3 transition-all text-sm font-medium border border-transparent", 
                activeTab === "student" 
                  ? "bg-primary/10 text-primary border-l-4 border-l-primary shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <User className="w-4 h-4" />
              Student Portal
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab("admin")}
              className={cn(
                "px-5 py-3.5 rounded-xl flex items-center gap-3 transition-all text-sm font-medium border border-transparent", 
                activeTab === "admin" 
                  ? "bg-primary/10 text-primary border-l-4 border-l-primary shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin / Volunteer
            </button>
          </div>
        </div>
        
        {/* Beautiful Illustration Area */}
        <div className="w-[110%] relative h-[220px] mt-8 z-0 -mb-10 opacity-90 select-none pointer-events-none">
          <Image src="/login-illustration.png" alt="Illustration" fill className="object-contain object-bottom" priority />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-[55%] p-8 md:p-12 lg:p-16 flex flex-col bg-card relative">
        {/* Theme Toggle inside Login form top corner */}
        <div className="absolute top-6 right-6 z-20">
          <ThemeToggle />
        </div>

        {/* Mobile Tabs */}
        <div className="flex md:hidden gap-2 mb-8 bg-muted p-1 rounded-xl">
          <button 
            type="button"
            onClick={() => setActiveTab("student")}
            className={cn("flex-1 py-2.5 text-sm rounded-lg font-semibold transition-all", activeTab === "student" ? "bg-card shadow-sm text-primary" : "text-muted-foreground")}
          >
            Student Portal
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("admin")}
            className={cn("flex-1 py-2.5 text-sm rounded-lg font-semibold transition-all", activeTab === "admin" ? "bg-card shadow-sm text-primary" : "text-muted-foreground")}
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
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mb-2.5">
                  {activeTab === "student" ? "Student Portal" : "Admin Access"}
                </h1>
                <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">
                  {activeTab === "student" 
                    ? "Enter your Aadhaar Number and Date of Birth to login" 
                    : "Enter your registered email and password to securely access the system"}
                </p>
              </div>

              {activeTab === "student" ? (
                <form onSubmit={handleStudentLogin} className="space-y-5 w-full max-w-sm mx-auto">
                  <div className="space-y-1.5">
                    <Label htmlFor="aadhaarNumber" className="text-foreground/95 font-semibold text-sm">Aadhaar Number</Label>
                    <div className="relative">
                      <User className="w-5 h-5 text-primary absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                      <Input 
                        id="aadhaarNumber" 
                        type="text" 
                        placeholder="Enter 12-digit Aadhaar" 
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value)}
                        className="pl-10 h-12 bg-background border-input focus-visible:ring-primary text-foreground font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dob" className="text-foreground/95 font-semibold text-sm">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="w-5 h-5 text-primary absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                      <Input 
                        id="dob" 
                        type="date" 
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="pl-10 h-12 bg-background border-input focus-visible:ring-primary text-foreground font-medium"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm rounded-xl gap-2 shadow-lg shadow-primary/10" disabled={loading}>
                      <Lock className="w-4 h-4" />
                      {loading ? "Authenticating..." : "Login to Portal"}
                    </Button>
                    <div className="mt-5 text-center">
                      <p className="text-xs text-muted-foreground">
                        New to Vriksh?{" "}
                        <Link href="/signup" className="text-primary font-bold hover:underline">
                          Register now
                        </Link>
                      </p>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAdminLogin} className="space-y-5 w-full max-w-sm mx-auto">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-foreground/95 font-semibold text-sm">Email Address</Label>
                    <div className="relative">
                      <User className="w-5 h-5 text-primary absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your@email.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-background border-input focus-visible:ring-primary text-foreground font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-foreground/95 font-semibold text-sm">Password</Label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-primary absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                      <Input 
                        id="password" 
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 bg-background border-input focus-visible:ring-primary text-foreground font-medium"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm rounded-xl gap-2 shadow-lg shadow-primary/10" disabled={loading}>
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
        <div className="mt-8 flex flex-col items-center">
          <div className="flex items-center w-full max-w-xs mb-3">
            <div className="flex-1 h-px bg-border"></div>
            <span className="px-3 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Secure Portal</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>
          <div className="flex items-center gap-1.5 text-primary">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold">Your data is safe & encrypted</span>
          </div>
        </div>
      </div>
    </div>
  )
}
