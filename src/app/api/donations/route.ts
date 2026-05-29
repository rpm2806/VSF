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
    const { amount, type, paymentMethod, paymentProof, notes } = body
    
    // Determine studentId: if student, it's them. If admin, it's from body.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session.user as any).role
    const studentId = (userRole === "STUDENT" || userRole === "ALUMNI" || userRole === "OTHER") ? session.user.id : body.studentId

    if (!studentId) return new NextResponse("Student ID is required", { status: 400 })

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return new NextResponse("Invalid amount", { status: 400 })
    }

    // Auto-calculate months
    const monthsCovered = Math.floor(parsedAmount / 30)
    
    // Fetch student to get their dues start date as baseline
    const student = await db.student.findUnique({ where: { id: studentId } })
    if (!student) return new NextResponse("Student not found", { status: 404 })

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
    } else {
      const baseDate = student.donationStartDate || student.createdAt
      if (baseDate) {
        startMonth = new Date(baseDate).getMonth() + 1
        startYear = new Date(baseDate).getFullYear()
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
        notes: notes || null,
        status,
        verifiedById: isAdmin ? session.user.id : null,
        verifiedAt: isAdmin ? new Date() : null,
      }
    })

    // Auto-generate receipt if PAID
    if (status === "PAID") {
      const currentYear = new Date().getFullYear()
      const latestReceipt = await db.receipt.findFirst({
        where: {
          receiptNumber: {
            startsWith: `VSF-REC-${currentYear}-`
          }
        },
        orderBy: {
          receiptNumber: 'desc'
        }
      })

      let nextNumber = 1
      if (latestReceipt) {
        const parts = latestReceipt.receiptNumber.split('-')
        const lastSuffix = parseInt(parts[parts.length - 1], 10)
        if (!isNaN(lastSuffix)) {
          nextNumber = lastSuffix + 1
        }
      }
      const receiptNumber = `VSF-REC-${currentYear}-${nextNumber.toString().padStart(5, '0')}`
      
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
          mobileNumber: student.mobileNumber || undefined,
          email: student.email || undefined,
          batch: student.batch || undefined,
          studentClass: student.class || undefined,
          pendingDues,
          advanceBalance,
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

    if (action === "REJECT") {
      const { reason } = body
      await db.donation.update({
        where: { id: donationId },
        data: {
          status: "REJECTED",
          verifiedById: session.user.id,
          verifiedAt: new Date(),
        }
      })

      await logActivity({
        userId: session.user.id,
        action: "DONATION_REJECTED",
        entityType: "DONATION",
        entityId: donationId,
        details: `Rejected payment. Reason: ${reason || "Not specified"}`
      })

      return NextResponse.json({ success: true })
    }

    if (action === "VERIFY") {
      // Check if donation is already verified (defensive check against double-clicks/glitches)
      const existingDonation = await db.donation.findUnique({ where: { id: donationId } })
      if (!existingDonation) {
        return new NextResponse("Donation not found", { status: 404 })
      }
      
      let donation = existingDonation
      let receiptGenerated = false

      if (existingDonation.status !== "PAID") {
        donation = await db.donation.update({
          where: { id: donationId },
          data: {
            status: "PAID",
            verifiedById: session.user.id,
            verifiedAt: new Date()
          }
        })
        receiptGenerated = true
      }

      // Generate receipt if it doesn't already exist (acts as auto-repair/regeneration if missing)
      let receipt = await db.receipt.findUnique({ where: { donationId } })
      if (!receipt) {
        const currentYear = new Date().getFullYear()
        const latestReceipt = await db.receipt.findFirst({
          where: {
            receiptNumber: {
              startsWith: `VSF-REC-${currentYear}-`
            }
          },
          orderBy: {
            receiptNumber: 'desc'
          }
        })

        let nextNumber = 1
        if (latestReceipt) {
          const parts = latestReceipt.receiptNumber.split('-')
          const lastSuffix = parseInt(parts[parts.length - 1], 10)
          if (!isNaN(lastSuffix)) {
            nextNumber = lastSuffix + 1
          }
        }
        const receiptNumber = `VSF-REC-${currentYear}-${nextNumber.toString().padStart(5, '0')}`

        receipt = await db.receipt.create({
          data: {
            receiptNumber,
            studentId: donation.studentId,
            donationId: donation.id,
            amount: donation.amount
          }
        })
        receiptGenerated = true
      }

      // Try sending email if we generated a receipt
      if (receiptGenerated && receipt) {
        const student = await db.student.findUnique({ where: { id: donation.studentId }})
        if (student && student.email) {
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
            mobileNumber: student.mobileNumber || undefined,
            email: student.email || undefined,
            batch: student.batch || undefined,
            studentClass: student.class || undefined,
            pendingDues,
            advanceBalance,
          }
          
          try {
            // @ts-expect-error -- react-pdf renderToBuffer typing
            const pdfBuffer = await renderToBuffer(React.createElement(ReceiptPDF, pdfData))
            await sendReceiptEmail(student.email, student.fullName, donation.amount, periodCovered, pdfBuffer)
          } catch (e) {
            console.error("Failed to generate or send receipt:", e)
          }
        }

        // Log Activity only if it was newly verified (or newly generated a receipt)
        await logActivity({
          userId: session.user.id,
          action: existingDonation.status === "PAID" ? "RECEIPT_REGENERATED" : "DONATION_VERIFIED",
          entityType: "DONATION",
          entityId: donation.id,
          details: existingDonation.status === "PAID" 
            ? `Regenerated missing receipt for already verified ₹${donation.amount} UPI donation`
            : `Verified ₹${donation.amount} UPI donation and generated receipt`
        })
      }

      return NextResponse.json(donation)
    }

    return new NextResponse("Invalid action", { status: 400 })
  } catch (error) {
    console.error("[DONATIONS_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session.user as any).role
    if (userRole !== "MASTER_ADMIN") {
      return new NextResponse("Only Master Admin can delete payments", { status: 403 })
    }

    const { id } = await req.json()
    if (!id) return new NextResponse("Missing donation ID", { status: 400 })

    // Soft delete
    const donation = await db.donation.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    await logActivity({
      userId: session.user.id,
      action: "DONATION_DELETED",
      entityType: "DONATION",
      entityId: id,
      details: `Moved ₹${donation.amount} donation to recycle bin (was ${donation.status})`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DONATIONS_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

