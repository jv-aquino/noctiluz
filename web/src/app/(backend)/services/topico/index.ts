import prisma from '@/backend/services/db';
import { createTopicoSchema, patchTopicoSchema } from '@/backend/schemas';

export async function getAllTopicos() {
  return prisma.topico.findMany({
    include: {
      cursoTopicos: true,
      topicoLessons: true,
      userProgress: true,
      materia: true,
    },
  });
}

export async function createTopico(data: unknown) {
  const parsed = createTopicoSchema.parse(data);
  return prisma.topico.create({
    data: parsed,
  });
}

export async function getTopicoById(id: string) {
  return prisma.topico.findUnique({
    where: { id },
    include: {
      cursoTopicos: true,
      topicoLessons: true,
      userProgress: true,
      materia: true,
    },
  });
}

export async function deleteTopico(id: string) {
  // Remove all related cursoTopicos and topicoLessons first
  await prisma.cursoTopico.deleteMany({ where: { topicoId: id } });
  await prisma.topicoLesson.deleteMany({ where: { topicoId: id } });
  await prisma.userProgress.deleteMany({ where: { topicoId: id } });
  // Then delete the topico
  return prisma.topico.delete({
    where: { id },
  });
}

export async function updateTopico(id: string, data: unknown) {
  const parsed = patchTopicoSchema.parse(data);
  return prisma.topico.update({
    where: { id },
    data: parsed,
  });
} 