import { NextRequest, NextResponse } from 'next/server';
import { getCursosByMateriaId } from '@/backend/services/curso';
import { idSchema } from '@/backend/schemas';
import { zodErrorHandler } from '@/utils';
import { createCursoMateriaRelacionada } from '@/backend/services/curso';
import { blockForbiddenRequests } from '@/utils';
import type { AllowedRoutes } from '@/types';

const allowedRoles: AllowedRoutes = {
  POST: ["SUPER_ADMIN", "ADMIN"]
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ materiaId: string }> }
) {
  try {
    const { materiaId } = await params;

    const validationResult = idSchema.safeParse(materiaId);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'ID de matéria inválido', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const cursos = await getCursosByMateriaId(materiaId);
    if (!cursos || cursos.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum curso encontrado para esta matéria' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(cursos, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return zodErrorHandler(error);
  }
} 

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ materiaId: string }> }
) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.POST);
    if (forbidden) {
      return forbidden;
    }
    const { materiaId } = await params;
    const validationResult = idSchema.safeParse(materiaId);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'ID de matéria inválido', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    const body = await request.json();

    const { cursoId } = body;
    const cursoIdValidation = idSchema.safeParse(cursoId);
    if (!cursoIdValidation.success) {
      return NextResponse.json(
        { error: 'ID de curso inválido', details: cursoIdValidation.error.errors },
        { status: 400 }
      );
    }

    const relation = await createCursoMateriaRelacionada(cursoId, materiaId);
    return NextResponse.json(relation, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Esta relação já existe' },
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