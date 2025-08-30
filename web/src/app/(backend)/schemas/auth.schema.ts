import { z } from "zod";
import { emailSchema, passwordSchema } from "./base.schema";

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços")
    .transform(str => str.trim()),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
})
  .refine((data) => data.password === data.confirmPassword, {
    error: "Senhas não conferem",
    path: ["confirmPassword"],
})

export type LoginData = z.infer<typeof loginSchema>;
