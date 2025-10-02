import { NextRequest, NextResponse } from 'next/server';
import { getAllExercises, createExercise } from '@/backend/services/exercise';
import { createExerciseSchema, exerciseQuerySchema } from '@/backend/schemas';
import { blockForbiddenRequests, returnInvalidDataErrors, toErrorMessage, validBody, zodErrorHandler } from '@/utils';
import type { AllowedRoutes } from '@/types';

const allowedRoles: AllowedRoutes = {
  POST: ["SUPER_ADMIN", "ADMIN"]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      name: searchParams.get('name'),
      universityId: searchParams.get('universityId'),
      minDifficulty: searchParams.get('minDifficulty'),
      maxDifficulty: searchParams.get('maxDifficulty'),
      type: searchParams.get('type'),
      archived: searchParams.get('archived'),
    };

    // Remove null values
    const cleanParams = Object.fromEntries(
      Object.entries(queryParams).filter(([, value]) => value !== null)
    );

    const validationResult = exerciseQuerySchema.safeParse(cleanParams);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const validatedParams = validationResult.data;
    const result = await getAllExercises(validatedParams);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return NextResponse.json(
      toErrorMessage('Falha ao buscar exercícios'),
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
    const validationResult = createExerciseSchema.safeParse(body);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }
    const validatedData = validationResult.data;
    const exercise = await createExercise(validatedData);
    return NextResponse.json(exercise, { status: 201 });
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