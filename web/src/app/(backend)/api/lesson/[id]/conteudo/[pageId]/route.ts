import { NextRequest, NextResponse } from 'next/server';
import { getLessonById } from '@/backend/services/lesson';
import { idSchema } from '@/backend/schemas';
import { blockForbiddenRequests, zodErrorHandler } from '@/utils';
import type { AllowedRoutes } from '@/types';
import prisma from '@/backend/services/db';

const allowedRoles: AllowedRoutes = {
  GET: ["SUPER_ADMIN", "ADMIN"],
  POST: ["SUPER_ADMIN", "ADMIN"],
  PATCH: ["SUPER_ADMIN", "ADMIN"],
  DELETE: ["SUPER_ADMIN", "ADMIN"]
};

// Get content blocks for a specific page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  try {
    const { id, pageId } = await params;
    
    const lessonValidation = idSchema.safeParse(id);
    const pageValidation = idSchema.safeParse(pageId);
    
    if (!lessonValidation.success || !pageValidation.success) {
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

    const contentBlocks = await prisma.contentBlock.findMany({
      where: { pageId },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(contentBlocks, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return zodErrorHandler(error);
  }
}

// Create a new content block
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.POST);
    if (forbidden) {
      return forbidden;
    }

    const { id, pageId } = await params;
    
    const lessonValidation = idSchema.safeParse(id);
    const pageValidation = idSchema.safeParse(pageId);
    
    if (!lessonValidation.success || !pageValidation.success) {
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
      order 
    } = body;

    if (!type || !['MARKDOWN', 'VIDEO', 'INTERACTIVE_COMPONENT', 'EXERCISE', 'SIMULATION', 'ASSESSMENT'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de conteúdo inválido' },
        { status: 400 }
      );
    }

    // Get the current max order for this page
    const maxOrder = await prisma.contentBlock.aggregate({
      where: { pageId },
      _max: { order: true },
    });
    
    const newOrder = order ?? (maxOrder._max.order ?? 0) + 1;

    const contentBlock = await prisma.contentBlock.create({
      data: {
        type,
        order: newOrder,
        markdown: markdown || null,
        videoUrl: videoUrl || null,
        metadata: metadata || null,
        componentType: componentType || null,
        componentPath: componentPath || null,
        componentProps: componentProps || null,
        exerciseData: exerciseData || null,
        pageId,
      }
    });

    return NextResponse.json(contentBlock, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return zodErrorHandler(error);
  }
} 