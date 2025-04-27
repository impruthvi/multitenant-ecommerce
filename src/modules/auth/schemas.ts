import { z } from "zod";

export const registerFormSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    username: z
        .string()
        .min(3, "Username must be at least 3 characters long")
        .max(63, "Username must be at most 63 characters long")
        .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "Username can only contain letters, numbers, and hyphen.It must start and end with a letter or number")
        .refine((val) => !val.includes("--"), "Username cannot contain consecutive hyphens")
        .transform((val) => val.toLowerCase()),
})

export const loginFormSchema = z.object({
    email: z.string().email(),
    password: z.string(),
})