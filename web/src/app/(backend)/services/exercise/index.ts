import { Exercise } from '@/generated/prisma';
import prisma from '../db';

export async function getAllExercises() {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        university: true,
        exerciseObjectives: {
          include: {
            skill: true,
          },
        },
        exerciseAttempts: true,
        contentBlocks: true,
      }
    });
    return exercises;
  } catch (error) {
    throw new Error(String(error) || 'Falha ao buscar exercícios');
  }
}

export async function getExerciseById(id: string) {
  try {
    const exercise = await prisma.exercise.findUnique({
      where: {
        id,
      },
      include: {
        university: true,
        exerciseObjectives: {
          include: {
            skill: true,
          },
        },
        exerciseAttempts: true,
        contentBlocks: true,
      }
    });
    return exercise;
  } catch (error) {
    throw new Error(String(error) || 'Falha ao buscar exercício');
  }
}

export async function createExercise(data: Omit<Exercise, "id">) {
  try {
    const exercise = await prisma.exercise.create({
      data,
      include: {
        university: true,
        exerciseObjectives: {
          include: {
            skill: true,
          },
        },
        exerciseAttempts: true,
        contentBlocks: true,
      }
    });
    return exercise;
  } catch (error) {
    throw new Error(String(error) || 'Falha ao criar exercício');
  }
}

export async function updateExercise(id: string, data: Partial<Omit<Exercise, "id">>) {
  try {
    const exercise = await prisma.exercise.update({
      where: {
        id,
      },
      data,
      include: {
        university: true,
        exerciseObjectives: {
          include: {
            skill: true,
          },
        },
        exerciseAttempts: true,
        contentBlocks: true,
      }
    });
    return exercise;
  } catch (error) {
    throw new Error(String(error) || 'Falha ao atualizar exercício');
  }
}

export async function deleteExercise(id: string) {
  try {
    // Remove related content blocks first
    await prisma.contentBlock.deleteMany({ where: { exerciseId: id } });
    
    // Remove exercise attempts
    await prisma.exerciseAttempt.deleteMany({ where: { exerciseId: id } });
    
    // Remove exercise objectives
    await prisma.exerciseObjective.deleteMany({ where: { exerciseId: id } });

    // Finally, delete the exercise
    const exercise = await prisma.exercise.delete({
      where: {
        id,
      }
    });
    return exercise;
  } catch (error) {
    throw new Error(String(error) || 'Falha ao deletar exercício');
  }
}