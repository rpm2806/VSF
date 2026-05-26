import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { AddExpenseDialog } from "@/components/AddExpenseDialog"
import { ExpenseTableClient } from "@/components/ExpenseTableClient"

export default async function ExpensesPage() {
  const session = await auth()
  
  if (!session || (session.user.role !== "MASTER_ADMIN" && session.user.role !== "VOLUNTEER")) {
    redirect("/dashboard")
  }

  const expenses = await db.expense.findMany({
    where: { deletedAt: null },
    orderBy: { date: "desc" }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground mt-1">Track and audit federation operational expenses.</p>
        </div>
        <AddExpenseDialog />
      </div>

      <ExpenseTableClient expenses={expenses} role={session.user.role} />
    </div>
  )
}
