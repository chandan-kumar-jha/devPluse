import { api } from './axios';

export const registerApi = async (data: any) => {
  return await api.post('/auth/register', data); // ✅ return full AxiosResponse
};

export const verifyOTPApi = async (data: { email: string; otp: string }) => {
  return await api.post('/auth/verify-otp', data); // ✅
};

export const resendOTPApi = async (email: string) => {
  return await api.post('/auth/resend-otp', { email }); // ✅
};

export const logoutApi = async () => {
  return await api.post('/auth/logout'); // ✅
};