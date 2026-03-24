import { z } from 'zod'

// ── Milestone schema — reused in create and update ─────────────────
const milestoneSchema = z.object({
  title: z
    .string({ error: 'Milestone title is required' })
    .trim()
    .min(1, 'Milestone title is required')
    .max(120, 'Milestone title must be at most 120 characters'),
  order: z.number().int().min(0).optional().default(0),
})

// ── Create goal ────────────────────────────────────────────────────
export const createGoalSchema = z.object({
  title: z
    .string({ error: 'Title is required' })
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Title must be at most 120 characters'),

  description: z
    .string()
    .trim()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .nullable(),

  deadline: z
    .string()
    .refine(
      (val) => !isNaN(Date.parse(val)),
      'Invalid date format'
    )
    .refine(
      (val) => new Date(val) > new Date(),
      'Deadline must be in the future'
    )
    .optional()
    .nullable(),

  category: z
    .string()
    .trim()
    .max(50, 'Category must be at most 50 characters')
    .optional()
    .nullable(),

  milestones: z
    .array(milestoneSchema)
    .max(20, 'Maximum 20 milestones allowed')
    .optional()
    .default([]),
})

export type CreateGoalInput = z.infer<typeof createGoalSchema>

// ── Update goal ────────────────────────────────────────────────────
export const updateGoalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Title must be at most 120 characters')
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .nullable(),

  deadline: z
    .string()
    .refine(
      (val) => !isNaN(Date.parse(val)),
      'Invalid date format'
    )
    .optional()
    .nullable(),

  category: z
    .string()
    .trim()
    .max(50, 'Category must be at most 50 characters')
    .optional()
    .nullable(),

  status: z
    .enum(['active', 'done', 'archived'])
    .optional(),
})

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>

// ── Add milestone ──────────────────────────────────────────────────
export const addMilestoneSchema = z.object({
  title: z
    .string({ error: 'Milestone title is required' })
    .trim()
    .min(1, 'Milestone title is required')
    .max(120, 'Milestone title must be at most 120 characters'),

  order: z
    .number()
    .int()
    .min(0)
    .optional(),
})

export type AddMilestoneInput = z.infer<typeof addMilestoneSchema>

// ── Update milestone ───────────────────────────────────────────────
export const updateMilestoneSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Title must be at most 120 characters')
    .optional(),
})

export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>

// ── List goals query ───────────────────────────────────────────────
export const listGoalsSchema = z.object({
  status: z
    .enum(['active', 'done', 'archived'])
    .optional(),

  category: z
    .string()
    .trim()
    .optional(),

  sort: z
    .enum(['newest', 'oldest', 'deadline', 'progress'])
    .optional()
    .default('newest'),

  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),
})

export type ListGoalsInput = z.infer<typeof listGoalsSchema>