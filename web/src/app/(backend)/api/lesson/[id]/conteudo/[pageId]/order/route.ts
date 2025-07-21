import { NextRequest, NextResponse } from 'next/server';
import { blockForbiddenRequests, returnInvalidDataErrors, validBody, zodErrorHandler } from '@/utils';
import type { AllowedRoutes } from '@/types';
import { idSchema, reorderContentBlocksSchema } from '@/backend/schemas';
import { reorderContentBlocks } from '@/backend/services/lesson';

const allowedRoles: AllowedRoutes = {
  PATCH: ["SUPER_ADMIN", "ADMIN"]
};

export async function PATCH(request: NextRequest, { params }: { params: { id: string, pageId: string } }) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.PATCH);
    if (forbidden) {
      return forbidden;
    }

    const lessonIdValidation = idSchema.safeParse(params.id);
    if (!lessonIdValidation.success) {
      return NextResponse.json({ error: 'ID da lição inválido' }, { status: 400 });
    }

    const pageIdValidation = idSchema.safeParse(params.pageId);
    if (!pageIdValidation.success) {
        return NextResponse.json({ error: 'ID da página inválido' }, { status: 400 });
    }
    const pageId = pageIdValidation.data;
    
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