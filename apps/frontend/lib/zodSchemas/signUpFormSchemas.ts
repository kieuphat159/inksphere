import { email, z } from "zod";

export const signUpFormSchema =  z.object({
    name: z.string().min(2).trim(),
    email: z.email(),
    password: z
    .string()
    .min(8)
    .regex(/[a-zA-Z]/, {message: "Contain at least one letter."})
    .regex(/[0-9]/, {message: "Contain at least one number."})
    .regex(/[^a-zA-Z0-9]/, {message: "Contain at least one special character."})
    .trim(),
})