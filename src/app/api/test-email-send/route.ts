import { NextResponse } from "next/server"
import { sendApprovalEmail } from "@/lib/email"

export async function GET() {
  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS ? "******** (Hidden for Security)" : "MISSING";
    const smtpFrom = process.env.SMTP_FROM;

    console.log("Starting SMTP test send from Vercel server...");

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({
        success: false,
        error: "SMTP credentials are missing from your environment variables.",
        debugInfo: {
          SMTP_HOST: smtpHost || "smtp.gmail.com (default)",
          SMTP_PORT: smtpPort || "587 (default)",
          SMTP_USER: smtpUser || "MISSING",
          SMTP_PASS: smtpPass,
          SMTP_FROM: smtpFrom || "MISSING",
          nodeEnv: process.env.NODE_ENV
        }
      });
    }

    // Try sending the sample email
    const result = await sendApprovalEmail(
      "rupamkr2040@gmail.com",
      "RUPAM KUMAR (Live Test)",
      "VSF26004-TEST"
    );

    if (result) {
      return NextResponse.json({
        success: true,
        message: "Email sent successfully directly from the server!",
        debugInfo: {
          SMTP_HOST: smtpHost || "smtp.gmail.com (default)",
          SMTP_PORT: smtpPort || "587 (default)",
          SMTP_USER: smtpUser,
          SMTP_FROM: smtpFrom
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "Failed to send email. Check server console logs for details.",
        debugInfo: {
          SMTP_HOST: smtpHost || "smtp.gmail.com (default)",
          SMTP_PORT: smtpPort || "587 (default)",
          SMTP_USER: smtpUser,
          SMTP_FROM: smtpFrom
        }
      });
    }
  } catch (error: any) {
    console.error("Test email route error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "An unexpected error occurred during SMTP connection.",
      stack: error.stack,
      debugInfo: {
        SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com (default)",
        SMTP_PORT: process.env.SMTP_PORT || "587 (default)",
        SMTP_USER: process.env.SMTP_USER || "MISSING"
      }
    }, { status: 500 });
  }
}
