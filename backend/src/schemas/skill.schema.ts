import { z } from "zod"

export const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required").max(60),
  category: z
    .enum(["frontend", "backend", "devops", "database", "testing", "other"])
    .default("other"),
  hoursLogged: z.number().min(0).default(0),   // ← hours not level number
  notes: z.string().max(500).optional(),
})

export const levelUpSchema = z.object({
  increment: z.number().int().min(1).max(10),
});
export type SkillInput = z.infer<typeof skillSchema>
export type LevelUpInput = z.infer<typeof levelUpSchema>;