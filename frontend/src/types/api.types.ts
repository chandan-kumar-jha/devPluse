import type  {UserProfile} from './user.types'

// Generic wrapper for all your API responses
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Specific payload for updating the profile (matches your Zod schema)
export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  bio?: string | null;
  currentRole?: string | null;
  githubUsername?: string | null;
  timezone?: string;
  avatarUrl?: string | null;
}
// types/api.types.ts

export type LogoutResponse = {
  success: boolean
  message: string
}

// Response types for Profile and Avatar
export type ProfileResponse = ApiResponse<{ user: UserProfile }>;
export type AvatarResponse = ApiResponse<{ avatarUrl: string }>;