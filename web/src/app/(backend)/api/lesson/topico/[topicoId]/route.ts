import { NextRequest, NextResponse } from 'next/server';
import { getLessonsByTopicoId, removeLessonFromTopico } from '@/backend/services/lesson';
import { idSchema } from '@/backend/schemas';
import { blockForbiddenRequests, zodErrorHandler } from '@/utils';
import { AllowedRoutes } from '@/types';

const allowedRoles: AllowedRoutes = {
    DELETE: ["SUPER_ADMIN", "ADMIN"]
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ topicoId: string }> }
) {
  try {
    const { topicoId } = await params;
    const validationResult = idSchema.safeParse(topicoId);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'ID do tópico inválido', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const lessons = await getLessonsByTopicoId(topicoId);
    return NextResponse.json(lessons, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return zodErrorHandler(error);
  }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { topicoId: string } }
) {
    try {
        const forbidden = await blockForbiddenRequests(request, allowedRoles.DELETE);
        if (forbidden) {
            return forbidden;
        }

        const { topicoId } = params;
        const topicoIdValidation = idSchema.safeParse(topicoId);
        if (!topicoIdValidation.success) {
            return NextResponse.json({ error: 'ID do tópico inválido' }, { status: 400 });
        }
        
        const { searchParams } = new URL(request.url);
        const lessonId = searchParams.get('lessonId');
        if (!lessonId) {
            return NextResponse.json({ error: 'ID da lição é obrigatório' }, { status: 400 });
        }
        
        const lessonIdValidation = idSchema.safeParse(lessonId);
        if (!lessonIdValidation.success) {
            return NextResponse.json({ error: 'ID da lição inválido' }, { status: 400 });
        }

        await removeLessonFromTopico(lessonId, topicoId);
        return NextResponse.json({ message: 'Lição desvinculada com sucesso' }, { status: 200 });
    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        if (error instanceof Error && error.message.includes('not found')) {
            return NextResponse.json({ error: 'Relação não encontrada' }, { status: 404 });
        }
        return zodErrorHandler(error);
    }
} 