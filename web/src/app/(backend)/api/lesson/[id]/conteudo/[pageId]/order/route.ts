import { NextRequest, NextResponse } from 'next/server';
import { blockForbiddenRequests, returnInvalidDataErrors, validBody, zodErrorHandler } from '@/utils';
import type { AllowedRoutes } from '@/types';
import { idSchema, reorderContentBlocksSchema } from '@/backend/schemas';
import { reorderContentBlocks } from '@/backend/services/lesson';

const allowedRoles: AllowedRoutes = {
  PATCH: ["SUPER_ADMIN", "ADMIN"]
};

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string, pageId: string }> }) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.PATCH);
    if (forbidden) {
      return forbidden;
    }

    const { id, pageId } = await params;

    const lessonIdValidation = idSchema.safeParse(id);
    if (!lessonIdValidation.success) {
      return NextResponse.json({ error: 'ID da lição inválido' }, { status: 400 });
    }

    const pageIdValidation = idSchema.safeParse(pageId);
    if (!pageIdValidation.success) {
        return NextResponse.json({ error: 'ID da página inválido' }, { status: 400 });
    }
    
    const body = await validBody(request);
    const validationResult = reorderContentBlocksSchema.safeParse(body);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult);
    }
    const { blockIds } = validationResult.data;

    await reorderContentBlocks(pageId, blockIds);

    return NextResponse.json({ message: 'Ordem dos blocos atualizada' }, { status: 200 });
  } catch (error) {
    return zodErrorHandler(error);
  }
} 