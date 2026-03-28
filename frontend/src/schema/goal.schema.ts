import { z } from "zod";

/**
 * ============================================
 * 📌 MILESTONE SCHEMA
 * ============================================
 */
export const MilestoneSchema = z.object({
  _id: z.string(),

  title: z.string().min(2, "Milestone title too short"),

  completed: z.boolean().default(false),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

/**
 * ============================================
 * 📌 GOAL SCHEMA (BACKEND → FRONTEND SAFE)
 * ============================================
 */
export const GoalSchema = z.object({
  _id: z.string(),

  title: z.string().min(3, "Title must be 3+ characters"),

  description: z.string().optional().default(""),

  // ✅ ALWAYS SAFE FOR UI
  deadline: z.string().optional().default(""),

  status: z.enum(["active", "done", "archived"]).default("active"),

  // ✅ NEVER undefined in UI
  category: z.string().optional().default("general"),

  progress: z.number().min(0).max(100).default(0),

  isPinned: z.boolean().default(false),

  milestones: z.array(MilestoneSchema).default([]),

  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * ============================================
 * 📌 CREATE GOAL SCHEMA (FORM VALIDATION)
 * ============================================
 */
export const CreateGoalSchema = z.object({
  title: z.string().min(3, "Title must be 3+ characters"),

  description: z.string().optional(),

  deadline: z.string().optional(),

  category: z.string().optional(),

  milestones: z
    .array(
      z.object({
        title: z.string().min(2),
      })
    )
    .optional(),
});

/**
 * ============================================
 * 📌 UPDATE GOAL SCHEMA
 * ============================================
 */
export const UpdateGoalSchema = CreateGoalSchema.extend({
  status: z.enum(["active", "done", "archived"]).optional(),
});

/**
 * ============================================
 * 📌 TYPES
 * ============================================
 */
export type Goal = z.infer<typeof GoalSchema>;
export type Milestone = z.infer<typeof MilestoneSchema>;

export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalInput = z.infer<typeof UpdateGoalSchema>;