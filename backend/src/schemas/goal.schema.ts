import { z } from "zod";

export const goalSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  targetDate: z.coerce.date().optional(),
  status: z.enum(["active", "completed", "abandoned"]).default("active"),
  milestones: z
    .array(
      z.object({
        text: z.string().min(1).max(200),
        completed: z.boolean().default(false),
      })
    )
    .max(20)
    .default([]),
});

export const updateGoalSchema = goalSchema.partial().extend({
  status: z.enum(["active", "completed", "abandoned"]).optional(),
});

export type GoalInput = z.infer<typeof goalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;