"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { StudentProfileDialog } from "@/components/StudentProfileDialog"
import { EditStudentDialog } from "@/components/EditStudentDialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, Search, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RenameBatchDialog } from "@/components/RenameBatchDialog"
import { Check, X, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function StudentTableClient({ students, currentUserRole }: { students: any[], currentUserRole?: string }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [batchFilter, setBatchFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [sortField, setSortField] = useState<string>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const uniqueBatches = Array.from(new Set(students.map(s => s.batch).filter(Boolean))).sort() as string[]

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const filteredStudents = students.filter(student => {
    if (batchFilter !== "ALL" && student.batch !== batchFilter) return false
    if (statusFilter !== "ALL" && student.status !== statusFilter) return false
    
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      (student.fullName && student.fullName.toLowerCase().includes(q)) ||
      (student.federationId && student.federationId.toLowerCase().includes(q)) ||
      (student.mobileNumber && student.mobileNumber.toLowerCase().includes(q))
    )
  })

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]

    aValue = typeof aValue === 'string' ? aValue.toLowerCase() : aValue
    bValue = typeof bValue === 'string' ? bValue.toLowerCase() : bValue

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const handleApprove = async (id: string, action: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action === "APPROVED" ? "ACTIVE" : "INACTIVE" })
      })
      if (!res.ok) throw new Error("Failed to update status")
      toast.success(`Student ${action.toLowerCase()} successfully!`)
      router.refresh()
    } catch (_err) {
      toast.error("Something went wrong.")
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to permanently delete student "${name}"?\nThis will also delete all their fee payments and receipt records.\nThis action cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "DELETE"
      })
      
      if (!res.ok) throw new Error("Failed to delete student")
      
      toast.success("Student deleted successfully!")
      router.refresh()
    } catch (_err) {
      toast.error("Failed to delete student. Something went wrong.")
    }
  }

  const exportToCSV = () => {
    if (sortedStudents.length === 0) return

    const headers = [
      "Federation ID",
      "Full Name",
      "Mobile Number",
      "Email",
      "Class",
      "Batch",
      "Joining Year",
      "Blood Group",
      "Status",
      "Pending Dues",
      "Advance Balance",
      "Role"
    ]

    const csvRows = [headers.join(",")]

    for (const s of sortedStudents) {
      const row = [
        s.federationId || "",
        `"${(s.fullName || "").replace(/"/g, '""')}"`,
        s.mobileNumber || "",
        s.email || "",
        s.class || "",
        s.batch || "",
        s.joiningYear || "",
        s.bloodGroup || "",
        s.status || "",
        s.pendingDues || 0,
        s.advanceBalance || 0,
        s.role || ""
      ]
      csvRows.push(row.join(","))
    }

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `students_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center w-full max-w-sm space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, ID, or mobile..."
              className="w-full pl-8 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {uniqueBatches.length > 0 && (
            <Select value={batchFilter} onValueChange={(v) => setBatchFilter(v || "ALL")}>
              <SelectTrigger className="w-[160px] bg-background">
                <SelectValue placeholder="All Batches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Batches</SelectItem>
                {uniqueBatches.map(b => (
                  <SelectItem key={b as string} value={b as string}>{b as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "ALL")}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="ALUMNI">Alumni</SelectItem>
            </SelectContent>
          </Select>
          {batchFilter !== "ALL" && (
            <RenameBatchDialog oldName={batchFilter} />
          )}
        </div>
        <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>
      
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("federationId")}>
                <div className="flex items-center gap-1">Federation ID <ArrowUpDown className="h-3 w-3" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("fullName")}>
                <div className="flex items-center gap-1">Full Name <ArrowUpDown className="h-3 w-3" /></div>
              </TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("joiningYear")}>
                <div className="flex items-center gap-1">Joining <ArrowUpDown className="h-3 w-3" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("pendingDues")}>
                <div className="flex items-center gap-1">Pending Dues <ArrowUpDown className="h-3 w-3" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("advanceBalance")}>
                <div className="flex items-center gap-1">Adv. Balance <ArrowUpDown className="h-3 w-3" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("status")}>
                <div className="flex items-center gap-1">Status <ArrowUpDown className="h-3 w-3" /></div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No students found.
                </TableCell>
              </TableRow>
            ) : (
              sortedStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono text-xs">{student.federationId}</TableCell>
                  <TableCell className="font-medium">{student.fullName}</TableCell>
                  <TableCell>{student.mobileNumber}</TableCell>
                  <TableCell>{student.joiningYear}</TableCell>
                  <TableCell>
                    <span className={student.pendingDues > 0 ? "text-orange-600 font-semibold" : "text-emerald-600"}>
                      ₹{student.pendingDues.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    {student.advanceBalance > 0 ? (
                      <span className="text-emerald-600 font-semibold">₹{student.advanceBalance.toLocaleString()}</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.status === "ACTIVE" ? "default" : "outline"} 
                      className={student.status === "ACTIVE" ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {student.status === "PENDING_APPROVAL" && (
                        <>
                          <Button size="icon" variant="outline" title="Approve" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => handleApprove(student.id, "APPROVED")}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="outline" title="Reject" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleApprove(student.id, "REJECTED")}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <StudentProfileDialog student={student} />
                      {student.status !== "PENDING_APPROVAL" && <EditStudentDialog student={student} />}
                      
                      {currentUserRole === "MASTER_ADMIN" && (
                        <Button 
                          size="icon" 
                          variant="outline" 
                          title="Delete Student" 
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" 
                          onClick={() => handleDelete(student.id, student.fullName)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
