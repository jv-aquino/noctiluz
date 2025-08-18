import { NextRequest, NextResponse } from 'next/server';
import { getAllLessons, createLesson } from '@/backend/services/lesson';
import { createLessonSchema } from '@/backend/schemas';
import { blockForbiddenRequests, returnInvalidDataErrors, validBody, zodErrorHandler } from '@/utils';
import type { AllowedRoutes } from '@/types';

const allowedRoles: AllowedRoutes = {
  POST: ["SUPER_ADMIN", "ADMIN"]
};

export async function GET() {
  try {
    const lessons = await getAllLessons();
    return NextResponse.json(lessons, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar lições:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar lições' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.POST);
    if (forbidden) {
      return forbidden;
    }

    const body = await validBody(request);
    const validationResult = createLessonSchema.safeParse(body);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult);
    }

    const validatedData = validationResult.data;
    const lesson = await createLesson({ ...validatedData, identifier: validatedData.identifier ?? '' });
    return NextResponse.json(lesson, { status: 201 });
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