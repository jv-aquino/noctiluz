import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/services/db';
import { z } from 'zod';
import { returnInvalidDataErrors, toErrorMessage } from '@/utils';

const bodySchema = z.object({
  courseId: z.string(),
  topicId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = bodySchema.safeParse(body);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }
    const { courseId, topicId } = validationResult.data;
    // Find the current max order for this course
    const maxOrder = await prisma.courseTopic.aggregate({
      where: { courseId: courseId },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? 0) + 1;
    const relation = await prisma.courseTopic.create({
      data: { courseId, topicId: topicId, order },
    });
    return NextResponse.json(relation, { status: 201 });
  } catch {
    return NextResponse.json(toErrorMessage('Erro ao associar tópico ao curso'), { status: 500 });
  }
} 