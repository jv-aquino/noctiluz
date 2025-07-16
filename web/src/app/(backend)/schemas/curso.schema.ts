import { z } from 'zod';
import { slugSchema } from './base.schema';

export const createCursoSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  descricao: z.string().min(2, 'Descrição obrigatória'),
  slug: slugSchema,
  tags: z.array(z.string()).default([]),
});

export const patchCursoSchema = createCursoSchema.partial().refine((obj) => Object.keys(obj).length > 0, {
  message: "Pelo menos um campo precisa ser fornecido para atualização",
}); 