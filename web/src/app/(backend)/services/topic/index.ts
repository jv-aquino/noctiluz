import prisma from '@/backend/services/db';
import type { Topic } from '@/generated/prisma';

type TopicWithoutId = Omit<Topic, 'id'>

export async function getAllTopics() {
  return prisma.topic.findMany({
    include: {
      courseTopics: true,
      topicLessons: true,
      userProgress: true,
      subject: true,
    },
  });
}

export async function createTopic(data: TopicWithoutId) {
  return prisma.topic.create({
    data,
  });
}

export async function getTopicById(id: string) {
  return prisma.topic.findUnique({
    where: { id },
    include: {
      courseTopics: true,
      topicLessons: true,
      userProgress: true,
      subject: true,
    },
  });
}

export async function deleteTopic(id: string) {
  // Remove all related courseTopics and topicLessons first
  await prisma.courseTopic.deleteMany({ where: { topicId: id } });
  await prisma.topicLesson.deleteMany({ where: { topicId: id } });
  await prisma.userProgress.deleteMany({ where: { topicId: id } });
  // Then delete the topic
  return prisma.topic.delete({
    where: { id },
  });
}

export async function updateTopic(id: string, data: Partial<TopicWithoutId>) {
  return prisma.topic.update({
    where: { id },
    data,
  });
} 