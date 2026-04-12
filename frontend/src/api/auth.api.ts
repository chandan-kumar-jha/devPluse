import { api } from "./axios";
import type { LogoutResponse } from "../types/api.types";

export const sendOTPApi = async (data: { email: string }) => {
  return await api.post("/auth/send-otp", data);
};

export const verifyOTPApi = async (data: { email: string; otp: string }) => {
  return await api.post("/auth/verify-otp", data);
};

export const resendOTPApi = async (email: string) => {
  return await api.post("/auth/resend-otp", { email });
};



export const logoutApi = async (): Promise<LogoutResponse> => {
  const res = await api.post("/auth/logout")
  return res.data   // ✅ IMPORTANT
}


export const completeProfileApi = async (data: {
  name: string
  username: string
}) => {
  return await api.post("/auth/complete-profile", data)
}