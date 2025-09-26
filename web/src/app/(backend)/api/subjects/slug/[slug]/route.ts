import { NextResponse } from 'next/server'
import { getSubjectBySlug } from '@/backend/services/subject'
import { slugSchema } from '@/backend/schemas'
import { returnInvalidDataErrors, toErrorMessage, zodErrorHandler } from '@/utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const validationResult = slugSchema.safeParse(slug)
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const subject = await getSubjectBySlug(slug)

    if (!subject) {
      return NextResponse.json(
        toErrorMessage('Matéria não encontrada'),
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
