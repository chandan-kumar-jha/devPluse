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

// ── Email header with logo ─────────────────────────────────────────
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
        vertical-align: middle;
        margin-right: 8px;
      ">⚡</span>
      <span style="
        color: white;
        font-size: 22px;
        font-weight: 700;
        font-family: Arial, sans-serif;
        vertical-align: middle;
        letter-spacing: -0.5px;
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

// ── Send OTP email ─────────────────────────────────────────────────
export const sendOTPEmail = async (
  toEmail: string,
  name: string,
  otp: string
): Promise<EmailResult> => {
  try {
    await transporter.sendMail({
      from: `"DevPulse" <${env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Your DevPulse verification code',
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
            <h2 style="color: #1a1a1a; margin: 0 0 8px;">Verify your email</h2>
            <p style="color: #666; margin: 0 0 24px;">Hi ${name},</p>
            <p style="color: #444; margin: 0 0 8px;">Your verification code is:</p>

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
              margin: 16px 0 24px;
            ">${otp}</div>

            <div style="
              background: #fffbeb;
              border-left: 4px solid #f59e0b;
              padding: 12px 16px;
              border-radius: 0 8px 8px 0;
              margin-bottom: 24px;
            ">
              <p style="color: #92400e; font-size: 13px; margin: 0;">
                ⏱ This code expires in <strong>10 minutes</strong>.
                Do not share it with anyone.
              </p>
            </div>

            <p style="color: #888; font-size: 13px; margin: 0;">
              If you did not create a DevPulse account, you can safely ignore this email.
            </p>
          </div>

          ${emailFooter}
        </div>
      `,
    })
    return { success: true }
  } catch (error: any) {
    console.error('❌ sendOTPEmail failed:', error?.message)
    return { success: false, error: error?.message }
  }
}

// ── Send password reset email ──────────────────────────────────────
export const sendPasswordResetEmail = async (
  toEmail: string,
  name: string,
  otp: string
): Promise<EmailResult> => {
  try {
    await transporter.sendMail({
      from: `"DevPulse" <${env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Reset your DevPulse password',
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
            <h2 style="color: #1a1a1a; margin: 0 0 8px;">Reset your password</h2>
            <p style="color: #666; margin: 0 0 24px;">Hi ${name},</p>
            <p style="color: #444; margin: 0 0 8px;">Your password reset code is:</p>

            <div style="
              font-size: 38px;
              font-weight: 700;
              letter-spacing: 10px;
              color: #e04747;
              padding: 20px;
              background: #fff4f4;
              border: 2px dashed #fca5a5;
              border-radius: 10px;
              text-align: center;
              margin: 16px 0 24px;
            ">${otp}</div>

            <div style="
              background: #fffbeb;
              border-left: 4px solid #f59e0b;
              padding: 12px 16px;
              border-radius: 0 8px 8px 0;
              margin-bottom: 24px;
            ">
              <p style="color: #92400e; font-size: 13px; margin: 0;">
                ⏱ This code expires in <strong>10 minutes</strong>.
                Do not share it with anyone.
              </p>
            </div>

            <p style="color: #888; font-size: 13px; margin: 0;">
              If you did not request a password reset, please secure your account immediately.
            </p>
          </div>

          ${emailFooter}
        </div>
      `,
    })
    return { success: true }
  } catch (error: any) {
    console.error('❌ sendPasswordResetEmail failed:', error?.message)
    return { success: false, error: error?.message }
  }
}

// ── Send security alert email ──────────────────────────────────────
export const sendSecurityAlertEmail = async (
  toEmail: string,
  name: string
): Promise<EmailResult> => {
  try {
    await transporter.sendMail({
      from: `"DevPulse" <${env.EMAIL_USER}>`,
      to: toEmail,
      subject: '⚠️ Security alert on your DevPulse account',
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
            <div style="
              background: #fff4f4;
              border: 1px solid #fca5a5;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 24px;
              text-align: center;
            ">
              <p style="font-size: 28px; margin: 0;">🚨</p>
              <h2 style="color: #e04747; margin: 8px 0 0;">Security Alert</h2>
            </div>

            <p style="color: #666; margin: 0 0 16px;">Hi ${name},</p>
            <p style="color: #444; margin: 0 0 16px;">
              We detected suspicious activity on your account.
              Someone may have attempted to reuse an old session token.
            </p>

            <div style="
              background: #fef2f2;
              border-left: 4px solid #e04747;
              padding: 12px 16px;
              border-radius: 0 8px 8px 0;
              margin-bottom: 24px;
            ">
              <p style="color: #7f1d1d; font-size: 13px; margin: 0;">
                🔒 As a precaution, <strong>all active sessions have been logged out</strong>.
              </p>
            </div>

            <p style="color: #444; margin: 0 0 8px;">What to do next:</p>
            <ul style="color: #666; font-size: 13px; padding-left: 20px; margin: 0 0 24px;">
              <li style="margin-bottom: 6px;">Log in again from a trusted device</li>
              <li style="margin-bottom: 6px;">Change your password immediately</li>
              <li>If you did not cause this, contact support</li>
            </ul>

            <p style="color: #888; font-size: 12px; margin: 0;">
              If this was you, you can safely ignore this email.
            </p>
          </div>

          ${emailFooter}
        </div>
      `,
    })
    return { success: true }
  } catch (error: any) {
    console.error('❌ sendSecurityAlertEmail failed:', error?.message)
    return { success: false, error: error?.message }
  }
}