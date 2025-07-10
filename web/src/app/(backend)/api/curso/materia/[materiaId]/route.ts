import { NextRequest, NextResponse } from 'next/server';
import { getCursosByMateriaId } from '@/backend/services/curso';
import { idSchema } from '@/backend/schemas';
import { zodErrorHandler } from '@/utils';

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