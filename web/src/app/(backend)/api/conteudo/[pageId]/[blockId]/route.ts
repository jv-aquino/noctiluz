import { NextRequest, NextResponse } from 'next/server';
import type { AllowedRoutes } from '@/types';
import { getLessonById } from '@/backend/services/lesson';
import { idSchema } from '@/backend/schemas';
import { blockForbiddenRequests, returnInvalidDataErrors, toErrorMessage, validBody, zodErrorHandler } from '@/utils';
import { deleteContentBlock, getContentBlock, getContentPage, updateContentBlock } from '@/app/(backend)/services/conteudo';

const allowedRoles: AllowedRoutes = {
  GET: ["SUPER_ADMIN", "ADMIN"],
  PATCH: ["SUPER_ADMIN", "ADMIN"],
  DELETE: ["SUPER_ADMIN", "ADMIN"]
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string; blockId: string }> }
) {
  try {
    const { pageId, blockId } = await params;
    
    const pageValidation = idSchema.safeParse(pageId);
    const blockValidation = idSchema.safeParse(blockId);
    
    if (!pageValidation.success) {
      return returnInvalidDataErrors(pageValidation);
    }
    if (!blockValidation.success) {
      return returnInvalidDataErrors(blockValidation);
    }
    
    const searchParams = request.nextUrl.searchParams;
  
    const unvalidatedLessonId = searchParams.get('lessonId');
    
    const lessonValidation = idSchema.safeParse(unvalidatedLessonId);

    if (!lessonValidation.success) {
      return returnInvalidDataErrors(lessonValidation);
    } 
    const lessonId = lessonValidation.data;

    const lesson = await getLessonById(lessonId);
    if (!lesson) {
      return NextResponse.json(
        toErrorMessage('Lição não encontrada'),
        { status: 404 }
      );
    }

    // Verify the page belongs to this lesson
    const page = await getContentPage({ lessonId, pageId });

    if (!page) {
      return NextResponse.json(
        toErrorMessage('Página de conteúdo não encontrada'),
        { status: 404 }
      );
    }

    const contentBlock = await getContentBlock({ blockId, pageId });

    if (!contentBlock) {
      return NextResponse.json(
        toErrorMessage('Bloco de conteúdo não encontrado'),
        { status: 404 }
      );
    }

    return NextResponse.json(contentBlock, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return zodErrorHandler(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string; blockId: string }> }
) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.PATCH);
    if (forbidden) {
      return forbidden;
    }

    const { pageId, blockId } = await params;
    
    const pageValidation = idSchema.safeParse(pageId);
    const blockValidation = idSchema.safeParse(blockId);

    const bodyOrError = await validBody(request);
    if (bodyOrError instanceof NextResponse) return bodyOrError;
    const { ...rest } = bodyOrError;

    if (!pageValidation.success || !blockValidation.success) {
      return NextResponse.json(
        toErrorMessage('ID inválido'),
        { status: 400 }
      );
    }

    const page = await getContentPage({ pageId });

    if (!page) {
      return NextResponse.json(
        toErrorMessage('Página de conteúdo não encontrada'),
        { status: 404 }
      );
    }

    const existingBlock = await getContentBlock({ blockId, pageId });

    if (!existingBlock) {
      return NextResponse.json(
        toErrorMessage('Bloco de conteúdo não encontrado'),
        { status: 404 }
      );
    }

    const { 
      type, 
      markdown, 
      videoUrl, 
      metadata, 
      componentType, 
      componentPath, 
      componentProps, 
      exerciseData,
      order,
      archived 
    } = rest;

    // Validate type if provided
    if (type && !['MARKDOWN', 'VIDEO', 'INTERACTIVE_COMPONENT', 'EXERCISE', 'SIMULATION', 'ASSESSMENT'].includes(type)) {
      return NextResponse.json(
        toErrorMessage('Tipo de conteúdo inválido'),
        { status: 400 }
      );
    }

    const updatedBlock = await updateContentBlock({ blockId, 
      data: {
        ...(type && { type }),
        ...(markdown !== undefined && { markdown }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(metadata !== undefined && { metadata }),
        ...(componentType !== undefined && { componentType }),
        ...(componentPath !== undefined && { componentPath }),
        ...(componentProps !== undefined && { componentProps }),
        ...(exerciseData !== undefined && { exerciseData }),
        ...(order !== undefined && { order }),
        ...(archived !== undefined && { archived }),
      }
    });

    return NextResponse.json(updatedBlock, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return zodErrorHandler(error);
  }
}

// Delete a content block
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string; blockId: string }> }
) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.DELETE);
    if (forbidden) {
      return forbidden;
    }

    const { pageId, blockId } = await params;
    
    const pageValidation = idSchema.safeParse(pageId);
    const blockValidation = idSchema.safeParse(blockId);

    const bodyOrErr = await validBody(request);
    if (bodyOrErr instanceof NextResponse) return bodyOrErr;
    const { lessonId } = bodyOrErr;
    const lessonValidation = idSchema.safeParse(lessonId);

    if (!lessonValidation.success || !pageValidation.success || !blockValidation.success) {
      return NextResponse.json(
        toErrorMessage('ID(s) inválido'),
        { status: 400 }
      );
    }

    const lesson = await getLessonById(lessonId);
    if (!lesson) {
      return NextResponse.json(
        toErrorMessage('Lição não encontrada'),
        { status: 404 }
      );
    }

    // Verify the page belongs to this lesson
    const page = await getContentPage({ lessonId, pageId });

    if (!page) {
      return NextResponse.json(
        toErrorMessage('Página de conteúdo não encontrada'),
        { status: 404 }
      );
    }

    const existingBlock = await getContentBlock({ blockId, pageId });

    if (!existingBlock) {
      return NextResponse.json(
        toErrorMessage('Bloco de conteúdo não encontrado'),
        { status: 404 }
      );
    }

    await deleteContentBlock({ blockId });

    return NextResponse.json({ message: 'Bloco de conteúdo excluído com sucesso' }, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return zodErrorHandler(error);
  }
} 