import { z } from 'zod';
import { nameSchema, archivedSchema, slugSchema } from './base.schema';

export const createLessonSchema = z.object({
  name: nameSchema,
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  type: z.enum(['GERAL', 'EXERCICIOS', 'REVISAO', 'SIMULACAO']).default('GERAL'),
  archived: archivedSchema,
  knowledgeComponents: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  difficulty: z.number().min(0).max(10).default(1.0),
  estimatedDuration: z.number().positive(),
  identifier: z.string().optional()
});

export const patchLessonSchema = createLessonSchema.partial().refine((obj) => Object.keys(obj).length > 0, {
  message: "Pelo menos um campo precisa ser fornecido para atualização",
});

export const addLessonToTopicoSchema = z.object({
  lessonId: z.string().min(1, 'ID da lição é obrigatório'),
  topicoId: z.string().min(1, 'ID do tópico é obrigatório'),
  order: z.number().int().min(0).optional(),
});

export const reorderLessonsSchema = z.object({
  lessonIds: z.array(z.string()).min(1, 'Pelo menos uma lição deve ser fornecida'),
});

export const createLessonVariantSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  weight: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
}); 