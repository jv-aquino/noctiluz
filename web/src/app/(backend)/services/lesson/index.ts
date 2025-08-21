import prisma from '@/backend/services/db';
import { Lesson } from '@/generated/prisma';

type LessonWithoutId = Omit<Lesson, 'id'>;

export async function getAllLessons() {
  return prisma.lesson.findMany({
    include: {
      topicoLessons: {
        include: {
          topico: true,
        },
      },
      learningObjectives: {
        include: {
          skill: true,
        },
      },
      contentPages: true,
      lessonVariants: true,
      userProgress: true,
      userAttempts: true,
    },
  });
}

export async function createLesson(data: LessonWithoutId) {
  return prisma.lesson.create({
    data,
    include: {
      topicoLessons: {
        include: {
          topico: true,
        },
      },
      learningObjectives: {
        include: {
          skill: true,
        },
      },
    },
  });
}

export async function getLessonById(id: string) {
  return prisma.lesson.findUnique({
    where: { id },
    include: {
      topicoLessons: {
        include: {
          topico: true,
        },
      },
      learningObjectives: {
        include: {
          skill: true,
        },
      },
      contentPages: {
        include: {
          contentBlocks: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
      lessonVariants: true,
      userProgress: true,
      userAttempts: true,
    },
  });
}

export async function deleteLesson(id: string) {
  // Remove all related records first
  await prisma.topicoLesson.deleteMany({ where: { lessonId: id } });
  await prisma.lessonObjective.deleteMany({ where: { lessonId: id } });
  await prisma.userProgress.deleteMany({ where: { lessonId: id } });
  await prisma.userAttempt.deleteMany({ where: { lessonId: id } });
  await prisma.contentPage.deleteMany({ where: { lessonId: id } });
  await prisma.lessonVariant.deleteMany({ where: { lessonId: id } });
  
  // Then delete the lesson
  return prisma.lesson.delete({
    where: { id },
  });
}

export async function updateLesson(id: string, data: Partial<LessonWithoutId>) {
  return prisma.lesson.update({
    where: { id },
    data,
    include: {
      topicoLessons: {
        include: {
          topico: true,
        },
      },
      learningObjectives: {
        include: {
          skill: true,
        },
      },
    },
  });
}

export async function getLessonsByTopicoId(topicoId: string) {
  return prisma.topicoLesson.findMany({
    where: { topicoId },
    include: { lesson: true },
    orderBy: { order: 'asc' },
  });
}

export async function addLessonToTopico(lessonId: string, topicoId: string, order?: number) {
  // Get the current max order for this topico
  const maxOrder = await prisma.topicoLesson.aggregate({
    where: { topicoId },
    _max: { order: true },
  });
  
  const newOrder = order ?? (maxOrder._max.order ?? 0) + 1;
  
  return prisma.topicoLesson.create({
    data: {
      lessonId,
      topicoId,
      order: newOrder,
    },
    include: {
      lesson: true,
      topico: true,
    },
  });
}

export async function removeLessonFromTopico(lessonId: string, topicoId: string) {
    const relation = await prisma.topicoLesson.findUnique({
      where: {
        topicoId_lessonId: {
          topicoId,
          lessonId,
        }
      }
    });
  
    if (!relation) {
      throw new Error("Relation Topico-Lesson not found");
    }
  
    return await prisma.topicoLesson.delete({
      where: {
        id: relation.id,
      },
    });
  }

export async function reorderLessonsInTopico(topicoId: string, lessonIds: string[]) {
  // Update the order for each lesson in the topico
  const updates = lessonIds.map((lessonId, index) => 
    prisma.topicoLesson.update({
      where: {
        topicoId_lessonId: {
          topicoId,
          lessonId,
        },
      },
      data: {
        order: index,
      },
    })
  );
  
  return prisma.$transaction(updates);
} 

export async function getLessonVariants(lessonId: string) {
  return prisma.lessonVariant.findMany({
    where: { lessonId },
    orderBy: { isDefault: 'desc' }, // Default first
  });
}