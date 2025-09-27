import { NextRequest, NextResponse } from 'next/server';
import { getAllTopics, createTopic } from '@/backend/services/topic';
import { createTopicSchema } from '@/backend/schemas';
import { blockForbiddenRequests, returnInvalidDataErrors, toErrorMessage, validBody, zodErrorHandler } from '@/utils';
import type { AllowedRoutes } from '@/types';

const allowedRoles: AllowedRoutes = {
  POST: ["SUPER_ADMIN", "ADMIN"]
}

export async function GET() {
  try {
    const topics = await getAllTopics();
    return NextResponse.json(topics, { status: 200 });
  } catch {
    return NextResponse.json(
      toErrorMessage('Falha ao buscar tópicos'),
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
    const validationResult = createTopicSchema.safeParse(body);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }
    const validatedData = validationResult.data;
    const topic = await createTopic(validatedData);
    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        if (error.message.includes('slug')) {
          return NextResponse.json(
            toErrorMessage('Um tópico com esse slug já existe'),
            { status: 409 }
          );
        }
        return NextResponse.json(
          toErrorMessage('Um tópico com esses dados já existe'),
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