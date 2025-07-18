import { Materia } from '@/generated/prisma';
import prisma from '../db';
import { deleteTopico } from '../topico';

export async function getAllMaterias() {
  try {
    const materias = await prisma.materia.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        topicos: true
      }
    })
    return materias
  } catch (error) {
    throw new Error(String(error) || 'Falha ao buscar matérias')
  }
}

export async function getMateriaById(id: string) {
  try {
    const materia = await prisma.materia.findUnique({
      where: {
        id,
      }
    })
    return materia
  } catch (error) {
    throw new Error(String(error) || 'Falha ao buscar matéria')
  }
}

export async function getMateriaBySlug(slug: string) {
  try {
    const materia = await prisma.materia.findUnique({
      where: {
        slug,
      }
    })
    return materia
  } catch (error) {
    throw new Error(String(error) || 'Falha ao buscar matéria')
  }
}

export async function createMateria(data: Omit<Materia, "id">) {
  try {
    const materia = await prisma.materia.create({
      data
    })
    return materia
  } catch (error) {
    throw new Error(String(error) || 'Falha ao criar matéria')
  }
}

export async function deleteMateria(id: string) {
  try {
    // Remove all related curso-materia relations
    await prisma.cursoMateriaRelacionada.deleteMany({ where: { materiaId: id } });

    const topicos = await prisma.topico.findMany({ where: { materiaId: id } });
    for (const topico of topicos) {
      await deleteTopico(topico.id);
    }

    // Finally, delete the materia
    const materia = await prisma.materia.delete({
      where: {
        id,
      }
    })
    return materia
  } catch (error) {
    throw new Error(String(error) || 'Falha ao buscar matéria')
  }
}

export async function updateMateria(id: string, data: Partial<Omit<Materia, "id">>) {
  try {
    const materia = await prisma.materia.update({
      where: {
        id,
      },
      data
    })
    return materia
  } catch (error) {
    throw new Error(String(error) || 'Falha ao atualizar matéria')
  }
}