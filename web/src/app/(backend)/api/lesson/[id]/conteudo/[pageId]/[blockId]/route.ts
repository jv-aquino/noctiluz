import { NextRequest, NextResponse } from 'next/server';
import { getLessonById } from '@/backend/services/lesson';
import { idSchema } from '@/backend/schemas';
import { blockForbiddenRequests, zodErrorHandler } from '@/utils';
import type { AllowedRoutes } from '@/types';
import prisma from '@/backend/services/db';

const allowedRoles: AllowedRoutes = {
  GET: ["SUPER_ADMIN", "ADMIN"],
  PATCH: ["SUPER_ADMIN", "ADMIN"],
  DELETE: ["SUPER_ADMIN", "ADMIN"]
};

// Get a specific content block
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string; blockId: string }> }
) {
  try {
    const { id, pageId, blockId } = await params;
    
    const lessonValidation = idSchema.safeParse(id);
    const pageValidation = idSchema.safeParse(pageId);
    const blockValidation = idSchema.safeParse(blockId);
    
    if (!lessonValidation.success || !pageValidation.success || !blockValidation.success) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const lesson = await getLessonById(id);
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lição não encontrada' },
        { status: 404 }
      );
    }

    // Verify the page belongs to this lesson
    const page = await prisma.contentPage.findFirst({
      where: { 
        id: pageId,
        lessonId: id 
      }
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Página de conteúdo não encontrada' },
        { status: 404 }
      );
    }

    const contentBlock = await prisma.contentBlock.findFirst({
      where: { 
        id: blockId,
        pageId 
      }
    });

    if (!contentBlock) {
      return NextResponse.json(
        { error: 'Bloco de conteúdo não encontrado' },
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

// Update a content block
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string; blockId: string }> }
) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.PATCH);
    if (forbidden) {
      return forbidden;
    }

    const { id, pageId, blockId } = await params;
    
    const lessonValidation = idSchema.safeParse(id);
    const pageValidation = idSchema.safeParse(pageId);
    const blockValidation = idSchema.safeParse(blockId);
    
    if (!lessonValidation.success || !pageValidation.success || !blockValidation.success) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const lesson = await getLessonById(id);
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lição não encontrada' },
        { status: 404 }
      );
    }

    // Verify the page belongs to this lesson
    const page = await prisma.contentPage.findFirst({
      where: { 
        id: pageId,
        lessonId: id 
      }
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Página de conteúdo não encontrada' },
        { status: 404 }
      );
    }

    const existingBlock = await prisma.contentBlock.findFirst({
      where: { 
        id: blockId,
        pageId 
      }
    });

    if (!existingBlock) {
      return NextResponse.json(
        { error: 'Bloco de conteúdo não encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
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
    } = body;

    // Validate type if provided
    if (type && !['MARKDOWN', 'VIDEO', 'INTERACTIVE_COMPONENT', 'EXERCISE', 'SIMULATION', 'ASSESSMENT'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de conteúdo inválido' },
        { status: 400 }
      );
    }

    const updatedBlock = await prisma.contentBlock.update({
      where: { id: blockId },
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

    const { id, pageId, blockId } = await params;
    
    const lessonValidation = idSchema.safeParse(id);
    const pageValidation = idSchema.safeParse(pageId);
    const blockValidation = idSchema.safeParse(blockId);
    
    if (!lessonValidation.success || !pageValidation.success || !blockValidation.success) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const lesson = await getLessonById(id);
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lição não encontrada' },
        { status: 404 }
      );
    }

    // Verify the page belongs to this lesson
    const page = await prisma.contentPage.findFirst({
      where: { 
        id: pageId,
        lessonId: id 
      }
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Página de conteúdo não encontrada' },
        { status: 404 }
      );
    }

    const existingBlock = await prisma.contentBlock.findFirst({
      where: { 
        id: blockId,
        pageId 
      }
    });

    if (!existingBlock) {
      return NextResponse.json(
        { error: 'Bloco de conteúdo não encontrado' },
        { status: 404 }
      );
    }

    await prisma.contentBlock.delete({
      where: { id: blockId }
    });

    return NextResponse.json({ message: 'Bloco de conteúdo excluído com sucesso' }, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return zodErrorHandler(error);
  }
} 