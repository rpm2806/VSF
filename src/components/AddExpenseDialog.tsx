"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Upload, Camera, X, Receipt } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CameraCapture } from "@/components/CameraCapture"

export function AddExpenseDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)

  // Bill image state
  const [billFile, setBillFile] = useState<File | null>(null)
  const [billPreview, setBillPreview] = useState<string | null>(null)
  const billInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "EVENT",
    description: "",
  })

  const handleFileSelect = (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Bill image must be under 4MB.")
      return
    }
    setBillFile(file)
    setBillPreview(URL.createObjectURL(file))
  }

  const clearBill = () => {
    setBillFile(null)
    setBillPreview(null)
    if (billInputRef.current) billInputRef.current.value = ""
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()
      submitData.append("title", formData.title)
      submitData.append("amount", formData.amount)
      submitData.append("category", formData.category)
      submitData.append("description", formData.description)
      if (billFile) {
        submitData.append("billImage", billFile)
      }

      const response = await fetch("/api/expenses", {
        method: "POST",
        body: submitData,
      })

      if (!response.ok) throw new Error("Failed to add expense")

      toast.success("Expense recorded successfully!")
      setOpen(false)
      router.refresh()

      // Reset
      setFormData({ title: "", amount: "", category: "EVENT", description: "" })
      clearBill()
    } catch (_err) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" /> Add Expense
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Record New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              required
              placeholder="e.g. Annual Function Catering"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select defaultValue="EVENT" onValueChange={v => setFormData({ ...formData, category: v || "EVENT" })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EVENT">Event</SelectItem>
                  <SelectItem value="STATIONARY">Stationary</SelectItem>
                  <SelectItem value="BOOKS">Books</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency Support</SelectItem>
                  <SelectItem value="WELFARE">Welfare</SelectItem>
                  <SelectItem value="MISC">Miscellaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (₹) *</Label>
              <Input
                type="number"
                required
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Input
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Bill Image Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Receipt className="h-4 w-4" /> Bill / Receipt (Optional)
            </Label>
            {billPreview ? (
              <div className="relative group rounded-lg overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={billPreview}
                  alt="Bill preview"
                  className="w-full h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={clearBill}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow opacity-80 hover:opacity-100 transition-opacity"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs py-1 px-2 text-center">
                  {billFile?.name}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 h-10"
                  onClick={() => billInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" /> Upload File
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 h-10"
                  onClick={() => setCameraOpen(true)}
                >
                  <Camera className="h-4 w-4" /> Use Camera
                </Button>
              </div>
            )}
            <input
              ref={billInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleFileSelect(file)
              }}
            />
            <p className="text-[10px] text-muted-foreground">Accepted: images or PDF, max 4MB</p>
          </div>

          <div className="pt-2 space-x-2 flex justify-end">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Recording..." : "Record Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>

      <CameraCapture
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(file) => {
          handleFileSelect(file)
          setCameraOpen(false)
        }}
        title="Capture Bill / Receipt"
      />
    </Dialog>
  )
}
