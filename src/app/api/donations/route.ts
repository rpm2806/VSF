import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { logActivity } from "@/lib/audit"
import { sendReceiptEmail } from "@/lib/email"
import { renderToBuffer } from "@react-pdf/renderer"
import { ReceiptPDF } from "@/components/ReceiptPDF"
import React from "react"
import { uploadBase64 } from "@/lib/cloudinary"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    const body = await req.json()
    const { amount, type, paymentMethod, paymentProof } = body
    
    // Determine studentId: if student, it's them. If admin, it's from body.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session.user as any).role
    const studentId = (userRole === "STUDENT" || userRole === "ALUMNI") ? session.user.id : body.studentId

    if (!studentId) return new NextResponse("Student ID is required", { status: 400 })

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return new NextResponse("Invalid amount", { status: 400 })
    }

    // Auto-calculate months
    const monthsCovered = Math.floor(parsedAmount / 30)
    
    // Find last donation to determine start month
    const lastDonation = await db.donation.findFirst({
      where: { studentId },
      orderBy: [{ endYear: "desc" }, { endMonth: "desc" }]
    })

    let startMonth = new Date().getMonth() + 1
    let startYear = new Date().getFullYear()

    if (lastDonation && lastDonation.endMonth && lastDonation.endYear) {
      startMonth = lastDonation.endMonth + 1
      startYear = lastDonation.endYear
      if (startMonth > 12) {
        startMonth = 1
        startYear += 1
      }
    }

    // Calculate end month
    let endMonth = startMonth + monthsCovered - 1
    let endYear = startYear
    
    while (endMonth > 12) {
      endMonth -= 12
      endYear += 1
    }

    const isAdmin = userRole === "MASTER_ADMIN" || userRole === "VOLUNTEER"
    const status = isAdmin ? "PAID" : "PENDING"
    
    let finalPaymentProof = paymentProof || null
    if (paymentProof && paymentProof.startsWith("data:")) {
      try {
        finalPaymentProof = await uploadBase64(paymentProof, "vriksh_donations")
      } catch (err) {
        console.error("Failed to upload payment proof to Cloudinary:", err)
      }
    }

    const donation = await db.donation.create({
      data: {
        studentId,
        amount: parsedAmount,
        type,
        startMonth,
        startYear,
        endMonth: monthsCovered > 0 ? endMonth : null,
        endYear: monthsCovered > 0 ? endYear : null,
        paymentMethod,
        paymentProof: finalPaymentProof,
        status,
        verifiedById: isAdmin ? session.user.id : null,
        verifiedAt: isAdmin ? new Date() : null,
      }
    })

    // Auto-generate receipt if PAID
    if (status === "PAID") {
      const receiptCount = await db.receipt.count()
      const receiptNumber = `VSF-REC-${new Date().getFullYear()}-${(receiptCount + 1).toString().padStart(5, '0')}`
      
      const receipt = await db.receipt.create({
        data: {
          receiptNumber,
          studentId,
          donationId: donation.id,
          amount: parsedAmount
        }
      })

      // Try sending email
      const student = await db.student.findUnique({ where: { id: studentId }})
      if (student && student.email) {
        const periodCovered = donation.endMonth 
          ? `${donation.startMonth}/${donation.startYear} - ${donation.endMonth}/${donation.endYear}`
          : `${donation.startMonth}/${donation.startYear}`
          
        const pdfData = {
          receiptNumber: receipt.receiptNumber,
          date: receipt.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
          studentName: student.fullName,
          federationId: student.federationId,
          amount: receipt.amount,
          paymentType: donation.paymentMethod || "N/A",
          periodCovered,
          mobileNumber: student.mobileNumber || undefined,
          email: student.email || undefined,
          batch: student.batch || undefined,
          studentClass: student.class || undefined,
        }
        
        try {
          // @ts-expect-error -- react-pdf renderToBuffer typing
          const pdfBuffer = await renderToBuffer(React.createElement(ReceiptPDF, pdfData))
          await sendReceiptEmail(student.email, student.fullName, parsedAmount, periodCovered, pdfBuffer)
        } catch (e) {
          console.error("Failed to generate or send receipt:", e)
        }
      }
    }

    // Log Activity
    await logActivity({
      userId: session.user.id,
      action: "DONATION_RECORDED",
      entityType: "DONATION",
      entityId: donation.id,
      details: isAdmin ? `Admin recorded ₹${parsedAmount} donation for student ${studentId}` : `Student submitted ₹${parsedAmount} via UPI`
    })

    return NextResponse.json(donation)
  } catch (error) {
    console.error("[DONATIONS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session.user as any).role
    if (userRole !== "MASTER_ADMIN" && userRole !== "VOLUNTEER") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { donationId, action } = body

    if (action === "VERIFY") {
      const donation = await db.donation.update({
        where: { id: donationId },
        data: {
          status: "PAID",
          verifiedById: session.user.id,
          verifiedAt: new Date()
        }
      })

      // Generate receipt
      const receiptCount = await db.receipt.count()
      const receiptNumber = `VSF-REC-${new Date().getFullYear()}-${(receiptCount + 1).toString().padStart(5, '0')}`
      
      const receipt = await db.receipt.create({
        data: {
          receiptNumber,
          studentId: donation.studentId,
          donationId: donation.id,
          amount: donation.amount
        }
      })

      // Try sending email
      const student = await db.student.findUnique({ where: { id: donation.studentId }})
      if (student && student.email) {
        const periodCovered = donation.endMonth 
          ? `${donation.startMonth}/${donation.startYear} - ${donation.endMonth}/${donation.endYear}`
          : `${donation.startMonth}/${donation.startYear}`
          
        const pdfData = {
          receiptNumber: receipt.receiptNumber,
          date: receipt.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
          studentName: student.fullName,
          federationId: student.federationId,
          amount: receipt.amount,
          paymentType: donation.paymentMethod || "N/A",
          periodCovered,
          mobileNumber: student.mobileNumber || undefined,
          email: student.email || undefined,
          batch: student.batch || undefined,
          studentClass: student.class || undefined,
        }
        
        try {
          // @ts-expect-error -- react-pdf renderToBuffer typing
          const pdfBuffer = await renderToBuffer(React.createElement(ReceiptPDF, pdfData))
          await sendReceiptEmail(student.email, student.fullName, donation.amount, periodCovered, pdfBuffer)
        } catch (e) {
          console.error("Failed to generate or send receipt:", e)
        }
      }

      // Log Activity
      await logActivity({
        userId: session.user.id,
        action: "DONATION_VERIFIED",
        entityType: "DONATION",
        entityId: donation.id,
        details: `Verified ₹${donation.amount} UPI donation`
      })

      return NextResponse.json(donation)
    }

    return new NextResponse("Invalid action", { status: 400 })
  } catch (error) {
    console.error("[DONATIONS_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
