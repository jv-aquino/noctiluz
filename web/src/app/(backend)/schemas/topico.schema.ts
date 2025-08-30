import { z } from 'zod';
import { slugSchema, idSchema, nameSchema, archivedSchema } from './base.schema';

export const createTopicoSchema = z.object({
  name: nameSchema,
  descricao: z.string().min(2, 'Descrição obrigatória'),
  slug: slugSchema,
  archived: archivedSchema,
  materiaId: idSchema,
});

export const patchTopicoSchema = createTopicoSchema.partial().refine((obj) => Object.keys(obj).length > 0, {
  error: "Pelo menos um campo precisa ser fornecido para atualização",
}); 