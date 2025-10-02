import { NextRequest, NextResponse } from 'next/server';
import { getAllUniversities, createUniversity } from '@/backend/services/university';
import { createUniversitySchema } from '@/backend/schemas';
import { blockForbiddenRequests, returnInvalidDataErrors, toErrorMessage, validBody, zodErrorHandler } from '@/utils';
import type { AllowedRoutes } from '@/types';

const allowedRoles: AllowedRoutes = {
  POST: ["SUPER_ADMIN", "ADMIN"]
}

export async function GET() {
  try {
    const universities = await getAllUniversities();
    return NextResponse.json(universities, { status: 200 });
  } catch {
    return NextResponse.json(
      toErrorMessage('Falha ao buscar universidades'),
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
    const validationResult = createUniversitySchema.safeParse(body);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }
    const validatedData = validationResult.data;
    const university = await createUniversity(validatedData);
    return NextResponse.json(university, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          toErrorMessage('Uma universidade com esses dados já existe'),
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