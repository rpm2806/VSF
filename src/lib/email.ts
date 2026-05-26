import nodemailer from "nodemailer"

// Create reusable transporter object using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendReceiptEmail(
  to: string,
  studentName: string,
  amount: number,
  period: string,
  pdfBuffer: Buffer
) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials missing. Email was not sent, but PDF was generated.")
    return false
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Vriksh Students Federation" <${process.env.SMTP_USER}>`,
      to,
      subject: "Your Vriksh Students Federation Payment Receipt",
      text: `Dear ${studentName},\n\nThank you for your contribution of ₹${amount} for ${period}. Please find your official receipt attached.\n\nBest regards,\nVriksh Students Federation`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #059669; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Payment Received</h1>
          </div>
          <div style="padding: 20px;">
            <p>Dear <strong>${studentName}</strong>,</p>
            <p>Thank you for your generous contribution to the Vriksh Students Federation.</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">Amount:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; text-align: right;">₹${amount}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">Period Covered:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; text-align: right;">${period}</td>
              </tr>
            </table>
            <p>Your official receipt is attached to this email as a PDF document.</p>
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Best regards,<br>Vriksh Students Federation</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `VSF-Receipt-${studentName.replace(/\s+/g, '-')}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf"
        }
      ]
    })
    
    console.log("Message sent: %s", info.messageId)
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

export async function sendApprovalEmail(
  to: string,
  studentName: string,
  federationId: string
) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials missing. Approval email was not sent.")
    return false
  }

  try {
    const loginUrl = `${process.env.NEXTAUTH_URL || "https://vriksh-sf.vercel.app"}/login`
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Vriksh Students Federation" <${process.env.SMTP_USER}>`,
      to,
      subject: "Welcome to Vriksh Students Federation! Your Profile is Approved",
      text: `Dear ${studentName},\n\nCongratulations! Your registration with Vriksh Students Federation has been approved by the administration.\n\nYour Federation ID: ${federationId}\n\nYou can now log into your dashboard using your registered Mobile Number or Email and Password.\n\nLog in here: ${loginUrl}\n\nBest regards,\nVriksh Students Federation`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #047857; padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 0.5px;">PROFILE APPROVED</h1>
          </div>
          <div style="padding: 30px 24px; background-color: #ffffff;">
            <p style="font-size: 16px; color: #1f2937; margin-bottom: 20px;">Dear <strong>${studentName}</strong>,</p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
              Congratulations! Your registration with the <strong>Vriksh Students Federation</strong> has been successfully reviewed and approved by the administration. Welcome to our federation!
            </p>
            
            <div style="background-color: #f0fdf4; border-left: 4px solid #047857; padding: 20px; border-radius: 6px; margin-bottom: 28px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #065f46; font-weight: bold;">YOUR LOGIN CREDENTIALS</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; font-size: 14px; color: #047857;">Federation ID:</td>
                  <td style="padding: 4px 0; font-weight: bold; font-size: 14px; color: #111827; font-family: monospace;">${federationId}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${loginUrl}" style="background-color: #047857; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(4, 120, 87, 0.2); transition: all 0.2s;">
                Log In to VSF Portal
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; line-height: 1.5; margin-bottom: 0;">
              Best regards,<br>
              <strong>Vriksh Students Federation</strong>
            </p>
          </div>
        </div>
      `,
    })

    console.log("Approval email sent to %s: %s", to, info.messageId)
    return true
  } catch (error) {
    console.error("Error sending approval email:", error)
    return false
  }
}
