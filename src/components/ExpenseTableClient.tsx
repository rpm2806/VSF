"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Check, X, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ExpenseTableClient({ expenses, role }: { expenses: any[], role: string }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoadingId(id)
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error("Failed to update status")
      
      toast.success(`Expense ${newStatus.toLowerCase()} successfully!`)
      router.refresh()
    } catch (_err) {
      toast.error("Something went wrong.")
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Permanently delete expense "${title}"? This cannot be undone.`)) return
    setLoadingId(id)
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Expense deleted")
      router.refresh()
    } catch (_err) {
      toast.error("Could not delete expense")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            {role === "MASTER_ADMIN" && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={role === "MASTER_ADMIN" ? 6 : 5} className="text-center text-muted-foreground py-8">
                No expenses recorded yet.
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  <div className="font-medium">{expense.title}</div>
                  <div className="text-xs text-muted-foreground">{expense.description || "-"}</div>
                </TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell className="font-semibold text-destructive">₹{expense.amount}</TableCell>
                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={
                      expense.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      expense.status === "REJECTED" ? "bg-red-50 text-red-700 border-red-200" :
                      "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }
                  >
                    {expense.status}
                  </Badge>
                </TableCell>
                {role === "MASTER_ADMIN" && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {expense.status === "PENDING" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            disabled={loadingId === expense.id}
                            onClick={() => handleStatusChange(expense.id, "APPROVED")}
                          >
                            <Check className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={loadingId === expense.id}
                            onClick={() => handleStatusChange(expense.id, "REJECTED")}
                          >
                            <X className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      {/* Delete always visible for master admin */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        disabled={loadingId === expense.id}
                        onClick={() => handleDelete(expense.id, expense.title)}
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
