import nodemailer from 'nodemailer'
import { env } from '../config/env'

// ── Transporter ────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
})

// ── Email header ───────────────────────────────────────────────────
const emailHeader = `
  <div style="
    background: linear-gradient(135deg, #5c47e0 0%, #7c3aed 100%);
    padding: 24px 32px;
    border-radius: 12px 12px 0 0;
    text-align: center;
  ">
    <div style="display: inline-block;">
      <span style="
        display: inline-block;
        width: 36px;
        height: 36px;
        background: white;
        border-radius: 8px;
        font-size: 22px;
        line-height: 36px;
        text-align: center;
        margin-right: 8px;
      ">⚡</span>
      <span style="
        color: white;
        font-size: 22px;
        font-weight: 700;
        font-family: Arial, sans-serif;
      ">DevPulse</span>
    </div>
    <p style="
      color: rgba(255,255,255,0.75);
      font-size: 12px;
      margin: 6px 0 0;
      font-family: Arial, sans-serif;
    ">Developer Productivity Tracker</p>
  </div>
`

// ── Email footer ───────────────────────────────────────────────────
const emailFooter = `
  <div style="
    border-top: 1px solid #eee;
    padding: 16px 32px;
    text-align: center;
    background: #fafafa;
    border-radius: 0 0 12px 12px;
  ">
    <p style="color: #999; font-size: 11px; margin: 0;">
      © 2026 DevPulse · Developer Productivity Tracker
    </p>
    <p style="color: #bbb; font-size: 10px; margin: 4px 0 0;">
      This is an automated email. Please do not reply.
    </p>
  </div>
`

// ── Types ──────────────────────────────────────────────────────────
interface EmailResult {
  success: boolean
  error?: string
}

// ── SEND OTP EMAIL (UPDATED 🔥) ─────────────────────────────────────
export const sendOTPEmail = async (
  toEmail: string,
  name: string,
  otp: string
): Promise<EmailResult> => {
  try {
    await transporter.sendMail({
      from: `"DevPulse" <${env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Your DevPulse login code",
      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 480px;
          margin: 0 auto;
          border: 1px solid #eee;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        ">
          ${emailHeader}

          <div style="padding: 32px;">
            <h2 style="color: #1a1a1a; margin: 0 0 8px;">
              Your DevPulse login code
            </h2>

            <p style="color: #666; margin: 0 0 20px;">
              Hi ${name || "Developer"},
            </p>

            <p style="color: #444; margin: 0 0 16px;">
              Use the code below to continue signing in to your DevPulse account.
            </p>

            <div style="
              font-size: 38px;
              font-weight: 700;
              letter-spacing: 10px;
              color: #5c47e0;
              padding: 20px;
              background: #f4f2ff;
              border: 2px dashed #c4b5fd;
              border-radius: 10px;
              text-align: center;
              margin: 20px 0 24px;
            ">
              ${otp}
            </div>

            <div style="
              background: #eef2ff;
              border-left: 4px solid #6366f1;
              padding: 12px 16px;
              border-radius: 0 8px 8px 0;
              margin-bottom: 20px;
            ">
              <p style="color: #3730a3; font-size: 13px; margin: 0;">
                🔐 This code is valid for <strong>10 minutes</strong>.
              </p>
            </div>

            <p style="color: #666; font-size: 13px; margin: 0 0 8px;">
              If you didn’t request this, you can safely ignore this email.
            </p>

            <p style="color: #999; font-size: 12px; margin: 0;">
              — DevPulse Team
            </p>
          </div>

          ${emailFooter}
        </div>
      `,
    })

    return { success: true }
  } catch (error: any) {
    console.error("❌ sendOTPEmail failed:", error?.message)

    // 🔥 DEV FALLBACK (IMPORTANT)
    console.log(`📩 OTP for ${toEmail}: ${otp}`)

    return { success: false, error: error?.message }
  }
}

// ── PASSWORD RESET EMAIL ───────────────────────────────────────────
export const sendPasswordResetEmail = async (
  toEmail: string,
  name: string,
  otp: string
): Promise<EmailResult> => {
  try {
    await transporter.sendMail({
      from: `"DevPulse" <${env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Reset your DevPulse password",
      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 480px;
          margin: 0 auto;
          border: 1px solid #eee;
          border-radius: 12px;
          overflow: hidden;
        ">
          ${emailHeader}

          <div style="padding: 32px;">
            <h2>Reset your password</h2>
            <p>Hi ${name || "Developer"},</p>

            <p>Your reset code:</p>

            <div style="
              font-size: 36px;
              font-weight: bold;
              text-align: center;
              margin: 20px 0;
              color: #e04747;
            ">
              ${otp}
            </div>

            <p>This expires in 10 minutes.</p>
          </div>

          ${emailFooter}
        </div>
      `,
    })

    return { success: true }
  } catch (error: any) {
    console.error("❌ sendPasswordResetEmail failed:", error?.message)
    return { success: false, error: error?.message }
  }
}