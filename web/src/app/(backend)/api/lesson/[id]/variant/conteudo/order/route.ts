import { NextRequest, NextResponse } from 'next/server';
import { blockForbiddenRequests, returnInvalidDataErrors, validBody, zodErrorHandler } from '@/utils';
import type { AllowedRoutes } from '@/types';
import { idSchema, reorderConteudoPagesSchema } from '@/backend/schemas';
import { reorderContentPages } from '@/backend/services/lesson';

const allowedRoles: AllowedRoutes = {
  PATCH: ["SUPER_ADMIN", "ADMIN"]
};

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.PATCH);
    if (forbidden) {
      return forbidden;
    }

    const { id } = await params;
    const lessonIdValidation = idSchema.safeParse(id);
    if (!lessonIdValidation.success) {
      return NextResponse.json({ error: 'ID da lição inválido' }, { status: 400 });
    }
    const lessonId = lessonIdValidation.data;

    const body = await validBody(request);
    const validationResult = reorderConteudoPagesSchema.safeParse(body);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult);
    }
    const { pageIds } = validationResult.data;

    await reorderContentPages(lessonId, pageIds);

    return NextResponse.json({ message: 'Ordem das páginas atualizada' }, { status: 200 });
  } catch (error) {
    return zodErrorHandler(error);
  }
} 