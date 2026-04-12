import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendOTPEmail = async (
  toEmail: string,
  name: string,
  otp: string
) => {
  try {
    await resend.emails.send({
      from: 'DevPulse <onboarding@resend.dev>', // ✅ IMPORTANT
      to: toEmail,
      subject: 'Your DevPulse OTP',
      html: `
        <div>
          <h2>Your OTP</h2>
          <h1>${otp}</h1>
          <p>Valid for 10 minutes</p>
        </div>
      `,
    })

    return { success: true }
  } catch (error: any) {
    console.error("❌ Email failed:", error?.message)

    // 🔥 fallback (VERY IMPORTANT)
    console.log(`📩 OTP for ${toEmail}: ${otp}`)

    return { success: false }
  }
}