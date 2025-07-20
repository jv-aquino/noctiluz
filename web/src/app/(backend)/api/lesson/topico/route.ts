import { NextRequest, NextResponse } from 'next/server';
import { addLessonToTopico, reorderLessonsInTopico } from '@/backend/services/lesson';
import { addLessonToTopicoSchema, reorderLessonsSchema } from '@/backend/schemas';
import { blockForbiddenRequests, zodErrorHandler } from '@/utils';
import type { AllowedRoutes } from '@/types';

const allowedRoles: AllowedRoutes = {
  POST: ["SUPER_ADMIN", "ADMIN"],
  PATCH: ["SUPER_ADMIN", "ADMIN"]
};

export async function POST(request: NextRequest) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.POST);
    if (forbidden) {
      return forbidden;
    }

    const body = await request.json();
    const validationResult = addLessonToTopicoSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { lessonId, topicoId, order } = validationResult.data;
    const relation = await addLessonToTopico(lessonId, topicoId, order);
    return NextResponse.json(relation, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Esta lição já está associada a este tópico' },
          { status: 409 }
        );
      }
      if (error.message.includes('Prisma')) {
        return NextResponse.json(
          { error: 'Erro no banco de dados - Verifique os dados fornecidos' },
          { status: 400 }
        );
      }
    }
    return zodErrorHandler(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.PATCH);
    if (forbidden) {
      return forbidden;
    }

    const body = await request.json();
    const { topicoId, lessonIds } = body;

    if (!topicoId) {
      return NextResponse.json(
        { error: 'ID do tópico é obrigatório' },
        { status: 400 }
      );
    }

    const validationResult = reorderLessonsSchema.safeParse({ lessonIds });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    await reorderLessonsInTopico(topicoId, lessonIds);
    return NextResponse.json({ message: 'Ordem das lições atualizada' }, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    if (error instanceof Error) {
      if (error.message.includes('Prisma')) {
        return NextResponse.json(
          { error: 'Erro no banco de dados - Verifique os dados fornecidos' },
          { status: 400 }
        );
      }
    }
    return zodErrorHandler(error);
  }
} 