import { NextRequest, NextResponse } from 'next/server';
import { blockForbiddenRequests, returnInvalidDataErrors, validBody, zodErrorHandler } from '@/utils';
import type { AllowedRoutes } from '@/types';
import { idSchema, reorderContentBlocksSchema } from '@/backend/schemas';
import { reorderContentBlocks } from '@/app/(backend)/services/content';

const allowedRoles: AllowedRoutes = {
  PATCH: ["SUPER_ADMIN", "ADMIN"]
};

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.PATCH);
    if (forbidden) {
      return forbidden;
    }

    const { pageId } = await params;

    const pageIdValidation = idSchema.safeParse(pageId);
    if (!pageIdValidation.success) {
        return returnInvalidDataErrors(pageIdValidation.error);
    }
    
    const body = await validBody(request);
    
    const validationResult = reorderContentBlocksSchema.safeParse(body);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }
    const { blockIds } = validationResult.data;

    await reorderContentBlocks(pageId, blockIds);

    return NextResponse.json({ message: 'Ordem dos blocos atualizada' }, { status: 200 });
  } catch (error) {
    return zodErrorHandler(error);
  }
} 