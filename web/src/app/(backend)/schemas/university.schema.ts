import { z } from 'zod';
import { nameSchema } from './base.schema';

export const createUniversitySchema = z.object({
  name: nameSchema,
  nickname: z.string().min(1, 'Apelido é obrigatório').max(50, 'Apelido não pode ter mais de 50 caracteres').trim(),
  description: z.string().max(500, 'Descrição não pode ter mais de 500 caracteres').nullable().default(null),
  country: z.string().max(100, 'País não pode ter mais de 100 caracteres').nullable().default(null),
  state: z.string().max(100, 'Estado não pode ter mais de 100 caracteres').nullable().default(null),
});

export const patchUniversitySchema = createUniversitySchema.partial().refine((obj) => Object.keys(obj).length > 0, {
  error: "Pelo menos um campo precisa ser fornecido para atualização",
});