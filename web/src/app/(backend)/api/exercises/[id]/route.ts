import { NextRequest, NextResponse } from 'next/server';
import { getExerciseById, updateExercise, deleteExercise } from '@/backend/services/exercise';
import { idSchema, patchExerciseSchema } from '@/backend/schemas';
import { blockForbiddenRequests, returnInvalidDataErrors, toErrorMessage, validBody, zodErrorHandler } from '@/utils';
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
    const exercise = await getExerciseById(id);
    if (!exercise) {
      return NextResponse.json(
        toErrorMessage('Exercício não encontrado'),
        { status: 404 }
      );
    }
    return NextResponse.json(exercise, { status: 200 });
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
    const existingExercise = await getExerciseById(id);
    if (!existingExercise) {
      return NextResponse.json(
        toErrorMessage('Exercício não encontrado'),
        { status: 404 }
      );
    }
    await deleteExercise(id);
    return NextResponse.json({ message: 'Exercício deletado com sucesso' }, { status: 200 });
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
    const existingExercise = await getExerciseById(id);
    if (!existingExercise) {
      return NextResponse.json(
        toErrorMessage('Exercício não encontrado'),
        { status: 404 }
      );
    }
    const body = await validBody(request);
    const validationDataResult = patchExerciseSchema.safeParse(body);
    if (!validationDataResult.success) {
      return returnInvalidDataErrors(validationDataResult.error);
    }
    const validatedData = validationDataResult.data;
    const updatedExercise = await updateExercise(id, validatedData);
    return NextResponse.json(updatedExercise, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          toErrorMessage('Um exercício com esses dados já existe'),
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