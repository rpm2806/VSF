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
