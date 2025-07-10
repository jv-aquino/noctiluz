import prisma from '@/backend/services/db';
import { createCursoSchema } from '@/backend/schemas';

export async function getAllCursos() {
  return prisma.curso.findMany({
    include: {
      materiasRelacionadas: true,
    },
  });
}

export async function createCurso(data: unknown) {
  const parsed = createCursoSchema.parse(data);
  return prisma.curso.create({
    data: parsed,
  });
}

export async function getCursoById(id: string) {
  return prisma.curso.findUnique({
    where: { id },
    include: {
      materiasRelacionadas: true,
    },
  });
}

export async function deleteCurso(id: string) {
  // Retorna o curso deletado (ou null)
  return prisma.curso.delete({
    where: { id },
  });
}

export async function getCursosByMateriaId(materiaId: string) {
  // Busca todos os cursos relacionados a uma matéria específica
  const relacoes = await prisma.cursoMateriaRelacionada.findMany({
    where: { materiaId },
    include: { curso: true },
  });
  return relacoes.map(r => r.curso);
} 