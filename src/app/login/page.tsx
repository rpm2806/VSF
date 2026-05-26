import LoginForm from "@/components/LoginForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center relative overflow-hidden">
      {/* Background aesthetics - subtle dots */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--color-primary)_1.5px,transparent_1.5px)] bg-[size:32px_32px] opacity-15" />

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
        <Link href="/" className="absolute top-8 left-4 md:left-8 flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors bg-card/80 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm border border-border">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="w-full max-w-5xl mt-16 md:mt-0">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
