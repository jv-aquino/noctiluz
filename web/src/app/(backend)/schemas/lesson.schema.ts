import { z } from 'zod';

export const createLessonSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  type: z.enum(['GERAL', 'EXERCICIOS', 'REVISAO', 'SIMULACAO']).default('GERAL'),
  archived: z.boolean().optional(),
  knowledgeComponents: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  difficulty: z.number().min(0).max(10).default(1.0),
  estimatedDuration: z.number().positive(),
});

export const patchLessonSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  descricao: z.string().min(1, 'Descrição é obrigatória').optional(),
  type: z.enum(['GERAL', 'EXERCICIOS', 'REVISAO', 'SIMULACAO']).optional(),
  archived: z.boolean().optional(),
  knowledgeComponents: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  difficulty: z.number().min(0).max(10).optional(),
  estimatedDuration: z.number().positive().optional(),
});

export const addLessonToTopicoSchema = z.object({
  lessonId: z.string().min(1, 'ID da lição é obrigatório'),
  topicoId: z.string().min(1, 'ID do tópico é obrigatório'),
  order: z.number().int().min(0).optional(),
});

export const reorderLessonsSchema = z.object({
  lessonIds: z.array(z.string()).min(1, 'Pelo menos uma lição deve ser fornecida'),
});

export const reorderConteudoPagesSchema = z.object({
  pageIds: z.array(z.string()),
});

export const reorderContentBlocksSchema = z.object({
  blockIds: z.array(z.string()),
}); 