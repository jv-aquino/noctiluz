import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { blockForbiddenRequests } from '@/utils';
import type { AllowedRoutes } from '@/types';

const allowedRoles: AllowedRoutes = {
  POST: ["SUPER_ADMIN", "ADMIN"]
};

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET!;

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