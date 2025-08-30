import { NextRequest, NextResponse } from 'next/server';
import { blockForbiddenRequests, returnInvalidDataErrors, validBody, zodErrorHandler } from '@/utils';
import type { AllowedRoutes } from '@/types';
import { reorderConteudoPagesSchema } from '@/backend/schemas';
import { reorderContentPages } from '@/backend/services/conteudo';

const allowedRoles: AllowedRoutes = {
  PATCH: ["SUPER_ADMIN", "ADMIN"]
};

export async function PATCH(request: NextRequest) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.PATCH);
    if (forbidden) {
      return forbidden;
    }

    const body = await validBody(request);
    const validationResult = reorderConteudoPagesSchema.safeParse(body);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }
    const { pageIds, lessonId, variantId } = validationResult.data;

    await reorderContentPages({ lessonId, pageIds, variantId });

    return NextResponse.json({ message: 'Ordem das páginas atualizada' }, { status: 200 });
  } catch (error) {
    return zodErrorHandler(error);
  }
} 