import { NextRequest, NextResponse } from 'next/server';
import { getLessonVariants, createLessonVariant } from '@/backend/services/lesson';
import { idSchema, createLessonVariantSchema } from '@/backend/schemas';
import { blockForbiddenRequests, returnInvalidDataErrors, validBody, zodErrorHandler } from '@/utils';
import type { AllowedRoutes } from '@/types';

const allowedRoles: AllowedRoutes = {
  POST: ["SUPER_ADMIN", "ADMIN"]
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validationResult = idSchema.safeParse(id);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'ID da lição inválido', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    const variants = await getLessonVariants(id);
    return NextResponse.json(variants, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return zodErrorHandler(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.POST);
    if (forbidden) {
      return forbidden;
    }
    const { id } = await params;
    const lessonIdValidation = idSchema.safeParse(id);
    if (!lessonIdValidation.success) {
      return NextResponse.json({ error: 'ID da lição inválido' }, { status: 400 });
    }
    const body = await validBody(request);
    const validationResult = createLessonVariantSchema.safeParse(body);
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult);
    }
    const variant = await createLessonVariant(id, validationResult.data);
    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return zodErrorHandler(error);
  }
} 