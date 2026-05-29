"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AddDonationDialog({ students }: { students: any[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [openCombobox, setOpenCombobox] = useState(false)
  
  const [formData, setFormData] = useState({
    studentId: "",
    amount: "30",
    type: "MONTHLY",
    paymentMethod: "UPI",
    paymentProof: "",
    notes: ""
  })

  // Calculate covered months preview
  const coveredMonthsPreview = useMemo(() => {
    const amt = parseFloat(formData.amount)
    if (isNaN(amt) || amt <= 0) return 0
    return Math.floor(amt / 30)
  }, [formData.amount])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.studentId) {
      toast.error("Please select a student.")
      return
    }
    if (formData.paymentMethod === "CASH" && !formData.notes.trim()) {
      toast.error("Please enter the name of the volunteer receiving the cash.")
      return
    }
    
    setLoading(true)

    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error("Failed to add donation")
      
      toast.success("Donation recorded and is pending verification!")
      setOpen(false)
      router.refresh()
    } catch (_err) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const selectedStudent = students.find((s) => s.id === formData.studentId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2 bg-emerald-600 hover:bg-emerald-700" />}>
        <Plus className="h-4 w-4" /> Record Donation
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record New Donation</DialogTitle>
          <DialogDescription>
            Just enter the amount, and the system will auto-calculate the months covered.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2 flex flex-col">
            <Label>Search Student</Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger render={
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="justify-between"
                />
              }>
                  {selectedStudent
                    ? `${selectedStudent.federationId} - ${selectedStudent.fullName}`
                    : "Search student..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-[380px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search by name or VSF ID..." />
                  <CommandList>
                    <CommandEmpty>No student found.</CommandEmpty>
                    <CommandGroup>
                      {students.map((student) => (
                        <CommandItem
                          key={student.id}
                          value={`${student.federationId} ${student.fullName}`}
                          onSelect={() => {
                            setFormData({ ...formData, studentId: student.id })
                            setOpenCombobox(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.studentId === student.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {student.federationId} - {student.fullName}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select defaultValue="MONTHLY" onValueChange={v => setFormData({...formData, type: (v as string) || "MONTHLY"})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="ADVANCE">Advance</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input 
                type="number" 
                required 
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
          </div>
          
          {coveredMonthsPreview > 0 && (
             <div className="text-sm p-3 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
               Based on ₹{formData.amount}, this payment will automatically cover <strong>{coveredMonthsPreview} month{coveredMonthsPreview > 1 ? 's' : ''}</strong> of federation dues.
             </div>
          )}

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={formData.paymentMethod} onValueChange={v => setFormData({...formData, paymentMethod: (v as string) || "UPI"})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.paymentMethod === "CASH" && (
            <div className="space-y-2">
              <Label htmlFor="notes">
                Received by (Volunteer Name) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="notes"
                type="text"
                placeholder="Enter the name of the volunteer receiving cash"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                required
              />
            </div>
          )}

          <div className="pt-4 space-x-2 flex justify-end">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Recording..." : "Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
