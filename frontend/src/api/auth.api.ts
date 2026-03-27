import { api } from './axios';

export const registerApi = async (data: any) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const verifyOTPApi = async (data: { email: string; otp: string }) => {
  const response = await api.post('/auth/verify-otp', data);
  return response.data;
};

export const resendOTPApi = async (email: string) => {
  const response = await api.post('/auth/resend-otp', { email });
  return response.data;
};
export const logoutApi = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};