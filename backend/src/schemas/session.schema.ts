import { z } from "zod"

export const sessionSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  date: z.coerce.date(),
  durationMinutes: z
    .number()
    .int()
    .min(1, "Duration must be at least 1 minute")
    .max(1440, "Duration cannot exceed 24 hours"),
  tags: z.array(z.string().max(30)).max(10).default([]),
  notes: z.string().max(2000).optional(),
  mood: z.enum(["great", "good", "okay", "bad"]).optional(),
  goalId: z.string().optional(),   // ← link session to a goal
})

export type SessionInput = z.infer<typeof sessionSchema>