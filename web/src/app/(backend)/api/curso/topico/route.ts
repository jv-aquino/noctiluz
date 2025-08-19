import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/backend/services/db';
import { z } from 'zod';
import { returnInvalidDataErrors, toErrorMessage } from '@/utils';

const bodySchema = z.object({
  cursoId: z.string(),
  topicoId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = bodySchema.safeParse(body);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult);
    }
    const { cursoId, topicoId } = validationResult.data;
    // Find the current max order for this curso
    const maxOrder = await prisma.cursoTopico.aggregate({
      where: { cursoId },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? 0) + 1;
    const relation = await prisma.cursoTopico.create({
      data: { cursoId, topicoId, order },
    });
    return NextResponse.json(relation, { status: 201 });
  } catch {
    return NextResponse.json(toErrorMessage('Erro ao associar tópico ao curso'), { status: 500 });
  }
} 