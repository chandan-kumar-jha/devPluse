import { Terminal } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { Link } from 'react-router'
import { useRegister } from './useRegister'
import { RegisterForm } from './RegisterForm'
import { OtpVerify } from './OtpVerify'

export const Register = () => {
  const {
    step, setStep, registeredEmail, otp, otpError, resendCooldown,
    inputRefs, form, registerMutation, verifyMutation, resendMutation,
    onRegisterSubmit, handleOtpChange, handleOtpKeyDown, handleOtpPaste, handleVerifySubmit
  } = useRegister()

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-indigo-500/30">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center items-center gap-2 mb-8 group">
          <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center group-hover:bg-indigo-400 transition-colors">
            <Terminal className="text-white h-6 w-6" />
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">DevPulse</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-zinc-900/50 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-zinc-800/50 overflow-hidden relative min-h-125">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <RegisterForm 
                form={form} 
                onSubmit={onRegisterSubmit} 
                mutation={registerMutation} 
              />
            ) : (
              <OtpVerify 
                email={registeredEmail}
                otp={otp}
                otpError={otpError}
                resendCooldown={resendCooldown}
                inputRefs={inputRefs}
                onBack={() => setStep(1)}
                onOtpChange={handleOtpChange}
                onOtpKeyDown={handleOtpKeyDown}
                onOtpPaste={handleOtpPaste}
                onSubmit={handleVerifySubmit}
                onResend={() => resendMutation.mutate(registeredEmail)}
                verifyMutation={verifyMutation}
                resendMutation={resendMutation}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}