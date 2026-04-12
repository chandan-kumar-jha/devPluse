import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { profileAPI } from "../api/profile.api";
import toast from "react-hot-toast";

// Types
import type { UserProfile } from "../types/user.types";
import type { UpdateProfilePayload } from "../types/api.types";
import type { ProfileState } from "../types/store.types";

// ── Helper ────────────────────────────────────────────────────────
const errMsg = (err: unknown, fallback: string) =>
  (err as any)?.response?.data?.message ??
  (err instanceof Error ? err.message : fallback);

// ── Store ─────────────────────────────────────────────────────────
export const useProfileStore = create<ProfileState>()(
  devtools(
    (set, get) => ({
      profile: null,
      loading: false,
      saving: false,
      uploadingAvatar: false,
      deletingAccount: false,
      error: null,
      successMessage: null,

      // 🔥 IMPORTANT FIX (used in logout)
      resetProfile: () => set({ profile: null }),

      // ── Load Profile ────────────────────────────────────────────
      loadProfile: async () => {
        set({ loading: true, error: null });

        try {
          const res = await profileAPI.getMe();

          set({
            profile: res.data.data.user,
            loading: false,
          });
        } catch (err) {
          const message = errMsg(err, "Failed to load profile");

          set({
            error: message,
            loading: false,
          });

          toast.error(message);
        }
      },

      // ── Update Profile ──────────────────────────────────────────
      updateProfile: async (data: UpdateProfilePayload) => {
        const allowedFields: (keyof UpdateProfilePayload)[] = [
          "name",
          "username",
          "bio",
          "currentRole",
          "githubUsername",
          "timezone",
          "avatarUrl",
        ];

        const cleaned: any = {};

        allowedFields.forEach((key) => {
          const value = data[key];

          if (value === undefined) return;

          if (value === "" || value === null) {
            if (
              ["bio", "currentRole", "githubUsername", "avatarUrl"].includes(
                key
              )
            ) {
              cleaned[key] = null;
            }
          } else {
            cleaned[key] = value;
          }
        });

        const prevProfile = get().profile;

        // ✅ Optimistic update
        if (prevProfile) {
          set({
            profile: { ...prevProfile, ...cleaned } as UserProfile,
          });
        }

        set({ saving: true, error: null, successMessage: null });

        try {
          const res = await profileAPI.updateMe(cleaned);
          const updatedUser = res.data.data.user;

          set({
            profile: updatedUser,
            saving: false,
            successMessage: "Profile updated successfully!",
          });

          toast.success("Profile updated successfully!");
        } catch (err: any) {
          const errorMsg =
            err.response?.data?.errors?.[0]?.message ||
            errMsg(err, "Update failed");

          // ❌ rollback
          set({
            profile: prevProfile,
            saving: false,
            error: errorMsg,
          });

          toast.error(errorMsg);
        }
      },

      // ── Avatar Upload ───────────────────────────────────────────
      uploadAvatar: async (file: File) => {
        set({
          uploadingAvatar: true,
          error: null,
          successMessage: null,
        });

        try {
          const formData = new FormData();
          formData.append("avatar", file);

          const res = await profileAPI.uploadAvatar(formData);
          const avatarUrl = res.data.data.avatarUrl;

          set((s) => ({
            profile: s.profile
              ? { ...s.profile, avatarUrl }
              : s.profile,
            uploadingAvatar: false,
            successMessage: "Avatar updated successfully!",
          }));

          toast.success("Avatar uploaded!");
        } catch (err) {
          const message = errMsg(err, "Failed to upload avatar");

          set({
            uploadingAvatar: false,
            error: message,
          });

          toast.error(message);
        }
      },

      // ── Delete Account ──────────────────────────────────────────
      deleteAccount: async (username: string) => {
        set({ deletingAccount: true, error: null });

        try {
          await profileAPI.deleteAccount(username);

          set({
            profile: null,
            deletingAccount: false,
          });

          toast.success("Account deleted.");
        } catch (err) {
          const message = errMsg(err, "Failed to delete account");

          set({
            deletingAccount: false,
            error: message,
          });

          toast.error(message);
          throw err;
        }
      },

      // ── Clear Messages ──────────────────────────────────────────
      clearMessages: () =>
        set({
          error: null,
          successMessage: null,
        }),
    }),
    { name: "ProfileStore" }
  )
);