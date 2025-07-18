import { NextRequest, NextResponse } from 'next/server';
import { getTopicoById, deleteTopico, updateTopico } from '@/backend/services/topico';
import { idSchema, patchTopicoSchema } from '@/backend/schemas';
import { blockForbiddenRequests, zodErrorHandler } from '@/utils';
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
      return NextResponse.json(
        { error: 'ID inválido', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    const topico = await getTopicoById(id);
    if (!topico) {
      return NextResponse.json(
        { error: 'Tópico não encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(topico, { status: 200 });
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
      return NextResponse.json(
        { error: 'ID inválido', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    const topico = await getTopicoById(id);
    if (!topico) {
      return NextResponse.json(
        { error: 'Tópico não encontrado' },
        { status: 404 }
      );
    }
    await deleteTopico(id);
    return NextResponse.json(topico, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    if (error instanceof Error) {
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
      return NextResponse.json(
        { error: 'ID inválido', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    const existingTopico = await getTopicoById(id);
    if (!existingTopico) {
      return NextResponse.json(
        { error: 'Tópico não encontrado' },
        { status: 404 }
      );
    }
    const body = await request.json();
    const validationDataResult = patchTopicoSchema.safeParse(body);
    if (!validationDataResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationDataResult.error.errors },
        { status: 400 }
      );
    }
    const validatedData = validationDataResult.data;
    const topico = await updateTopico(id, validatedData);
    return NextResponse.json(topico, { status: 200 });
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