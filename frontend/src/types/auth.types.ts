
export interface ApiResponse {
  message: string;
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}