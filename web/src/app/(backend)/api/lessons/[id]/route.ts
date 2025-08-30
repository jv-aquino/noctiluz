import { NextRequest, NextResponse } from 'next/server';
import { getLessonById, deleteLesson, updateLesson } from '@/backend/services/lesson';
import { idSchema, patchLessonSchema } from '@/backend/schemas';
import { blockForbiddenRequests, returnInvalidDataErrors, toErrorMessage, zodErrorHandler } from '@/utils';
import type { AllowedRoutes } from '@/types';

const allowedRoles: AllowedRoutes = {
  DELETE: ["SUPER_ADMIN", "ADMIN"],
  PATCH: ["SUPER_ADMIN", "ADMIN"]
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validationResult = idSchema.safeParse(id);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const lesson = await getLessonById(id);
    if (!lesson) {
      return NextResponse.json(
        toErrorMessage('Lição não encontrada'),
        { status: 404 }
      );
    }
    
    return NextResponse.json(lesson, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return zodErrorHandler(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.DELETE);
    if (forbidden) {
      return forbidden;
    }

    const { id } = await params;
    const validationResult = idSchema.safeParse(id);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const lesson = await getLessonById(id);
    if (!lesson) {
      return NextResponse.json(
        toErrorMessage('Lição não encontrada'),
        { status: 404 }
      );
    }

    await deleteLesson(id);
    return NextResponse.json(lesson, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    if (error instanceof Error) {
      if (error.message.includes('Prisma')) {
        return NextResponse.json(
          toErrorMessage('Erro no banco de dados - Verifique os dados fornecidos'),
          { status: 400 }
        );
      }
    }
    return zodErrorHandler(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.PATCH);
    if (forbidden) {
      return forbidden;
    }

    const { id } = await params;
    const validationResult = idSchema.safeParse(id);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const existingLesson = await getLessonById(id);
    if (!existingLesson) {
      return NextResponse.json(
        toErrorMessage('Lição não encontrada'),
        { status: 404 }
      );
    }

    const body = await request.json();
    const validationDataResult = patchLessonSchema.safeParse(body);
    if (!validationDataResult.success) {
      return returnInvalidDataErrors(validationDataResult.error);
    }

    const validatedData = validationDataResult.data;
    const lesson = await updateLesson(id, validatedData);
    return NextResponse.json(lesson, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    if (error instanceof Error) {
      if (error.message.includes('Prisma')) {
        return NextResponse.json(
          toErrorMessage('Erro no banco de dados - Verifique os dados fornecidos'),
          { status: 400 }
        );
      }
    }
    return zodErrorHandler(error);
  }
} 