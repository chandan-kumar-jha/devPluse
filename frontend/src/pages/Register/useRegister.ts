import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation,type  UseMutationResult } from '@tanstack/react-query'
import { AxiosError, type AxiosResponse } from 'axios'
import { registerApi, verifyOTPApi, resendOTPApi } from '../../api/auth.api'
import { registerSchema, type RegisterFormData } from '../../schema/auth.schema'
import { useAuthStore } from '../../store/useAuthStore'

// 1. Define the Shape of your Backend Response
export interface AuthResponse {
  message: string;
  success: boolean;
  user?: {
    id: string;
    email: string;
    username: string;
    name: string;
  };
}

// 2. Define the Error Shape
interface ApiError {
  message: string;
}

export const useRegister = () => {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  
  const [step, setStep] = useState<1 | 2>(1)
  const [registeredEmail, setRegisteredEmail] = useState<string>('')
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState<string>('')
  const [resendCooldown, setResendCooldown] = useState<number>(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    let interval: number;
    if (resendCooldown > 0) {
      interval = window.setInterval(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendCooldown])

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  /**
   * Mutation Types: <ResponseData, ErrorData, VariablesData>
   */
  
  // Register Mutation
  const registerMutation: UseMutationResult<
    AxiosResponse<AuthResponse>, 
    AxiosError<ApiError>, 
    RegisterFormData
  > = useMutation({
    mutationFn: registerApi,
    onSuccess: (_, variables) => {
      setRegisteredEmail(variables.email)
      setStep(2)
    },
  })

  // Verify OTP Mutation
  const verifyMutation: UseMutationResult<
    AxiosResponse<AuthResponse>, 
    AxiosError<ApiError>, 
    { email: string; otp: string }
  > = useMutation({
    mutationFn: verifyOTPApi,
    onSuccess: (response) => {
      const userData = response.data?.user
      if (userData) setUser(userData)
      navigate('/dashboard')
    },
    onError: (error) => {
      setOtpError(error.response?.data?.message || 'Invalid OTP')
    },
  })

  // Resend OTP Mutation
  const resendMutation: UseMutationResult<
    AxiosResponse<AuthResponse>, 
    AxiosError<ApiError>, 
    string
  > = useMutation({
    mutationFn: resendOTPApi,
    onSuccess: () => {
      setResendCooldown(60)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    },
  })

  const onRegisterSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1)
    if (value && !/^\d$/.test(value)) return 
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setOtpError('')
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const otpValue = otp.join('')
    if (otpValue.length < 6) {
      setOtpError('Please enter all 6 digits')
      return
    }
    verifyMutation.mutate({ email: registeredEmail, otp: otpValue })
  }

  return {
    step, setStep, registeredEmail, otp, otpError, resendCooldown, inputRefs, form,
    registerMutation, verifyMutation, resendMutation,
    onRegisterSubmit, handleOtpChange, handleOtpKeyDown, handleOtpPaste, handleVerifySubmit
  }
}