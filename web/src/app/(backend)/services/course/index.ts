import prisma from '@/backend/services/db';
import { Course } from '@/generated/prisma';

type CourseWithoutId = Omit<Course, 'id'>

export async function getAllCourses() {
  return prisma.course.findMany({
    include: {
      relatedSubjects: true,
    },
  });
}

export async function createCourse(data: CourseWithoutId) {
  return prisma.course.create({
    data,
  });
}

export async function getCourseById(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      relatedSubjects: { include: { subject: true } },
      courseTopics: {
        include: {
          topic: {
            include: {
              subject: true
            }
          }
        },
        orderBy: { order: 'asc' }
      },
    },
  });
}

export async function deleteCourse(id: string) {
  // Remove all related subject relations first
  await prisma.courseSubjectRelation.deleteMany({ where: { courseId: id } });
  await prisma.courseTopic.deleteMany({ where: { courseId: id } });
  await prisma.userCourse.deleteMany({ where: { courseId: id } });

  // Then delete the course
  return prisma.course.delete({
    where: { id },
  });
}

export async function updateCourse(id: string, data: Partial<CourseWithoutId>) {
  return prisma.course.update({
    where: { id },
    data,
  });
}

export async function getCoursesBySubjectId(subjectId: string) {
  // Busca todos os cursos relacionados a uma matéria específica
  const relations = await prisma.courseSubjectRelation.findMany({
    where: { subjectId },
    include: { subject: true },
  });
  return relations.map(r => r.subject);
}

export async function createCourseSubjectRelation(courseId: string, subjectId: string) {
  // todo: validate IDs here if needed
  return prisma.courseSubjectRelation.create({
    data: {
      courseId,
      subjectId,
    },
  });
}

export async function setCourseSubjects(courseId: string, subjectIds: string[]) {
  // Remove all current relations
  await prisma.courseSubjectRelation.deleteMany({ where: { courseId } });
  // Add new relations
  if (subjectIds.length > 0) {
    await prisma.courseSubjectRelation.createMany({
      data: subjectIds.map(subjectId => ({ courseId, subjectId })),
    });
  }
} 