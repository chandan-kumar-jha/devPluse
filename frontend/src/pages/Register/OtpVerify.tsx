import { motion } from 'motion/react'
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react'
import type { RefObject } from 'react'
import type { UseMutationResult } from '@tanstack/react-query'
import type { AxiosResponse, AxiosError } from 'axios'
import type { AuthResponse } from './useRegister'

interface Props {
  email: string;
  otp: string[];
  otpError: string;
  resendCooldown: number;
  inputRefs: RefObject<(HTMLInputElement | null)[]>; 
  onBack: () => void;
  onOtpChange: (index: number, value: string) => void;
  onOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onOtpPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onResend: () => void;
  verifyMutation: UseMutationResult<AxiosResponse<AuthResponse>, AxiosError<{message: string}>, { email: string; otp: string }>;
  resendMutation: UseMutationResult<AxiosResponse<AuthResponse>, AxiosError<{message: string}>, string>;
}

export const OtpVerify = ({ 
  email, otp, otpError,  inputRefs, onBack, 
  onOtpChange, onOtpKeyDown, onOtpPaste, onSubmit,  
  verifyMutation,  
}: Props) => {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full">
      <button onClick={onBack} className="mb-4 text-zinc-400"><ArrowLeft /></button>
      <div className="text-center mb-8">
        <Mail className="mx-auto h-12 w-12 text-indigo-400 mb-2" />
        <h2 className="text-white text-xl font-bold">Verify Email</h2>
        <p className="text-zinc-400 text-sm">Sent to {email}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex justify-center gap-2" onPaste={onOtpPaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { if (inputRefs.current) inputRefs.current[index] = el; }}
              className="w-12 h-14 bg-zinc-900 border border-zinc-700 text-center text-white text-xl rounded-lg"
              value={digit}
              onChange={(e) => onOtpChange(index, e.target.value)}
              onKeyDown={(e) => onOtpKeyDown(index, e)}
              maxLength={1}
            />
          ))}
        </div>
        
        {otpError && <p className="text-red-400 text-xs text-center">{otpError}</p>}

        <button disabled={verifyMutation.isPending} className="w-full py-2.5 bg-indigo-600 rounded-lg flex items-center justify-center">
          {verifyMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : <>Verify <CheckCircle2 className="ml-2 h-4 w-4" /></>}
        </button>
      </form>
    </motion.div>
  )
}