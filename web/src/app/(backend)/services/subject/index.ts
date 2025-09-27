import { Subject } from '@/generated/prisma';
import prisma from '../db';
import { deleteTopic } from '../topic';

export async function getAllSubjects() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        topics: true
      }
    })
    return subjects
  } catch (error) {
    throw new Error(String(error) || 'Falha ao buscar matérias')
  }
}

export async function getSubjectById(id: string) {
  try {
    const subject = await prisma.subject.findUnique({
      where: {
        id,
      }
    })
    return subject
  } catch (error) {
    throw new Error(String(error) || 'Falha ao buscar matéria')
  }
}

export async function getSubjectBySlug(slug: string) {
  try {
    const subject = await prisma.subject.findUnique({
      where: {
        slug,
      }
    })
    return subject
  } catch (error) {
    throw new Error(String(error) || 'Falha ao buscar matéria')
  }
}

export async function createSubject(data: Omit<Subject, "id">) {
  try {
    const subject = await prisma.subject.create({
      data
    })
    return subject
  } catch (error) {
    throw new Error(String(error) || 'Falha ao criar matéria')
  }
}

export async function deleteSubject(id: string) {
  try {
    // Remove all related curso-subject relations
    await prisma.courseSubjectRelation.deleteMany({ where: { subjectId: id } });

    const topics = await prisma.topic.findMany({ where: { subjectId: id } });
    for (const topic of topics) {
      await deleteTopic(topic.id);
    }

    // Finally, delete the subject
    const subject = await prisma.subject.delete({
      where: {
        id,
      }
    })
    return subject
  } catch (error) {
    throw new Error(String(error) || 'Falha ao buscar matéria')
  }
}

export async function updateSubject(id: string, data: Partial<Omit<Subject, "id">>) {
  try {
    const subject = await prisma.subject.update({
      where: {
        id,
      },
      data
    })
    return subject
  } catch (error) {
    throw new Error(String(error) || 'Falha ao atualizar matéria')
  }
}