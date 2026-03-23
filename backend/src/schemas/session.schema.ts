import { z } from 'zod'

// ── Create session ─────────────────────────────────────────────────
export const createSessionSchema = z.object({
  title: z
    .string({ error: 'Title is required' })
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Title must be at most 120 characters'),

  duration: z
    .number({ error: 'Duration is required' })
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1 minute')
    .max(1440, 'Duration cannot exceed 1440 minutes (24 hours)'),

  date: z
    .string({ error: 'Date is required' })
    .refine(
      (val) => !isNaN(Date.parse(val)),
      'Invalid date format'
    )
    .refine(
      (val) => new Date(val) <= new Date(),
      'Date cannot be in the future'
    ),

  notes: z
    .string()
    .trim()
    .max(2000, 'Notes must be at most 2000 characters')
    .optional()
    .nullable(),

  tags: z
    .array(z.string().trim().max(30, 'Tag must be at most 30 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),

  goalId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, 'Invalid goal ID')
    .optional()
    .nullable(),

  skillId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, 'Invalid skill ID')
    .optional()
    .nullable(),
})

export type CreateSessionInput = z.infer<typeof createSessionSchema>

// ── Update session ─────────────────────────────────────────────────
export const updateSessionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Title must be at most 120 characters')
    .optional(),

  duration: z
    .number()
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1 minute')
    .max(1440, 'Duration cannot exceed 1440 minutes')
    .optional(),

  date: z
    .string()
    .refine(
      (val) => !isNaN(Date.parse(val)),
      'Invalid date format'
    )
    .refine(
      (val) => new Date(val) <= new Date(),
      'Date cannot be in the future'
    )
    .optional(),

  notes: z
    .string()
    .trim()
    .max(2000, 'Notes must be at most 2000 characters')
    .optional()
    .nullable(),

  tags: z
    .array(z.string().trim().max(30, 'Tag must be at most 30 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),

  goalId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, 'Invalid goal ID')
    .optional()
    .nullable(),

  skillId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, 'Invalid skill ID')
    .optional()
    .nullable(),
})

export type UpdateSessionInput = z.infer<typeof updateSessionSchema>

// ── List sessions query params ─────────────────────────────────────
export const listSessionsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),

  search: z
    .string()
    .trim()
    .max(100)
    .optional(),

  tag: z
    .string()
    .trim()
    .optional(),

  dateFrom: z
    .string()
    .refine(
      (val) => !isNaN(Date.parse(val)),
      'Invalid dateFrom format'
    )
    .optional(),

  dateTo: z
    .string()
    .refine(
      (val) => !isNaN(Date.parse(val)),
      'Invalid dateTo format'
    )
    .optional(),

  sort: z
    .enum(['newest', 'oldest', 'longest', 'shortest'])
    .optional()
    .default('newest'),
})

export type ListSessionsInput = z.infer<typeof listSessionsSchema>