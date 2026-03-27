import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "No special characters allowed"), // Ensure 0-9 is here
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// CRITICAL: Ensure this line is present and exported
export type RegisterFormData = z.infer<typeof registerSchema>;