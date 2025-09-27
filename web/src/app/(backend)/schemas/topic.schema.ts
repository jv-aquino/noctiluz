import { z } from 'zod';
import { slugSchema, idSchema, nameSchema, archivedSchema } from './base.schema';

export const createTopicSchema = z.object({
  name: nameSchema,
  description: z.string().min(2, 'Descrição obrigatória'),
  slug: slugSchema,
  archived: archivedSchema,
  subjectId: idSchema,
});

export const patchTopicSchema = createTopicSchema.partial().refine((obj) => Object.keys(obj).length > 0, {
  error: "Pelo menos um campo precisa ser fornecido para atualização",
}); 