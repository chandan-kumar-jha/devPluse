import type{ UserProfile } from "./user.types";
import type{ UpdateProfilePayload } from "./api.types";

export interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  saving: boolean;
  uploadingAvatar: boolean;
  deletingAccount: boolean;
  error: string | null;
  successMessage: string | null;

  // Actions
  loadProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfilePayload) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  deleteAccount: (username: string) => Promise<void>;
  clearMessages: () => void;
  resetProfile: () => void
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  logout: () => void;
  setUser: (user: UserProfile | null) => void;
}