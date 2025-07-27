import prisma from '@/backend/services/db';
import { createCursoSchema, patchCursoSchema } from '@/backend/schemas';
import { Curso } from '@/generated/prisma';

type CursoWithoutId = Omit<Curso, 'id'>

export async function getAllCursos() {
  return prisma.curso.findMany({
    include: {
      materiasRelacionadas: true,
    },
  });
}

export async function createCurso(data: CursoWithoutId) {
  return prisma.curso.create({
    data,
  });
}

export async function getCursoById(id: string) {
  return prisma.curso.findUnique({
    where: { id },
    include: {
      materiasRelacionadas: { include: { materia: true } },
      cursoTopicos: {
        include: {
          topico: {
            include: {
              materia: true
            }
          }
        },
        orderBy: { order: 'asc' }
      },
    },
  });
}

export async function deleteCurso(id: string) {
  // Remove all related materia relations first
  await prisma.cursoMateriaRelacionada.deleteMany({ where: { cursoId: id } });
  await prisma.cursoTopico.deleteMany({ where: { cursoId: id } });
  await prisma.userCurso.deleteMany({ where: { cursoId: id } });
  
  // Then delete the curso
  return prisma.curso.delete({
    where: { id },
  });
}

export async function updateCurso(id: string, data: Partial<CursoWithoutId>) {
  return prisma.curso.update({
    where: { id },
    data,
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

export async function createCursoMateriaRelacionada(cursoId: string, materiaId: string) {
  // todo: validate IDs here if needed
  return prisma.cursoMateriaRelacionada.create({
    data: {
      cursoId,
      materiaId,
    },
  });
}

export async function setCursoMaterias(cursoId: string, materiaIds: string[]) {
  // Remove all current relations
  await prisma.cursoMateriaRelacionada.deleteMany({ where: { cursoId } });
  // Add new relations
  if (materiaIds.length > 0) {
    await prisma.cursoMateriaRelacionada.createMany({
      data: materiaIds.map(materiaId => ({ cursoId, materiaId })),
    });
  }
} 