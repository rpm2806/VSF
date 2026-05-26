"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import { QrCode, Upload, CheckCircle2 } from "lucide-react"

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

export default function StudentDonationDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [amount, setAmount] = useState("30")
  const [paymentProof, setPaymentProof] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB")
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setPaymentProof(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || parseInt(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    setLoading(true)
    
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          paymentProof,
          paymentMethod: "UPI",
          type: "MONTHLY"
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to submit donation")
      }

      toast.success("Payment submitted successfully! Waiting for Admin verification.")
      setOpen(false)
      // Reset form
      setAmount("30")
      setPaymentProof(null)
      router.refresh()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2" />}>
        <QrCode className="w-4 h-4" />
        Pay Federation Fee
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Make a Payment</DialogTitle>
          <DialogDescription>
            Scan the official VSF QR code, pay via UPI, and submit your payment screenshot.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="flex flex-col items-center justify-center space-y-3 p-4 border rounded-xl bg-muted/30">
            <p className="text-sm font-semibold text-primary">Vriksh Students Federation</p>
            <div className="relative w-44 h-44 bg-card rounded-xl p-1 shadow-sm border overflow-hidden">
              <Image 
                src="/upi-qr.png" 
                alt="UPI QR Code" 
                fill 
                className="object-cover"
                onError={(e) => {
                  // Fallback if image doesn't exist yet
                  const target = e.target as HTMLImageElement;
                  target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cpath d='M8 12h8'%3E%3C/path%3E%3Cpath d='M12 8v8'%3E%3C/path%3E%3C/svg%3E"
                }}
              />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-foreground">Rupam Kumar</p>
              <p className="text-xs text-muted-foreground">Scan to pay using any UPI app</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input 
                id="amount" 
                type="number" 
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              {parseInt(amount) > 0 && (
                <p className="text-xs text-primary font-medium">
                  Covers {Math.ceil(parseInt(amount) / 30)} month(s) of dues.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Payment Screenshot (Required)</Label>
              <div className="flex items-center gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full relative overflow-hidden"
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {paymentProof ? (
                    <span className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" /> Attached
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Upload className="w-4 h-4" /> Upload Image
                    </span>
                  )}
                </Button>
                {paymentProof && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setPaymentProof(null)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit for Verification"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
