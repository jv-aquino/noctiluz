import { University } from '@/generated/prisma';
import prisma from '../db';

export async function getAllUniversities() {
  try {
    const universities = await prisma.university.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        exercises: true,
      }
    });
    return universities;
  } catch (error) {
    throw new Error(String(error) || 'Falha ao buscar universidades');
  }
}

export async function getUniversityById(id: string) {
  try {
    const university = await prisma.university.findUnique({
      where: {
        id,
      },
      include: {
        exercises: true,
      }
    });
    return university;
  } catch (error) {
    throw new Error(String(error) || 'Falha ao buscar universidade');
  }
}

export async function createUniversity(data: Omit<University, "id">) {
  try {
    const university = await prisma.university.create({
      data,
      include: {
        exercises: true,
      }
    });
    return university;
  } catch (error) {
    throw new Error(String(error) || 'Falha ao criar universidade');
  }
}

export async function updateUniversity(id: string, data: Partial<Omit<University, "id">>) {
  try {
    const university = await prisma.university.update({
      where: {
        id,
      },
      data,
      include: {
        exercises: true,
      }
    });
    return university;
  } catch (error) {
    throw new Error(String(error) || 'Falha ao atualizar universidade');
  }
}

export async function deleteUniversity(id: string) {
  try {
    // Update exercises to remove university reference (set to null)
    await prisma.exercise.updateMany({
      where: { universityId: id },
      data: { universityId: null }
    });

    // Finally, delete the university
    const university = await prisma.university.delete({
      where: {
        id,
      }
    });
    return university;
  } catch (error) {
    throw new Error(String(error) || 'Falha ao deletar universidade');
  }
}