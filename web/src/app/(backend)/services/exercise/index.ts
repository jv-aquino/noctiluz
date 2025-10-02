import { Exercise, Prisma } from '@/generated/prisma';
import prisma from '../db';

export interface ExerciseSearchParams {
  page?: number;
  limit?: number;
  name?: string;
  universityId?: string;
  minDifficulty?: number;
  maxDifficulty?: number;
  type?: string;
  archived?: boolean;
}

type ExerciseWithIncludes = Prisma.ExerciseGetPayload<{
  include: {
    university: true;
    exerciseObjectives: {
      include: {
        skill: true;
      };
    };
    exerciseAttempts: true;
    contentBlocks: true;
  };
}>;

export interface PaginatedExercises {
  exercises: ExerciseWithIncludes[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function getAllExercises(params: ExerciseSearchParams = {}): Promise<PaginatedExercises> {
  try {
    const {
      page = 1,
      limit = 10,
      name,
      universityId,
      minDifficulty,
      maxDifficulty,
      type,
      archived = false
    } = params;

    // Build where clause for filtering
    const where: Prisma.ExerciseWhereInput = {
      archived: archived,
    };

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive'
      };
    }

    if (universityId) {
      where.universityId = universityId;
    }

    if (minDifficulty !== undefined || maxDifficulty !== undefined) {
      where.difficulty = {};
      if (minDifficulty !== undefined) {
        where.difficulty.gte = minDifficulty;
      }
      if (maxDifficulty !== undefined) {
        where.difficulty.lte = maxDifficulty;
      }
    }

    if (type) {
      where.type = type as Prisma.EnumExerciseTypeFilter;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await prisma.exercise.count({ where });

    // Get exercises with pagination
    const exercises = await prisma.exercise.findMany({
      where,
      skip,
      take: limit,
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

    const totalPages = Math.ceil(total / limit);

    return {
      exercises,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }
    };
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