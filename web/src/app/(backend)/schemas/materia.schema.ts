import z from "zod";
import { nameSchema, corSchema, slugSchema, tagsSchema } from "./base.schema";

export const createMateriaSchema = z.object({
  name: nameSchema,
  
  descricao: z
    .string({
      error: (issue) => issue.input === undefined
        ? "Descrição é obrigatória"
        : "Descrição deve ser um texto"
    })
    .min(1, "Descrição não pode estar vazia")
    .max(500, "Descrição não pode ter mais de 500 caracteres")
    .trim(),
  
  cor: corSchema,
  slug: slugSchema,
  imgUrl: z.string(),

  tags: tagsSchema,
})

export const patchMateriaSchema = createMateriaSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    error: "Pelo menos um campo precisa ser fornecido para atualização",
  });