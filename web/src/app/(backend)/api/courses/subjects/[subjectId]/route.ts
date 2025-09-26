import { NextRequest, NextResponse } from 'next/server';
import { getCoursesBySubjectId } from '@/backend/services/course';
import { idSchema } from '@/backend/schemas';
import { returnInvalidDataErrors, toErrorMessage, zodErrorHandler } from '@/utils';
import { createCourseSubjectRelation } from '@/backend/services/course';
import { blockForbiddenRequests } from '@/utils';
import type { AllowedRoutes } from '@/types';

const allowedRoles: AllowedRoutes = {
  POST: ["SUPER_ADMIN", "ADMIN"]
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  try {
    const { subjectId } = await params;

    const validationResult = idSchema.safeParse(subjectId);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const courses = await getCoursesBySubjectId(subjectId);
    if (!courses || courses.length === 0) {
      return NextResponse.json(
        toErrorMessage('Nenhum curso encontrado para esta matéria'),
        { status: 404 }
      );
    }
    
    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return zodErrorHandler(error);
  }
} 

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.POST);
    if (forbidden) {
      return forbidden;
    }
    const { subjectId } = await params;
    const validationResult = idSchema.safeParse(subjectId);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }
    const body = await request.json();

    const { cursoId } = body;
    const cursoIdValidation = idSchema.safeParse(cursoId);
    if (!cursoIdValidation.success) {
      return returnInvalidDataErrors(cursoIdValidation.error);
    }

    const relation = await createCourseSubjectRelation(cursoId, subjectId);
    return NextResponse.json(relation, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          toErrorMessage('Esta relação já existe'),
          { status: 409 }
        );
      }
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