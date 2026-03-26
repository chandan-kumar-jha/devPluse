import { motion } from 'motion/react'
import { Terminal, ArrowRight, Eye, EyeOff, Mail, ShieldCheck, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { loginApi } from '../api/auth.api'

// ── Zod schema ─────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const Login = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  // ── React Hook Form ────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // ── Login mutation ─────────────────────────────────────────────────
  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: () => {
      navigate('/dashboard')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      console.error(error?.response?.data?.message)
    },
  })

  // ── Submit ─────────────────────────────────────────────────────────
  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data)
  }

  // ── Get error message ──────────────────────────────────────────────
  const getErrorMessage = () => {
    const message = (loginMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message
    if (!message) return 'Login failed. Please try again.'
    // account locked
    if (message.includes('locked')) return message
    // generic invalid credentials
    return 'Invalid email or password.'
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center items-center gap-2 mb-8 group">
          <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center group-hover:bg-indigo-400 transition-colors">
            <Terminal className="text-white h-6 w-6" />
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">DevPulse</span>
        </Link>
        <h2 className="text-center text-3xl font-bold text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign up free
          </Link>
        </p>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-zinc-900/50 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-zinc-800/50">

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>

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
                  autoComplete="email"
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-zinc-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldCheck className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-zinc-700 rounded-lg bg-zinc-900/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* API error */}
            {loginMutation.isError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400">{getErrorMessage()}</p>
              </div>
            )}

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loginMutation.isPending}
              type="submit"
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

        </div>
      </motion.div>
    </div>
  )
}