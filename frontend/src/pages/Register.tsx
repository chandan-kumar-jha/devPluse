import { motion, AnimatePresence } from 'motion/react'
import {
  Terminal, ArrowRight, ArrowLeft,
  ShieldCheck, Mail, Loader2, CheckCircle2, User
} from 'lucide-react'
import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { registerApi, verifyOTPApi, resendOTPApi } from '../api/auth.api'
import { registerSchema, type RegisterFormData } from '../schemas/auth.schema'

export const Register = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // ── React Hook Form ────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  // ── Register mutation ──────────────────────────────────────────────
  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (_, variables) => {
      setRegisteredEmail(variables.email)
      setStep(2)
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error?.response?.data?.message || 'Registration failed'
      console.error(message)
    },
  })

  // ── Verify OTP mutation ────────────────────────────────────────────
  const verifyMutation = useMutation({
    mutationFn: verifyOTPApi,
    onSuccess: () => {
      navigate('/dashboard')
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error?.response?.data?.message || 'Invalid OTP'
      setOtpError(message)
    },
  })

  // ── Resend OTP mutation ────────────────────────────────────────────
  const resendMutation = useMutation({
    mutationFn: resendOTPApi,
    onSuccess: () => {
      // start 60s cooldown
      setResendCooldown(60)
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) { clearInterval(interval); return 0 }
          return prev - 1
        })
      }, 1000)
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error(error?.response?.data?.message)
    },
  })

  // ── Register submit ────────────────────────────────────────────────
  const onRegisterSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data)
  }

  // ── OTP input handlers ─────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1)
    if (value && !/^\d$/.test(value)) return // only digits
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setOtpError('')
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // ── OTP paste handler ──────────────────────────────────────────────
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  // ── Verify submit ──────────────────────────────────────────────────
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const otpValue = otp.join('')
    if (otpValue.length < 6) {
      setOtpError('Please enter all 6 digits')
      return
    }
    verifyMutation.mutate({ email: registeredEmail, otp: otpValue })
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-indigo-500/30">
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
        <div className="bg-zinc-900/50 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-zinc-800/50 overflow-hidden relative min-h-100">

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col justify-center w-full"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white">Create your account</h2>
                  <p className="mt-2 text-sm text-zinc-400">Start tracking your developer journey today</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit(onRegisterSubmit)}>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">
                      Full name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-zinc-500" />
                      </div>
                      <input
                        {...register('name')}
                        type="text"
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-lg bg-zinc-900/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Chandan Kumar"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-zinc-500 text-sm">@</span>
                      </div>
                      <input
                        {...register('username')}
                        type="text"
                        className="appearance-none block w-full pl-8 pr-3 py-2 border border-zinc-700 rounded-lg bg-zinc-900/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="chandan_dev"
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">
                      Email address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-zinc-500" />
                      </div>
                      <input
                        {...register('email')}
                        type="email"
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-lg bg-zinc-900/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="developer@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ShieldCheck className="h-5 w-5 text-zinc-500" />
                      </div>
                      <input
                        {...register('password')}
                        type="password"
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-lg bg-zinc-900/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
                    )}
                  </div>

                  {/* API error */}
                  {registerMutation.isError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-xs text-red-400">
                        {(registerMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed. Please try again.'}
                      </p>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={registerMutation.isPending}
                    type="submit"
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed items-center"
                  >
                    {registerMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </form>

                <p className="mt-6 text-center text-sm text-zinc-400">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
                    Log in
                  </Link>
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col justify-center w-full"
              >
                <button
                  onClick={() => setStep(1)}
                  className="absolute top-6 left-6 text-zinc-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="text-center mb-8 mt-4">
                  <div className="mx-auto h-12 w-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 border border-indigo-500/20">
                    <Mail className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Check your email</h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    We sent a verification code to{' '}
                    <span className="font-medium text-zinc-200">{registeredEmail}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifySubmit} className="space-y-6">
                  <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el }}
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold text-white bg-zinc-900/80 border border-zinc-700 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                      />
                    ))}
                  </div>

                  {/* OTP error */}
                  {otpError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-xs text-red-400 text-center">{otpError}</p>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={verifyMutation.isPending || otp.join('').length < 6}
                    type="submit"
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed items-center"
                  >
                    {verifyMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Verify account
                        <CheckCircle2 className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </form>

                <p className="mt-6 text-center text-sm text-zinc-400">
                  Didn't receive the code?{' '}
                  {resendCooldown > 0 ? (
                    <span className="text-zinc-500">Resend in {resendCooldown}s</span>
                  ) : (
                    <button
                      onClick={() => resendMutation.mutate(registeredEmail)}
                      disabled={resendMutation.isPending}
                      className="font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                    >
                      {resendMutation.isPending ? 'Sending...' : 'Click to resend'}
                    </button>
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}