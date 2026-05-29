import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { renderToStream } from "@react-pdf/renderer"
import { ReceiptPDF } from "@/components/ReceiptPDF"
import React from "react"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    const receipt = await db.receipt.findUnique({
      where: { id },
      include: {
        student: true,
        donation: true,
      }
    })

    if (!receipt) {
      return new NextResponse("Receipt not found", { status: 404 })
    }

    // Role check: Only the student themselves, or Admin/Volunteer can view
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session.user as any).role
    if ((userRole === "STUDENT" || userRole === "ALUMNI" || userRole === "OTHER") && session.user.id !== receipt.studentId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const { student, donation } = receipt

    // Calculate dynamic daily period covered (where ₹1 = 1 day)
    const baseDate = student.donationStartDate || student.createdAt
    const previousDonations = await db.donation.findMany({
      where: {
        studentId: student.id,
        status: "PAID",
        deletedAt: null,
        createdAt: { lt: donation.createdAt }
      }
    })
    const previousPaidAmount = previousDonations.reduce((acc, d) => acc + d.amount, 0)
    
    const startIST = new Date(new Date(baseDate).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
    startIST.setHours(0, 0, 0, 0)

    const startCovered = new Date(startIST)
    startCovered.setDate(startCovered.getDate() + previousPaidAmount)

    const endCovered = new Date(startCovered)
    endCovered.setDate(endCovered.getDate() + donation.amount - 1)

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const periodCovered = `${formatDate(startCovered)} - ${formatDate(endCovered)}`

    // Build receipt line items based on exact daily period covered
    const lineItems = [
      {
        description: `Federation Dues (${periodCovered})`,
        amount: receipt.amount
      }
    ]

    // Calculate current dues standing for this student
    const allStudentDonations = await db.donation.findMany({
      where: { studentId: student.id, status: "PAID", deletedAt: null }
    })
    const totalDonations = allStudentDonations.reduce((acc, d) => acc + d.amount, 0)

    let pendingDues = 0
    let advanceBalance = 0

    const effectiveStartDate = student.donationStartDate || student.createdAt
    if (effectiveStartDate) {
      const startIST = new Date(new Date(effectiveStartDate).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
      const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
      const startUTC = Date.UTC(startIST.getFullYear(), startIST.getMonth(), startIST.getDate())
      const nowUTC = Date.UTC(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate())
      const diffDays = Math.floor((nowUTC - startUTC) / (1000 * 60 * 60 * 24))

      if (diffDays >= 0) {
        const totalDays = diffDays + 1
        const totalOwed = (totalDays * 1) + (student.duesAmount || 0)
        pendingDues    = Math.max(0, totalOwed - totalDonations)
        advanceBalance = Math.max(0, totalDonations - totalOwed)
      } else {
        const advanceDays = Math.abs(diffDays)
        pendingDues    = Math.max(0, (student.duesAmount || 0) - totalDonations)
        advanceBalance = Math.max(0, totalDonations - (student.duesAmount || 0)) + (advanceDays * 1)
      }
    } else {
      pendingDues = Math.max(0, (student.duesAmount || 0) - totalDonations)
    }

    const pdfData = {
      receiptNumber: receipt.receiptNumber,
      date: receipt.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      studentName: student.fullName,
      federationId: student.federationId,
      amount: receipt.amount,
      paymentType: donation.paymentMethod === "CASH" && donation.notes 
        ? `Cash (Given to: ${donation.notes})` 
        : (donation.paymentMethod || "N/A"),
      periodCovered,
      lineItems,
      mobileNumber: student.mobileNumber || undefined,
      email: student.email || undefined,
      batch: student.batch || undefined,
      studentClass: student.class || undefined,
      pendingDues,
      advanceBalance,
    }

    // Render PDF to stream
    // @ts-expect-error -- react-pdf renderToStream typing
    const stream = await renderToStream(React.createElement(ReceiptPDF, pdfData))
    
    // Convert the stream to a Web ReadableStream
    const readableStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => {
          controller.enqueue(chunk)
        })
        stream.on('end', () => {
          controller.close()
        })
        stream.on('error', (err) => {
          controller.error(err)
        })
      }
    })

    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Receipt-${receipt.receiptNumber}.pdf"`,
      }
    })
  } catch (error) {
    console.error("[RECEIPT_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
