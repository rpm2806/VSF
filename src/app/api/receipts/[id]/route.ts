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
    if (userRole === "STUDENT" && session.user.id !== receipt.studentId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const { student, donation } = receipt

    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    const mn = (m: number | null | undefined) => m ? MONTHS[m - 1] : ""

    // Build receipt line items
    const lineItems: { description: string; amount: number }[] = []

    if (donation.type === "ADVANCE" && donation.startMonth && donation.endMonth && donation.startYear && donation.endYear) {
      const startLabel = `${mn(donation.startMonth)} ${donation.startYear}`
      const endLabel   = `${mn(donation.endMonth)} ${donation.endYear}`
      // Monthly portion = 1 unit; rest = advance months
      const advanceMonths = (donation.endYear - donation.startYear) * 12 + (donation.endMonth - donation.startMonth)
      const perMonth = advanceMonths > 0 ? Math.round((receipt.amount / (advanceMonths + 1)) * 100) / 100 : receipt.amount
      const advanceAmt = Math.round((receipt.amount - perMonth) * 100) / 100
      lineItems.push({ description: `Monthly Mandatory Donation (${startLabel})`, amount: perMonth })
      if (advanceMonths > 0) {
        const nm = donation.startMonth % 12 + 1
        const ny = donation.startMonth === 12 ? donation.startYear + 1 : donation.startYear
        lineItems.push({ description: `Advance Donation (${mn(nm)} ${ny} \u2013 ${endLabel})`, amount: advanceAmt })
      }
    } else {
      const startLabel = `${mn(donation.startMonth)} ${donation.startYear}`
      const endLabel   = donation.endMonth ? ` \u2013 ${mn(donation.endMonth)} ${donation.endYear}` : ""
      lineItems.push({
        description: `${donation.type === "MONTHLY" ? "Monthly Donation" : "Donation"} (${startLabel}${endLabel})`,
        amount: receipt.amount,
      })
    }

    const periodCovered = donation.endMonth
      ? `${mn(donation.startMonth)} ${donation.startYear} \u2013 ${mn(donation.endMonth)} ${donation.endYear}`
      : `${mn(donation.startMonth)} ${donation.startYear}`

    const pdfData = {
      receiptNumber: receipt.receiptNumber,
      date: receipt.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      studentName: student.fullName,
      federationId: student.federationId,
      amount: receipt.amount,
      paymentType: donation.paymentMethod || "N/A",
      periodCovered,
      lineItems,
      mobileNumber: student.mobileNumber || undefined,
      email: student.email || undefined,
      batch: student.batch || undefined,
      studentClass: student.class || undefined,
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
