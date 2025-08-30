import { NextRequest, NextResponse } from 'next/server';
import { getAllCursos, createCurso } from '@/backend/services/curso';
import { createCursoSchema } from '@/backend/schemas/curso.schema';
import { blockForbiddenRequests, returnInvalidDataErrors, toErrorMessage, validBody, zodErrorHandler } from '@/utils';
import type { AllowedRoutes } from '@/types';

const allowedRoles: AllowedRoutes = {
  POST: ["SUPER_ADMIN", "ADMIN"]
}

export async function GET() {
  try {
    const cursos = await getAllCursos();
    return NextResponse.json(cursos, { status: 200 });
  } catch {
    return NextResponse.json(
      toErrorMessage('Falha ao buscar cursos'),
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
    const validationResult = createCursoSchema.safeParse(body);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }
    const validatedData = validationResult.data;

    const curso = await createCurso(validatedData);
    return NextResponse.json(curso, { status: 201 });
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