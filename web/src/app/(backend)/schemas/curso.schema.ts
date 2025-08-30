import { z } from 'zod';
import { nameSchema, slugSchema, tagsSchema } from './base.schema';

export const createCursoSchema = z.object({
  name: nameSchema,
  descricao: z.string().min(2, 'Descrição obrigatória'),
  slug: slugSchema,
  tags: tagsSchema,
  backgroundImage: z.string().url('Deve ser uma URL válida').nullable().optional(),
});

export const patchCursoSchema = createCursoSchema.partial().refine((obj) => Object.keys(obj).length > 0, {
  error: "Pelo menos um campo precisa ser fornecido para atualização",
}); 