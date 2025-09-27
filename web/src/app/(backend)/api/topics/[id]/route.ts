import { NextRequest, NextResponse } from 'next/server';
import { getTopicById, deleteTopic, updateTopic } from '@/backend/services/topic';
import { idSchema, patchTopicSchema } from '@/backend/schemas';
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
    const topic = await getTopicById(id);
    if (!topic) {
      return NextResponse.json(
        toErrorMessage('Tópico não encontrado'),
        { status: 404 }
      );
    }
    return NextResponse.json(topic, { status: 200 });
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
    const topic = await getTopicById(id);
    if (!topic) {
      return NextResponse.json(
        toErrorMessage('Tópico não encontrado'),
        { status: 404 }
      );
    }
    await deleteTopic(id);
    return NextResponse.json(topic, { status: 200 });
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
    const existingTopic = await getTopicById(id);
    if (!existingTopic) {
      return NextResponse.json(
        toErrorMessage('Tópico não encontrado'),
        { status: 404 }
      );
    }
    const body = await request.json();
    const validationDataResult = patchTopicSchema.safeParse(body);
    if (!validationDataResult.success) {
      return returnInvalidDataErrors(validationDataResult.error)
    }
    const validatedData = validationDataResult.data;
    const topic = await updateTopic(id, validatedData);
    return NextResponse.json(topic, { status: 200 });
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