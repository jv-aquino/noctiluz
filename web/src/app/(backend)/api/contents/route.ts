import { NextRequest, NextResponse } from 'next/server';
import { idSchema } from '@/backend/schemas';
import { blockForbiddenRequests, returnInvalidDataErrors, toErrorMessage, validBody, zodErrorHandler } from '@/utils';
import type { AllowedRoutes } from '@/types';
import { getLessonById } from '@/backend/services/lesson';
import { createContentPage, getContentPages, getMaxOrder } from '@/app/(backend)/services/content';
import { getVariantById } from '../../services/lesson/variant';

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
    const searchParams = request.nextUrl.searchParams
 
    const unvalidatedLessonId = searchParams.get('lessonId');
    const lessonValidationResult = idSchema.safeParse(unvalidatedLessonId);

    const unvalidatedVariantId = searchParams.get('variantId');
    const variantValidationResult = idSchema.safeParse(unvalidatedVariantId);

    if (unvalidatedVariantId && !variantValidationResult.success) {
      return returnInvalidDataErrors(variantValidationResult.error);
    }
    if (unvalidatedLessonId && !lessonValidationResult.success) {
      return returnInvalidDataErrors(lessonValidationResult.error);
    }
    const lessonId = lessonValidationResult.data;
    const variantId = variantValidationResult.data;

    if (!variantId) {
      const lesson = await getLessonById(lessonId!);
      if (!lesson) {
        return NextResponse.json(
          toErrorMessage('Lição não encontrada'),
          { status: 404 }
        );
      }
    } else {
      const variant = await getVariantById({ variantId });
      if (!variant) {
        return NextResponse.json(
          toErrorMessage('Variante não encontrada'),
          { status: 404 }
        );
      }
    }

    const contentPages = await getContentPages({ lessonId, variantId });

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

    const { lessonId, name, order, variantId } = await validBody(request);

    const lessonValidation = idSchema.safeParse(lessonId);

    const variantValidation = idSchema.safeParse(variantId);

    if (!variantId) {
      if (!lessonValidation.success) {
        return returnInvalidDataErrors(lessonValidation.error);
      }

      const lesson = await getLessonById(lessonId!);
      if (!lesson) {
        return NextResponse.json(
          toErrorMessage('Lição não encontrada'),
          { status: 404 }
        );
      }
    } else {
      if (!variantValidation.success) {
        return returnInvalidDataErrors(variantValidation.error);
      }

      const variant = await getVariantById({ variantId });
      if (!variant) {
        return NextResponse.json(
          toErrorMessage('Variante não encontrada'),
          { status: 404 }
        );
      }
    }

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
      variantId
    });

    return NextResponse.json(contentPage, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return zodErrorHandler(error);
  }
} 