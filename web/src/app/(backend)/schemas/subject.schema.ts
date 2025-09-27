import z from "zod";
import { nameSchema, slugSchema, tagsSchema, colorSchema } from "./base.schema";

export const createSubjectSchema = z.object({
  name: nameSchema,
  
  description: z
    .string({
      error: (issue) => issue.input === undefined
        ? "Descrição é obrigatória"
        : "Descrição deve ser um texto"
    })
    .min(1, "Descrição não pode estar vazia")
    .max(500, "Descrição não pode ter mais de 500 caracteres")
    .trim(),
  
  color: colorSchema,
  slug: slugSchema,
  imageUrl: z.string(),

  tags: tagsSchema,
})

export const patchSubjectSchema = createSubjectSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    error: "Pelo menos um campo precisa ser fornecido para atualização",
  });