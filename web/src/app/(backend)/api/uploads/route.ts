import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { blockForbiddenRequests, toErrorMessage } from '@/utils';
import type { AllowedRoutes } from '@/types';
import { uploadSchema } from '../../schemas/upload.schema';

const allowedRoles: AllowedRoutes = {
  POST: ["SUPER_ADMIN", "ADMIN"],
  DELETE: ["SUPER_ADMIN", "ADMIN"]
};

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET!;

// Helper function to extract S3 key from URL
const extractS3KeyFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('s3.amazonaws.com')) {
      return urlObj.pathname.substring(1); // Remove leading slash
    }
    return null;
  } catch {
    return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.POST);
    if (forbidden) {
      return forbidden;
    }

    const validationResult = uploadSchema.safeParse(await request.json());
    if (!validationResult.success) {
      return NextResponse.json(toErrorMessage('Dados de upload inválidos'), { status: 400 });
    }

    const { fileName, fileType, folder } = await validationResult.data;

    // Check environment variables
    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET) {
      return NextResponse.json(toErrorMessage('Configuração AWS incompleta'), { status: 500 });
    }

    const key = `${folder}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: fileType,
    });

    console.log('Generating presigned URL...');
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }); // 5 minutes
    const fileUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    
    return NextResponse.json({ uploadUrl, fileUrl }, { status: 200 });
  } catch (error) {
    console.error('Error generating S3 signed URL:', error);
    return NextResponse.json(toErrorMessage('Failed to generate upload URL'), { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.DELETE);
    if (forbidden) {
      return forbidden;
    }

    const { fileUrl } = await request.json();
    
    if (!fileUrl || typeof fileUrl !== 'string') {
      return NextResponse.json(toErrorMessage('URL do arquivo é obrigatória'), { status: 400 });
    }

    const key = extractS3KeyFromUrl(fileUrl);
    if (!key) {
      return NextResponse.json(toErrorMessage('URL do arquivo inválida'), { status: 400 });
    }

    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });
    
    await s3.send(deleteCommand);
    console.log(`Deleted S3 file: ${key}`);

    return NextResponse.json({ message: 'Arquivo deletado com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting S3 file:', error);
    return NextResponse.json(toErrorMessage('Falha ao deletar arquivo'), { status: 500 });
  }
} 