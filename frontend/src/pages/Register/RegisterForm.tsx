import { motion } from 'motion/react'
import { User, Mail, ShieldCheck, Loader2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import type { UseFormReturn } from 'react-hook-form'
import type { UseMutationResult } from '@tanstack/react-query'
import type { AxiosResponse, AxiosError } from 'axios'
// Note: Ensure path is correct and name matches exactly in auth.schema.ts
import type { RegisterFormData } from '../../schema/auth.schema'
import type { AuthResponse } from './useRegister'

interface Props {
  form: UseFormReturn<RegisterFormData>;
  onSubmit: (data: RegisterFormData) => void;
  mutation: UseMutationResult<AxiosResponse<AuthResponse>, AxiosError<{message: string}>, RegisterFormData>;
}

export const RegisterForm = ({ form, onSubmit, mutation }: Props) => {
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col justify-center w-full"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white">Create your account</h2>
        <p className="mt-2 text-sm text-zinc-400">Start tracking your developer journey today</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {/* Full Name */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              {...register('name')}
              type="text"
              autoComplete="off"
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-lg bg-zinc-900/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="Enter your name"
            />
          </div>
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>

        {/* Username */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-zinc-500 text-sm font-bold pl-0.5">@</span>
            </div>
            <input
              {...register('username')}
              type="text"
              autoComplete="one-time-code"
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-lg bg-zinc-900/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="Enter username"
            />
          </div>
          {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>}
        </div>

        {/* Email */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              {...register('email')}
              type="email"
              autoComplete="off"
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-lg bg-zinc-900/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="Enter your email"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ShieldCheck className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              {...register('password')}
              type="password"
              autoComplete="new-password"
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-lg bg-zinc-900/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="Enter password"
            />
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
        </div>

        {mutation.isError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-xs text-red-400 font-medium">
              {mutation.error?.response?.data?.message || 'Registration failed'}
            </p>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={mutation.isPending}
          type="submit"
          className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-all disabled:opacity-50 items-center"
        >
          {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
        </motion.button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Log in</Link>
      </p>
    </motion.div>
  )
}