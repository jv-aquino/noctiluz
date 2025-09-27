import { NextRequest, NextResponse } from 'next/server';
import { getCourseById, deleteCourse, updateCourse, setCourseSubjects } from '@/app/(backend)/services/course';
import { idSchema, patchCourseSchema } from '@/backend/schemas';
import { blockForbiddenRequests, returnInvalidDataErrors, toErrorMessage, zodErrorHandler } from '@/utils';
import type { AllowedRoutes } from '@/types';

const allowedRoles: AllowedRoutes = {
  DELETE: ["SUPER_ADMIN", "ADMIN"],
  PATCH: ["SUPER_ADMIN", "ADMIN"]
}

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

    const course = await getCourseById(id);
    if (!course) {
      return NextResponse.json(
        toErrorMessage('Curso não encontrado'),
        { status: 404 }
      );
    }

    return NextResponse.json(course, { status: 200 });
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
    const course = await getCourseById(id);
    if (!course) {
      return NextResponse.json(
        toErrorMessage('Curso não encontrado'),
        { status: 404 }
      );
    }
    await deleteCourse(id);
    return NextResponse.json(course, { status: 200 });
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
    const existingCourse = await getCourseById(id);
    if (!existingCourse) {
      return NextResponse.json(
        toErrorMessage('Curso não encontrado'),
        { status: 404 }
      );
    }
    const body = await request.json();
    const validationDataResult = patchCourseSchema.safeParse(body);
    if (!validationDataResult.success) {
      return returnInvalidDataErrors(validationDataResult.error);
    }
    const validatedData = validationDataResult.data;
    const course = await updateCourse(id, validatedData);
    if (Array.isArray(body.materiaIds)) {
      await setCourseSubjects(id, body.materiaIds);
    }
    return NextResponse.json(course, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        if (error.message.includes('slug')) {
          return NextResponse.json(
            toErrorMessage('Um curso com esse slug já existe'),
            { status: 409 }
          );
        }
        return NextResponse.json(
          toErrorMessage('Um curso com esses dados já existe'),
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