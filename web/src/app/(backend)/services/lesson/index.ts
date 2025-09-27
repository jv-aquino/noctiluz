import prisma from '@/backend/services/db';
import { Lesson } from '@/generated/prisma';

type LessonWithoutId = Omit<Lesson, 'id'>;

export async function getAllLessons() {
  return prisma.lesson.findMany({
    include: {
      topicLessons: {
        include: {
          topic: true,
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
      topicLessons: {
        include: {
          topic: true,
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
      topicLessons: {
        include: {
          topic: true,
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
  await prisma.topicLesson.deleteMany({ where: { lessonId: id } });
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
      topicLessons: {
        include: {
          topic: true,
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

export async function getLessonsByTopicId(topicId: string) {
  return prisma.topicLesson.findMany({
    where: { topicId },
    include: { lesson: true },
    orderBy: { order: 'asc' },
  });
}

export async function addLessonToTopic(lessonId: string, topicId: string, order?: number) {
  // Get the current max order for this topic
  const maxOrder = await prisma.topicLesson.aggregate({
    where: { topicId },
    _max: { order: true },
  });
  
  const newOrder = order ?? (maxOrder._max.order ?? 0) + 1;

  return prisma.topicLesson.create({
    data: {
      lessonId,
      topicId,
      order: newOrder,
    },
    include: {
      lesson: true,
      topic: true,
    },
  });
}

export async function removeLessonFromTopic(lessonId: string, topicId: string) {
    const relation = await prisma.topicLesson.findUnique({
      where: {
        topicId_lessonId: {
          topicId,
          lessonId,
        }
      }
    });
  
    if (!relation) {
      throw new Error("Relation Topico-Lesson not found");
    }
  
    return await prisma.topicLesson.delete({
      where: {
        id: relation.id,
      },
    });
  }

export async function reorderLessonsInTopic(topicId: string, lessonIds: string[]) {
  // Update the order for each lesson in the topico
  const updates = lessonIds.map((lessonId, index) => 
    prisma.topicLesson.update({
      where: {
        topicId_lessonId: {
          topicId,
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