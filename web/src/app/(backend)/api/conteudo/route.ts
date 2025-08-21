import { NextRequest, NextResponse } from 'next/server';
import { idSchema } from '@/backend/schemas';
import { blockForbiddenRequests, returnInvalidDataErrors, toErrorMessage, validBody, zodErrorHandler } from '@/utils';
import type { AllowedRoutes } from '@/types';
import { useSearchParams } from 'next/navigation';
import { getLessonById } from '@/backend/services/lesson';
import { createContentPage, getContentPages, getMaxOrder } from '@/backend/services/conteudo';

const allowedRoles: AllowedRoutes = {
  GET: ["SUPER_ADMIN", "ADMIN"],
  POST: ["SUPER_ADMIN", "ADMIN"],
  PATCH: ["SUPER_ADMIN", "ADMIN"],
  DELETE: ["SUPER_ADMIN", "ADMIN"]
};

// Get all content pages for a lesson
export async function GET(
  request: NextRequest,
) {
  try {
    const searchParams = useSearchParams()
 
    const unvalidatedLessonId = searchParams.get('lessonId');

    const validationResult = idSchema.safeParse(unvalidatedLessonId);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult);
    }
    const lessonId = validationResult.data;

    const lesson = await getLessonById(lessonId!);
    if (!lesson) {
      return NextResponse.json(
        toErrorMessage('Lição não encontrada'),
        { status: 404 }
      );
    }

    const contentPages = await getContentPages({ lessonId });

    return NextResponse.json(contentPages, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return zodErrorHandler(error);
  }
}

// Create a new content page for a lesson
export async function POST(
  request: NextRequest
) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.POST);
    if (forbidden) {
      return forbidden;
    }
    
    const { lessonId } = await validBody(request);

    const validationResult = idSchema.safeParse(lessonId);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult);
    }

    const lesson = await getLessonById(lessonId);
    if (!lesson) {
      return NextResponse.json(
        toErrorMessage('Lição não encontrada'),
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, order } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        toErrorMessage('Nome da página é obrigatório'),
        { status: 400 }
      );
    }

    // Get the current max order for this lesson
    const maxOrder = await getMaxOrder({ lessonId });
    
    const newOrder = order ?? (maxOrder._max.order ?? 0) + 1;

    const contentPage = await createContentPage({
      name,
      order: newOrder,
      lessonId,
    });

    return NextResponse.json(contentPage, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return zodErrorHandler(error);
  }
} 