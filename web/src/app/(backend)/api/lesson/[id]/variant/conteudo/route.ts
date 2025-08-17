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

// Get all content pages for a lesson
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validationResult = idSchema.safeParse(id);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'ID inválido', details: validationResult.error.errors },
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

    // Get content pages with their blocks
    const contentPages = await prisma.contentPage.findMany({
      where: { lessonId: id },
      include: {
        contentBlocks: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(contentPages, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return zodErrorHandler(error);
  }
}

// Create a new content page for a lesson
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
    const validationResult = idSchema.safeParse(id);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'ID inválido', details: validationResult.error.errors },
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

    const body = await request.json();
    const { name, order } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Nome da página é obrigatório' },
        { status: 400 }
      );
    }

    // Get the current max order for this lesson
    const maxOrder = await prisma.contentPage.aggregate({
      where: { lessonId: id },
      _max: { order: true },
    });
    
    const newOrder = order ?? (maxOrder._max.order ?? 0) + 1;

    const contentPage = await prisma.contentPage.create({
      data: {
        name,
        order: newOrder,
        lessonId: id,
      },
      include: {
        contentBlocks: true
      }
    });

    return NextResponse.json(contentPage, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return zodErrorHandler(error);
  }
} 