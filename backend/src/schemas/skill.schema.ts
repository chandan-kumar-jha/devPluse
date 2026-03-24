import { z } from 'zod'

// ── Skill categories ───────────────────────────────────────────────
export const SKILL_CATEGORIES = [
  'Frontend',
  'Backend',
  'DevOps',
  'Database',
  'Mobile',
  'AI/ML',
  'Security',
  'Testing',
  'System Design',
  'Other',
] as const

// ── Create skill ───────────────────────────────────────────────────
export const createSkillSchema = z.object({
  name: z
    .string({ error: 'Skill name is required' })
    .trim()
    .min(1, 'Skill name is required')
    .max(60, 'Skill name must be at most 60 characters'),

  category: z.enum(SKILL_CATEGORIES, {
    error: 'Invalid category',
  }),

  level: z
    .number()
    .int()
    .min(1, 'Level must be at least 1')
    .max(10, 'Level must be at most 10')
    .optional()
    .default(1),

  notes: z
    .string()
    .trim()
    .max(500, 'Notes must be at most 500 characters')
    .optional()
    .nullable(),
})

export type CreateSkillInput = z.infer<typeof createSkillSchema>

// ── Update skill ───────────────────────────────────────────────────
export const updateSkillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Skill name is required')
    .max(60, 'Skill name must be at most 60 characters')
    .optional(),

  category: z
    .enum(SKILL_CATEGORIES, {
      error: 'Invalid category',
    })
    .optional(),

  level: z
    .number()
    .int()
    .min(1, 'Level must be at least 1')
    .max(10, 'Level must be at most 10')
    .optional(),

  notes: z
    .string()
    .trim()
    .max(500, 'Notes must be at most 500 characters')
    .optional()
    .nullable(),
})

export type UpdateSkillInput = z.infer<typeof updateSkillSchema>

// ── List skills query ──────────────────────────────────────────────
export const listSkillsSchema = z.object({
  search: z
    .string()
    .trim()
    .max(100)
    .optional(),

  category: z
    .enum(SKILL_CATEGORIES)
    .optional(),

  tier: z
    .enum(['beginner', 'intermediate', 'advanced', 'expert'])
    .optional(),

  sort: z
    .enum(['level', 'name', 'xp', 'newest'])
    .optional()
    .default('level'),

  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),
})

export type ListSkillsInput = z.infer<typeof listSkillsSchema>