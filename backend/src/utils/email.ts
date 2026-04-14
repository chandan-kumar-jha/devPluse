import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

const getOTPTemplate = (name: string, otp: string) => `
  <div style="font-family: Arial; max-width: 480px; margin:auto;">
    <h2>⚡ DevPulse</h2>
    <p>Hi ${name || "Developer"},</p>

    <p>Your login code:</p>

    <div style="
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 6px;
      margin: 20px 0;
      color: #5c47e0;
    ">
      ${otp}
    </div>

    <p>This expires in 10 minutes.</p>
  </div>
`

export const sendOTPEmail = async (
  toEmail: string,
  name: string,
  otp: string
): Promise<{ success: boolean }> => {
  try {
    const res = await resend.emails.send({
      from: process.env.EMAIL_FROM!, // 🔥 from env
      to: toEmail,
      subject: "Your DevPulse login code",
      html: getOTPTemplate(name, otp),
    })

    console.log("📨 Email sent:", res)

    return { success: true }
  } catch (error: any) {
    console.error("❌ Email failed:", error?.message)

    // 🔥 fallback (VERY IMPORTANT)
    console.log(`🔐 [FALLBACK OTP] ${toEmail}: ${otp}`)

    return { success: false }
  }
}