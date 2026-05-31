const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

// 1. Manually parse .env file as a fallback to support all Node versions
function loadEnv() {
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
}

async function run() {
  loadEnv();

  const toEmail = "rupamkr2040@gmail.com";
  let isEthereal = false;
  let transporter;

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.log("----------------------------------------------------------------");
    console.log("⚠️ No SMTP credentials found in your local .env file.");
    console.log("🔄 Generating a TEMPORARY Ethereal SMTP test account for you...");
    console.log("----------------------------------------------------------------");
    
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    isEthereal = true;
    process.env.SMTP_USER = testAccount.user;
  } else {
    console.log("----------------------------------------------------------------");
    console.log(`🚀 Using SMTP account: ${smtpUser}`);
    console.log("----------------------------------------------------------------");
    
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  const studentName = "RUPAM KUMAR";
  const federationId = "VSF202688992";
  const loginUrl = `${process.env.NEXTAUTH_URL || "https://vriksh-sf.vercel.app"}/login`;

  const mailOptions = {
    from: process.env.SMTP_FROM || `"Vriksh Students Federation" <${process.env.SMTP_USER}>`,
    to: toEmail,
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
                <td style="padding: 4px 0; font-size: 14px; color: #047857; width: 120px;">Federation ID:</td>
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
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Success! Email processed for: ${toEmail}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    
    if (isEthereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("\n🔗 VIEW EMAIL PREVIEW:");
      console.log(`👉 ${previewUrl}`);
      console.log("\n💡 Note: To send a real email directly to your Gmail inbox, open the '.env' file in the root directory and add your real SMTP_USER and SMTP_PASS variables, then run this script again.");
    } else {
      console.log("\n🚀 Real email has been dispatched to your Gmail inbox!");
    }
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
}

run();
