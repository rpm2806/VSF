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
import { ArrowUpDown, Search, Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RenameBatchDialog } from "@/components/RenameBatchDialog"
import { Check, X, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
    
    if (statusFilter !== "ALL") {
      if (statusFilter === "ALUMNI") {
        if (student.status !== "ALUMNI" && student.role !== "ALUMNI") return false
      } else {
        if (student.status !== statusFilter) return false
      }
    }
    
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

  const getExportHeaders = () => [
    "S.No.",
    "Federation ID",
    "Full Name",
    "Mobile Number",
    "Email",
    "Role",
    "Status",
    "Class/Graduated in 20XX",
    "Batch",
    "Joining Year",
    "DOB",
    "Blood Group",
    "Father's Name",
    "Mother's Name",
    "Parent's Contact",
    "Aadhaar Number",
    "Last School/College",
    "Specialization",
    "Permanent Address",
    "Current Address",
    "Working At",
    "Bio",
    "Pending Dues (₹)",
    "Advance Balance (₹)",
    "Donation Start Date",
    "Created At"
  ]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getExportRows = (data: any[]) => data.map((s, index) => [
    (index + 1).toString(),
    s.federationId || "",
    s.fullName || "",
    s.mobileNumber || "",
    s.email || "",
    s.role || "",
    s.status || "",
    s.class || "",
    s.batch || "",
    s.joiningYear?.toString() || "",
    s.dob || "",
    s.bloodGroup || "",
    s.fatherName || "",
    s.motherName || "",
    s.parentContact || "",
    s.aadhaarNumber || "",
    s.lastSchool || "",
    s.specialization || "",
    s.permanentAddress || "",
    s.currentAddress || "",
    s.workingAt || "",
    s.bio || "",
    s.pendingDues?.toString() || "0",
    s.advanceBalance?.toString() || "0",
    s.donationStartDate ? new Date(s.donationStartDate).toISOString().split('T')[0] : "",
    s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : "",
  ])

  const exportToExcel = async () => {
    if (sortedStudents.length === 0) {
      toast.error("No data to export.")
      return
    }

    try {
      toast.loading("Generating Excel file...", { id: "export" })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const XLSX = await import("xlsx") as any

      const headers = getExportHeaders()
      const rows = getExportRows(sortedStudents)

      const wsData = [headers, ...rows]
      const ws = XLSX.utils.aoa_to_sheet(wsData)

      // Auto-fit column widths
      const colWidths = headers.map((h, i) => {
        const maxLen = Math.max(h.length, ...rows.map(r => (r[i] || "").length))
        return { wch: Math.min(Math.max(maxLen + 2, 10), 40) }
      })
      ws["!cols"] = colWidths

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Students List")

      // Set workbook properties
      wb.Props = {
        Title: "Vriksh Students Federation - Student Data",
        Author: "VSF Admin",
        CreatedDate: new Date(),
      }

      XLSX.writeFile(wb, `VSF_Students_${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success("Excel file downloaded!", { id: "export" })
    } catch (err) {
      console.error("Excel export failed:", err)
      toast.error("Failed to generate Excel file.", { id: "export" })
    }
  }

  const exportToPdf = async () => {
    if (sortedStudents.length === 0) {
      toast.error("No data to export.")
      return
    }

    try {
      toast.loading("Generating PDF...", { id: "export" })
      const { default: jsPDF } = await import("jspdf")
      const autoTable = (await import("jspdf-autotable")).default

      // Use landscape A3 for more columns
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" })

      // Title header
      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(4, 120, 87) // Emerald
      doc.text("Vriksh Students Federation", 14, 18)

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(100, 100, 100)
      const filterInfo = [
        batchFilter !== "ALL" ? `Batch: ${batchFilter}` : null,
        statusFilter !== "ALL" ? `Status: ${statusFilter}` : null,
        searchQuery ? `Search: "${searchQuery}"` : null,
      ].filter(Boolean).join(" | ")
      doc.text(
        `Student Data Export — ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}${filterInfo ? ` — ${filterInfo}` : ""}`,
        14, 25
      )
      doc.text(`Total Records: ${sortedStudents.length}`, 14, 31)

      // Use a subset of columns for PDF (too many columns won't fit)
      const pdfHeaders = [
        "S.No.", "Federation ID", "Full Name", "Mobile", "Batch", "Class",
        "Joining", "DOB", "Blood", "Status", "Pending Dues (₹)", "Adv. Bal (₹)",
        "Father's Name", "Mother's Name", "Aadhaar"
      ]

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfRows = sortedStudents.map((s: any, i: number) => [
        (i + 1).toString(),
        s.federationId || "",
        s.fullName || "",
        s.mobileNumber || "",
        s.batch || "—",
        s.class || "—",
        s.joiningYear?.toString() || "",
        s.dob || "—",
        s.bloodGroup || "—",
        s.status || "",
        s.pendingDues?.toString() || "0",
        s.advanceBalance?.toString() || "0",
        s.fatherName || "—",
        s.motherName || "—",
        s.aadhaarNumber || "—",
      ])

      autoTable(doc, {
        head: [pdfHeaders],
        body: pdfRows,
        startY: 36,
        theme: "grid",
        styles: {
          fontSize: 7,
          cellPadding: 2,
          overflow: "linebreak",
          valign: "middle",
        },
        headStyles: {
          fillColor: [4, 120, 87],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 7.5,
          halign: "center",
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 10 },
          1: { cellWidth: 28 },
          2: { cellWidth: 35 },
          3: { cellWidth: 22 },
          10: { halign: "right" },
          11: { halign: "right" },
        },
        didDrawPage: (data: { pageNumber: number }) => {
          // Footer on every page
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pageCount = (doc.internal as any).getNumberOfPages()
          doc.setFontSize(8)
          doc.setTextColor(150, 150, 150)
          doc.text(
            `Page ${data.pageNumber} of ${pageCount} — Generated by VSF v1.10.1`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 8,
            { align: "center" }
          )
        },
      })

      doc.save(`VSF_Students_${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success("PDF downloaded!", { id: "export" })
    } catch (err) {
      console.error("PDF export failed:", err)
      toast.error("Failed to generate PDF.", { id: "export" })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, ID, or mobile..."
              className="w-full pl-8 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {uniqueBatches.length > 0 && (
              <Select value={batchFilter} onValueChange={(v) => setBatchFilter(v || "ALL")}>
                <SelectTrigger className="w-[140px] sm:w-[160px] bg-background">
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
              <SelectTrigger className="w-[140px] sm:w-[160px] bg-background">
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
        </div>
        <div className="flex items-center gap-2 justify-end sm:justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                <Download className="w-4 h-4" />
                Export
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToExcel} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Export as Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPdf} className="gap-2 cursor-pointer">
                <FileText className="w-4 h-4 text-red-600" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-muted-foreground font-semibold">S.No.</TableHead>
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
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("batch")}>
                <div className="flex items-center gap-1">Batch <ArrowUpDown className="h-3 w-3" /></div>
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
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No students found.
                </TableCell>
              </TableRow>
            ) : (
              sortedStudents.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium text-xs text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-mono text-xs">{student.federationId}</TableCell>
                  <TableCell className="font-medium">{student.fullName}</TableCell>
                  <TableCell>{student.mobileNumber}</TableCell>
                  <TableCell>{student.joiningYear}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-semibold px-2 py-0.5 bg-muted text-muted-foreground border-none">
                      {student.batch || "—"}
                    </Badge>
                  </TableCell>
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
                      {student.status !== "PENDING_APPROVAL" && <EditStudentDialog student={student} existingBatches={uniqueBatches} />}
                      
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
