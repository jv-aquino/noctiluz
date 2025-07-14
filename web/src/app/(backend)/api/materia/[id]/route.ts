import { NextRequest, NextResponse } from 'next/server'
import { deleteMateria, getMateriaById, updateMateria } from '@/backend/services/materia'
import { idSchema, patchMateriaSchema } from '@/backend/schemas';
import { blockForbiddenRequests, returnInvalidDataErrors, validBody, zodErrorHandler } from '@/utils';
import { AllowedRoutes } from '@/types';

const allowedRoles: AllowedRoutes = {
  DELETE: ["SUPER_ADMIN", "ADMIN"],
  PATCH: ["SUPER_ADMIN", "ADMIN"]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const validationResult = idSchema.safeParse(id);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'ID inválido', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const materia = await getMateriaById(id);

    if (!materia) {
      return NextResponse.json(
        { error: 'Matéria não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(materia, { status: 200 })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    return zodErrorHandler(error);
  }
}

export async function DELETE (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.DELETE);

    if (forbidden) {
      return forbidden;
    }
    
    const { id } = await params;
    
    const validationResult = idSchema.safeParse(id);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'ID inválido', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const materia = await getMateriaById(id);
    if (!materia) {
      return NextResponse.json(
        { error: 'Matéria não encontrada' },
        { status: 404 }
      )
    }

    // Delete S3 file if it exists
    if (materia.imgUrl && materia.imgUrl.includes('s3.amazonaws.com')) {
      try {
        const uploadResponse = await fetch(`${request.nextUrl.origin}/api/upload`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '',
          },
          body: JSON.stringify({ fileUrl: materia.imgUrl })
        });

        if (!uploadResponse.ok) {
          console.error('Failed to delete S3 file:', await uploadResponse.text());
        } else {
          console.log('S3 file deleted successfully');
        }
      } catch (s3Error) {
        console.error('Error deleting S3 file:', s3Error);
      }
    }

    await deleteMateria(id)

    return NextResponse.json(materia, { status: 200 })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    
    if (error instanceof Error) {
      if (error.message.includes('Prisma')) {
        return NextResponse.json(
          { error: 'Erro no banco de dados - Verifique os dados fornecidos' },
          { status: 400 }
        )
      }
    }

    return zodErrorHandler(error);
  }
}

export async function PATCH (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.PATCH);

    if (forbidden) {
      return forbidden;
    }
    
    const { id } = await params;
    
    const validationResult = idSchema.safeParse(id);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'ID inválido', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const existingMateria = await getMateriaById(id);
    if (!existingMateria) {
      return NextResponse.json(
        { error: 'Matéria não encontrada' },
        { status: 404 }
      )
    }

    const body = await validBody(request);
    const validationDataResult = patchMateriaSchema.safeParse(body);
    
    if (!validationDataResult.success) {
      return returnInvalidDataErrors(validationDataResult);
    }

    const validatedData = validationDataResult.data;
    const materia = await updateMateria(id, validatedData);

    return NextResponse.json(materia, { status: 200 })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        if (error.message.includes('slug')) {
          return NextResponse.json(
            { error: 'Uma matéria com esse slug já existe' },
            { status: 409 }
          )
        }
        return NextResponse.json(
          { error: 'Uma matéria com esses dados já existe' },
          { status: 409 }
        )
      }
      
      if (error.message.includes('Prisma')) {
        return NextResponse.json(
          { error: 'Erro no banco de dados - Verifique os dados fornecidos' },
          { status: 400 }
        )
      }
    }

    return zodErrorHandler(error);
  }
}