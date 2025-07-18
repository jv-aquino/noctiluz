import { NextRequest, NextResponse } from 'next/server';
import { getAllTopicos, createTopico } from '@/backend/services/topico';
import { createTopicoSchema } from '@/backend/schemas/topico.schema';
import { blockForbiddenRequests, returnInvalidDataErrors, validBody, zodErrorHandler } from '@/utils';
import type { AllowedRoutes } from '@/types';

const allowedRoles: AllowedRoutes = {
  POST: ["SUPER_ADMIN", "ADMIN"]
}

export async function GET() {
  try {
    const topicos = await getAllTopicos();
    return NextResponse.json(topicos, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar tópicos:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar tópicos' },
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
    const validationResult = createTopicoSchema.safeParse(body);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult);
    }
    const validatedData = validationResult.data;
    const topico = await createTopico(validatedData);
    return NextResponse.json(topico, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        if (error.message.includes('slug')) {
          return NextResponse.json(
            { error: 'Um tópico com esse slug já existe' },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: 'Um tópico com esses dados já existe' },
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