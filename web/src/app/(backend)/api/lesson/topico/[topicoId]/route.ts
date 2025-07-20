import { NextRequest, NextResponse } from 'next/server';
import { getLessonsByTopicoId } from '@/backend/services/lesson';
import { idSchema } from '@/backend/schemas';
import { zodErrorHandler } from '@/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ topicoId: string }> }
) {
  try {
    const { topicoId } = await params;
    const validationResult = idSchema.safeParse(topicoId);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'ID do tópico inválido', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const lessons = await getLessonsByTopicoId(topicoId);
    return NextResponse.json(lessons, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return zodErrorHandler(error);
  }
} 