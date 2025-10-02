import { z } from 'zod';
import { nameSchema, archivedSchema, idSchema } from './base.schema';
import { ExerciseType } from '@/generated/prisma';

export const alternativeSchema = z.object({
  markdown: z.string().min(1, 'Texto da alternativa é obrigatório'),
  explanation: z.string().min(1, 'Explicação é obrigatória'),
  isCorrect: z.boolean(),
  order: z.number().int().min(0),
});

export const AlternativesSchema = z.array(alternativeSchema);

export const createExerciseSchema = z.object({
  name: nameSchema,
  markdown: z.string().min(1, 'Conteúdo do exercício é obrigatório'),
  universityId: z.string().uuid('ID da universidade inválido').nullable().default(null),
  type: z.nativeEnum(ExerciseType).default(ExerciseType.MULTIPLE_CHOICE),
  archived: archivedSchema,
  alternatives: z.array(alternativeSchema).optional().default([]),
  correctValue: z.string().nullable().default(null),
  skillsTested: z.array(z.string()).default([]),
  difficulty: z.number().min(0).max(10).default(1.0),
  estimatedTime: z.number().int().positive().default(5),
  tags: z.array(z.string()).default([]),
});

export const patchExerciseSchema = createExerciseSchema.partial().refine((obj) => Object.keys(obj).length > 0, {
  error: "Pelo menos um campo precisa ser fornecido para atualização",
});

// Pagination and search schemas
export const exerciseQuerySchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1)
    .refine((val) => val > 0, { message: "Página deve ser maior que 0" }),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10)
    .refine((val) => val > 0 && val <= 100, { message: "Limite deve ser entre 1 e 100" }),
  name: z.string().optional(),
  universityId: idSchema.optional(),
  minDifficulty: z.string().optional().transform((val) => val ? parseFloat(val) : undefined)
    .refine((val) => val === undefined || (val >= 0 && val <= 10), { message: "Dificuldade mínima deve ser entre 0 e 10" }),
  maxDifficulty: z.string().optional().transform((val) => val ? parseFloat(val) : undefined)
    .refine((val) => val === undefined || (val >= 0 && val <= 10), { message: "Dificuldade máxima deve ser entre 0 e 10" }),
  type: z.nativeEnum(ExerciseType).optional(),
  archived: z.string().optional().transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
});