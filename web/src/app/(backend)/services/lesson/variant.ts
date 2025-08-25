import z from "zod";
import { createLessonVariantSchema } from "../../schemas/lesson.schema";
import prisma from "../db";

export async function createLessonVariant(lessonId: string, data: z.infer<typeof createLessonVariantSchema>) {
  // Only one default per lesson
  if (data.isDefault) {
    await prisma.lessonVariant.updateMany({
      where: { lessonId },
      data: { isDefault: false },
    });
  }
  return prisma.lessonVariant.create({
    data: {
      lessonId,
      slug: data.slug,
      name: data.name,
      description: data.description,
      isDefault: !!data.isDefault,
      weight: data.weight ?? 100,
      isActive: data.isActive ?? true,
    },
  });
} 

export async function getVariantById({ variantId }: { variantId: string }) {
  return prisma.lessonVariant.findUnique({
    where: { id: variantId },
  });
}