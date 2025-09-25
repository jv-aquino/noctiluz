import { NextRequest, NextResponse } from 'next/server';
import { getLessonsByTopicId, removeLessonFromTopic } from '@/backend/services/lesson';
import { idSchema } from '@/backend/schemas';
import { blockForbiddenRequests, returnInvalidDataErrors, toErrorMessage, zodErrorHandler } from '@/utils';
import { AllowedRoutes } from '@/types';

const allowedRoles: AllowedRoutes = {
    DELETE: ["SUPER_ADMIN", "ADMIN"]
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId } = await params;
    const validationResult = idSchema.safeParse(topicId);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error)
    }

    const lessons = await getLessonsByTopicId(topicId);
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
    { params }: { params: Promise<{ topicId: string }> }
) {
    try {
        const forbidden = await blockForbiddenRequests(request, allowedRoles.DELETE);
        if (forbidden) {
            return forbidden;
        }

        const { topicId } = await params;
        const topicIdValidation = idSchema.safeParse(topicId);
        if (!topicIdValidation.success) {
            return returnInvalidDataErrors(topicIdValidation.error);
        }
        
        const { searchParams } = new URL(request.url);
        const lessonId = searchParams.get('lessonId');
        if (!lessonId) {
            return NextResponse.json(toErrorMessage('ID da lição é obrigatório'), { status: 400 });
        }
        
        const lessonIdValidation = idSchema.safeParse(lessonId);
        if (!lessonIdValidation.success) {
            return returnInvalidDataErrors(lessonIdValidation.error);
        }

        await removeLessonFromTopic(lessonId, topicId);
        return NextResponse.json({ message: 'Lição desvinculada com sucesso' }, { status: 200 });
    } catch (error) {
        if (error instanceof NextResponse) {
            return error;
        }
        if (error instanceof Error && error.message.includes('not found')) {
            return NextResponse.json(toErrorMessage('Relação não encontrada'), { status: 404 });
        }
        return zodErrorHandler(error);
    }
} 