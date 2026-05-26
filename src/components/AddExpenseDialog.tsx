"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus } from "lucide-react"

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

export function AddExpenseDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "EVENT",
    description: "",
  })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error("Failed to add expense")
      
      toast.success("Expense recorded successfully!")
      setOpen(false)
      router.refresh()
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input 
              required 
              placeholder="e.g. Annual Function Catering"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select defaultValue="OFFICE" onValueChange={v => setFormData({...formData, category: (v as string) || "OFFICE"})}>
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
              <Label>Amount (₹)</Label>
              <Input 
                type="number" 
                required 
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Input 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="pt-4 space-x-2 flex justify-end">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Recording..." : "Record Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
