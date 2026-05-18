import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});


export const loginSchema = z.object({
  email: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

// Infering the type so it can be used for typing req.body
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;