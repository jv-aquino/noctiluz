import { NextRequest, NextResponse } from 'next/server'
import { deleteSubject, getSubjectById, updateSubject } from '@/app/(backend)/services/subject'
import { idSchema, patchSubjectSchema } from '@/backend/schemas';
import { blockForbiddenRequests, returnInvalidDataErrors, toErrorMessage, validBody, zodErrorHandler } from '@/utils';
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
      return returnInvalidDataErrors(validationResult.error);
    }

    const subject = await getSubjectById(id);

    if (!subject) {
      return NextResponse.json(
        { error: 'Matéria não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(subject, { status: 200 })
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
      return returnInvalidDataErrors(validationResult.error);
    }

    const subject = await getSubjectById(id);
    if (!subject) {
      return NextResponse.json(
        toErrorMessage('Matéria não encontrada'),
        { status: 404 }
      )
    }

    // Delete S3 file if it exists
    if (subject.imageUrl && subject.imageUrl.includes('s3.amazonaws.com')) {
      try {
        const uploadResponse = await fetch(`${request.nextUrl.origin}/api/uploads`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '',
          },
          body: JSON.stringify({ fileUrl: subject.imageUrl, folder: 'subjects' })
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

    await deleteSubject(id)

    return NextResponse.json(subject, { status: 200 })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    
    if (error instanceof Error) {
      if (error.message.includes('Prisma')) {
        return NextResponse.json(
          toErrorMessage('Erro no banco de dados - Verifique os dados fornecidos'),
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
      return returnInvalidDataErrors(validationResult.error)
    }

    const existingSubject = await getSubjectById(id);
    if (!existingSubject) {
      return NextResponse.json(
        toErrorMessage('Matéria não encontrada'),
        { status: 404 }
      )
    }

    const body = await validBody(request);
    const validationDataResult = patchSubjectSchema.safeParse(body);
    
    if (!validationDataResult.success) {
      return returnInvalidDataErrors(validationDataResult.error);
    }

    const validatedData = validationDataResult.data;
    const subject = await updateSubject(id, validatedData);

    return NextResponse.json(subject, { status: 200 })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        if (error.message.includes('slug')) {
          return NextResponse.json(
            toErrorMessage('Uma matéria com esse slug já existe'),
            { status: 409 }
          )
        }
        return NextResponse.json(
          toErrorMessage('Uma matéria com esses dados já existe'),
          { status: 409 }
        )
      }
      
      if (error.message.includes('Prisma')) {
        return NextResponse.json(
          toErrorMessage('Erro no banco de dados - Verifique os dados fornecidos'),
          { status: 400 }
        )
      }
    }

    return zodErrorHandler(error);
  }
}