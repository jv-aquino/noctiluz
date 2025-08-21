import { NextRequest, NextResponse } from 'next/server';
import { getLessonById } from '@/backend/services/lesson';
import { idSchema } from '@/backend/schemas';
import { blockForbiddenRequests, returnInvalidDataErrors, toErrorMessage, validBody, zodErrorHandler } from '@/utils';
import type { AllowedRoutes } from '@/types';
import { createContentBlock, getContentBlocks, getContentPage, getMaxOrder } from '@/app/(backend)/services/conteudo';
import { useSearchParams } from 'next/navigation';

const allowedRoles: AllowedRoutes = {
  GET: ["SUPER_ADMIN", "ADMIN"],
  POST: ["SUPER_ADMIN", "ADMIN"],
  PATCH: ["SUPER_ADMIN", "ADMIN"],
  DELETE: ["SUPER_ADMIN", "ADMIN"]
};

// Get content blocks for a specific page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const searchParams = useSearchParams()
  
    const unvalidatedLessonId = searchParams.get('lessonId');
    const lessonValidation = idSchema.safeParse(unvalidatedLessonId);
    if (!lessonValidation.success) {
      return returnInvalidDataErrors(lessonValidation);
    }

    const { pageId } = await params;
    
    const pageValidation = idSchema.safeParse(pageId);
    if (!pageValidation.success) {
      return returnInvalidDataErrors(pageValidation);
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

    const contentBlocks = await getContentBlocks({ pageId });

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
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.POST);
    if (forbidden) {
      return forbidden;
    }

    const { pageId } = await params;
    
    const { lessonId } = await validBody(request);
    const lessonValidation = idSchema.safeParse(lessonId);

    const pageValidation = idSchema.safeParse(pageId);
    
    if (!lessonValidation.success) {
      return returnInvalidDataErrors(lessonValidation);
    }
    if (!pageValidation.success) {
      return returnInvalidDataErrors(pageValidation);
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
        toErrorMessage('Tipo de conteúdo inválido'),
        { status: 400 }
      );
    }

    // Get the current max order for this page
    const maxOrder = await getMaxOrder({ lessonId });
    
    const newOrder = order ?? (maxOrder._max.order ?? 0) + 1;

    const data = {
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
      archived: false,
    }

    const contentBlock = await createContentBlock({ data });

    return NextResponse.json(contentBlock, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return zodErrorHandler(error);
  }
} 