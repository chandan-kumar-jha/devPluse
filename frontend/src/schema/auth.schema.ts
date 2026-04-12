import { z } from "zod";

export const emailSchema = z.object({
  email: z.string().email("Invalid email"),
});

export type EmailFormData = z.infer<typeof emailSchema>;