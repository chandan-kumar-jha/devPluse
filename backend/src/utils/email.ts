import nodemailer from 'nodemailer'

// ── Validate env (fail fast) ─────────────────────────────
if (!process.env.BREVO_USER || !process.env.BREVO_PASS) {
  throw new Error("❌ Missing BREVO SMTP credentials")
}

// ── Transporter (singleton) ─────────────────────────────
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
})

// ── Email Template ──────────────────────────────────────
const getOTPTemplate = (name: string, otp: string) => `
  <div style="
    font-family: Arial, sans-serif;
    max-width: 480px;
    margin: 0 auto;
    border: 1px solid #eee;
    border-radius: 12px;
    overflow: hidden;
  ">
    <div style="
      background: linear-gradient(135deg, #5c47e0, #7c3aed);
      padding: 20px;
      text-align: center;
      color: white;
      font-weight: bold;
      font-size: 18px;
    ">
      ⚡ DevPulse
    </div>

    <div style="padding: 24px;">
      <p>Hi ${name || "Developer"},</p>

      <p>Your login code:</p>

      <div style="
        font-size: 32px;
        font-weight: bold;
        text-align: center;
        margin: 20px 0;
        letter-spacing: 6px;
        color: #5c47e0;
      ">
        ${otp}
      </div>

      <p style="font-size: 13px; color: #666;">
        This code expires in <strong>10 minutes</strong>.
      </p>

      <p style="font-size: 12px; color: #999;">
        If you didn’t request this, ignore this email.
      </p>
    </div>
  </div>
`

// ── Send OTP Email ──────────────────────────────────────
export const sendOTPEmail = async (
  toEmail: string,
  name: string,
  otp: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const info = await transporter.sendMail({
     from: `"DevPulse" <projectman884@gmail.com>`, // ✅ your real email,
      to: toEmail,
      subject: "Your DevPulse login code",
      html: getOTPTemplate(name, otp),
    })

    console.log("📨 Email sent:", info.messageId)

    return { success: true }
  } catch (error: any) {
    console.error("❌ Email failed:", error?.message)

    // 🔥 fallback (critical for debugging)
    console.log(`📩 OTP for ${toEmail}: ${otp}`)

    return {
      success: false,
      error: error?.message,
    }
  }
}