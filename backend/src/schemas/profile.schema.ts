import { z } from 'zod'

// ── Update profile ─────────────────────────────────────────────────
export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .optional(),

  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .toLowerCase()
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers and underscores'
    )
    .optional(),

  bio: z
    .string()
    .trim()
    .max(160, 'Bio must be at most 160 characters')
    .optional()
    .nullable(),

  currentRole: z
    .string()
    .trim()
    .max(80, 'Role must be at most 80 characters')
    .optional()
    .nullable(),

  githubUsername: z
    .string()
    .trim()
    .max(39, 'GitHub username must be at most 39 characters')
    .regex(
      /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/,
      'Invalid GitHub username format'
    )
    .optional()
    .nullable(),

  timezone: z
    .string()
    .min(1, 'Timezone is required')
    .optional(),

  avatarUrl: z
    .string()
    .url('Avatar URL must be a valid URL')
    .startsWith('https', 'Avatar URL must use HTTPS')
    .optional()
    .nullable(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// ── Delete account ─────────────────────────────────────────────────
export const deleteAccountSchema = z.object({
  username: z
    .string({ error: 'Username is required' })
    .min(1, 'Username is required'),
})

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>