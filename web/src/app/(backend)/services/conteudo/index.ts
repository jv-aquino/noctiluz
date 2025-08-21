import { ContentBlock } from "@/generated/prisma";
import prisma from "../db";

export async function createContentPage(data: {
  name: string,
  order: number,
  lessonId: string
}) {
  return prisma.contentPage.create({
    data,
    include: {
      contentBlocks: true
    }
  })
}

export async function getContentPages({ lessonId }: { lessonId: string }) {
  return prisma.contentPage.findMany({
    where: { lessonId },
    include: {
      contentBlocks: {
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { order: 'asc' }
  })
}

export async function getContentPage({ lessonId, pageId }: { lessonId: string, pageId: string }) {
  return prisma.contentPage.findFirst({
    where: { 
      id: pageId,
      lessonId 
    }
  });
}


export async function getContentBlock({ blockId, pageId }: { blockId: string, pageId: string }) {
  return prisma.contentBlock.findFirst({
    where: { 
      id: blockId,
      pageId 
    }
  })
}

export async function getMaxOrder({ lessonId }: { lessonId: string }) {
  return prisma.contentPage.aggregate({
    where: { lessonId },
    _max: { order: true },
  })
}

export async function updateContentBlock({ blockId, data }: { blockId: string, data: ContentBlock }) {
  return prisma.contentBlock.update({
    where: { id: blockId },
    data
  })
}

export async function deleteContentBlock({ blockId }: { blockId: string }) {
  return prisma.contentBlock.delete({
      where: { id: blockId }
  })
}


export async function reorderContentPages(lessonId: string, pageIds: string[]) {
  const updates = pageIds.map((pageId, index) =>
    prisma.contentPage.updateMany({
      where: {
        id: pageId,
        lessonId,
      },
      data: {
        order: index,
      },
    })
  );

  return prisma.$transaction(updates);
}

export async function reorderContentBlocks(pageId: string, blockIds: string[]) {
  const updates = blockIds.map((blockId, index) =>
    prisma.contentBlock.updateMany({
      where: {
        id: blockId,
        pageId,
      },
      data: {
        order: index,
      },
    })
  );

  return prisma.$transaction(updates);
} 

export async function deleteContentPage(id: string) {
  // First, delete all content blocks within the page
  await prisma.contentBlock.deleteMany({
    where: {
      pageId: id,
    },
  });

  // Then, delete the page itself
  return prisma.contentPage.delete({
    where: { id },
  });
}