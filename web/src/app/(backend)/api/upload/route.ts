import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { blockForbiddenRequests } from '@/utils';
import type { AllowedRoutes } from '@/types';

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
    console.log('Upload route called');
    const forbidden = await blockForbiddenRequests(request, allowedRoles.POST);
    if (forbidden) {
      console.log('Request forbidden');
      return forbidden;
    }

    const { fileName, fileType } = await request.json();
    console.log('Request body:', { fileName, fileType });
    
    if (!fileName || typeof fileName !== 'string' || fileName.length > 200) {
      console.log('Invalid fileName');
      return NextResponse.json({ error: 'Nome de arquivo inválido' }, { status: 400 });
    }
    if (!fileType || typeof fileType !== 'string' || fileType.length > 100) {
      console.log('Invalid fileType');
      return NextResponse.json({ error: 'Tipo de arquivo inválido' }, { status: 400 });
    }

    // Check environment variables
    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET) {
      console.error('Missing AWS environment variables');
      return NextResponse.json({ error: 'Configuração AWS incompleta' }, { status: 500 });
    }

    console.log('AWS config check passed');
    console.log('Bucket:', process.env.AWS_S3_BUCKET);
    console.log('Region:', process.env.AWS_REGION);

    // Optionally, add a folder prefix or unique ID to fileName
    const key = `uploads/${Date.now()}-${fileName}`;
    console.log('S3 key:', key);

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: fileType,
    });

    console.log('Generating presigned URL...');
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }); // 5 minutes
    const fileUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    
    console.log('Presigned URL generated successfully');
    console.log('File URL:', fileUrl);

    return NextResponse.json({ uploadUrl, fileUrl }, { status: 200 });
  } catch (error) {
    console.error('Error generating S3 signed URL:', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
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
      return NextResponse.json({ error: 'URL do arquivo é obrigatória' }, { status: 400 });
    }

    const key = extractS3KeyFromUrl(fileUrl);
    if (!key) {
      return NextResponse.json({ error: 'URL do arquivo inválida' }, { status: 400 });
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
    return NextResponse.json({ error: 'Falha ao deletar arquivo' }, { status: 500 });
  }
} 