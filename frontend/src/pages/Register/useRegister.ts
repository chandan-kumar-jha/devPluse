import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { AxiosError, type AxiosResponse } from "axios";

import { sendOTPApi, verifyOTPApi, resendOTPApi } from "../../api/auth.api";
import { emailSchema, type EmailFormData } from "../../schema/auth.schema";
import { useAuthStore } from "../../store/useAuthStore";

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: any;
    isNewUser?: boolean;
  };
}

interface ApiError {
  message: string;
}

export const useRegister = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const [step, setStep] = useState<1 | 2>(1);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: number;
    if (resendCooldown > 0) {
      interval = window.setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  // SEND OTP
  const sendOtpMutation: UseMutationResult<
    AxiosResponse<AuthResponse>,
    AxiosError<ApiError>,
    EmailFormData
  > = useMutation({
    mutationFn: sendOTPApi,
    onSuccess: (_, variables) => {
      setRegisteredEmail(variables.email);
      setStep(2);
    },
  });

  // VERIFY OTP
  const verifyMutation: UseMutationResult<
    AxiosResponse<AuthResponse>,
    AxiosError<ApiError>,
    { email: string; otp: string }
  > = useMutation({
    mutationFn: verifyOTPApi,
    onSuccess: (response) => {
      const user = response.data?.data?.user;
      const isNewUser = response.data?.data?.isNewUser;

      if (user) setUser(user);

      if (isNewUser) {
        navigate("/complete-profile");
      } else {
        navigate("/dashboard");
      }
    },
    onError: (error) => {
      setOtpError(error.response?.data?.message || "Invalid OTP");
    },
  });

  // RESEND OTP
  const resendMutation: UseMutationResult<
    AxiosResponse<AuthResponse>,
    AxiosError<ApiError>,
    string
  > = useMutation({
    mutationFn: resendOTPApi,
    onSuccess: () => {
      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    },
  });

  const onRegisterSubmit = (data: EmailFormData) => {
    sendOtpMutation.mutate(data);
  };

  const handleResend = () => {
    if (!registeredEmail) return;
    resendMutation.mutate(registeredEmail);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");

    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length < 6) {
      setOtpError("Enter all digits");
      return;
    }

    verifyMutation.mutate({
      email: registeredEmail,
      otp: otpValue,
    });
  };

  return {
    step,
    setStep,
    registeredEmail,
    otp,
    otpError,
    resendCooldown,
    inputRefs,
    form,
    sendOtpMutation,
    verifyMutation,
    resendMutation,
    onRegisterSubmit,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    handleVerifySubmit,
    handleResend,
  };
};