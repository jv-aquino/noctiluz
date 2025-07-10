import { z } from 'zod';
import { corSchema, slugSchema } from './base.schema';

export const createCursoSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  descricao: z.string().min(2, 'Descrição obrigatória'),
  slug: slugSchema,
  tags: z.array(z.string()).default([]),
}); 