"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import { QrCode, Upload, CheckCircle2, X, Banknote, Smartphone } from "lucide-react"

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
import { cn } from "@/lib/utils"

export default function StudentDonationDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [amount, setAmount] = useState("30")
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CASH">("UPI")
  const [takerName, setTakerName] = useState("")
  const [paymentProof, setPaymentProof] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast.error("File size must be less than 4MB")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPaymentProof(result)
        setPreviewUrl(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveProof = () => {
    setPaymentProof(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || parseInt(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (paymentMethod === "UPI" && !paymentProof) {
      toast.error("Please upload your UPI payment screenshot before submitting")
      return
    }
    if (paymentMethod === "CASH" && !takerName.trim()) {
      toast.error("Please enter the name of the volunteer receiving your cash")
      return
    }

    setLoading(true)
    
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          paymentProof: paymentMethod === "UPI" ? paymentProof : null,
          paymentMethod,
          notes: paymentMethod === "CASH" ? takerName.trim() : undefined,
          type: "MONTHLY"
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to submit donation")
      }

      toast.success(
        paymentMethod === "CASH"
          ? "Cash payment submitted! Admin will verify when collected."
          : "Payment submitted successfully! Waiting for Admin verification."
      )
      setOpen(false)
      setAmount("30")
      setPaymentMethod("UPI")
      setTakerName("")
      setPaymentProof(null)
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
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
        Donate here
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Make a Payment</DialogTitle>
          <DialogDescription>
            Choose your payment method and submit your federation contribution.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">

          {/* Payment Method Toggle */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setPaymentMethod("UPI"); setPaymentProof(null); setPreviewUrl(null) }}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all",
                  paymentMethod === "UPI"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                <Smartphone className="w-4 h-4" />
                UPI / Online
              </button>
              <button
                type="button"
                onClick={() => { setPaymentMethod("CASH"); setPaymentProof(null); setPreviewUrl(null) }}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all",
                  paymentMethod === "CASH"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-border text-muted-foreground hover:border-emerald-400"
                )}
              >
                <Banknote className="w-4 h-4" />
                Cash
              </button>
            </div>
          </div>

          {/* UPI QR Code (only for UPI) */}
          {paymentMethod === "UPI" && (
            <div className="flex flex-col items-center justify-center space-y-3 p-4 border rounded-xl bg-muted/30">
              <p className="text-sm font-semibold text-primary">Vriksh Students Federation</p>
              <div className="relative w-44 h-44 bg-card rounded-xl p-1 shadow-sm border overflow-hidden">
                <Image
                  src="/upi-qr.png"
                  alt="UPI QR Code"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='1'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'%3E%3C/rect%3E%3Cpath d='M8 12h8'%3E%3C/path%3E%3Cpath d='M12 8v8'%3E%3C/path%3E%3C/svg%3E"
                  }}
                />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-foreground">Rupam Kumar</p>
                <p className="text-xs text-muted-foreground">Scan to pay using any UPI app</p>
              </div>
            </div>
          )}

          {/* Cash notice */}
          {paymentMethod === "CASH" && (
            <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <Banknote className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">Cash Payment</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Hand over the cash directly to a VSF volunteer. They will verify and record your payment.
                </p>
              </div>
            </div>
          )}

          {/* Taker Name for Cash */}
          {paymentMethod === "CASH" && (
            <div className="space-y-2">
              <Label htmlFor="taker-name">
                Received by (Volunteer Name) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="taker-name"
                type="text"
                placeholder="Enter the name of the volunteer receiving cash"
                value={takerName}
                onChange={(e) => setTakerName(e.target.value)}
              />
            </div>
          )}

          {/* Amount */}
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

          {/* Payment Screenshot Upload (UPI only) */}
          {paymentMethod === "UPI" && (
            <div className="space-y-2">
              <Label>
                Payment Screenshot <span className="text-rose-500">*</span>
              </Label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
                id="payment-proof-input"
              />

              {previewUrl ? (
                <div className="space-y-2">
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted/30">
                    <Image
                      src={previewUrl}
                      alt="Payment proof preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="flex-1 gap-2">
                      <Upload className="w-3.5 h-3.5" /> Change
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleRemoveProof} className="flex-1 gap-2 border-rose-200 text-rose-600 hover:bg-rose-50">
                      <X className="w-3.5 h-3.5" /> Remove
                    </Button>
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Screenshot attached successfully
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Tap to upload screenshot</p>
                    <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, JPEG up to 4MB</p>
                  </div>
                </button>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || (paymentMethod === "UPI" && !paymentProof) || (paymentMethod === "CASH" && !takerName.trim())}
          >
            {loading ? "Submitting..." : paymentMethod === "CASH" ? "Submit Cash Payment" : "Submit for Verification"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
