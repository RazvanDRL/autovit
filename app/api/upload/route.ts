import S3 from 'aws-sdk/clients/s3.js';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { MAX_UPLOAD_SIZE } from '@/constants';

const s3 = new S3({
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID!}.r2.cloudflarestorage.com`,
    accessKeyId: process.env.CLOUDFLARE_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_AWS_SECRET_ACCESS_KEY!,
    signatureVersion: 'v4',
});

export async function POST(req: Request): Promise<Response> {
    try {
        const userId = req.headers.get('X-User-Id');

        if (!userId) {
            return NextResponse.json({ error: 'Missing User ID' }, { status: 400 });
        }

        let { files } = await req.json();

        if (!files) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        if (!Array.isArray(files)) {
            files = [files];
        }

        if (files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        const uploadPromises = files.map(async (file: any) => {
            const { fileUuid, contentType, data } = file;

            if (!fileUuid || !contentType || !data) {
                throw new Error('Missing file metadata or data');
            }

            const buffer = Buffer.from(data, 'base64');
            const dataSize = buffer.byteLength;

            if (dataSize > MAX_UPLOAD_SIZE) {
                throw new Error(`File size exceeds the maximum upload limit of 50MB for file ${fileUuid}`);
            }

            // Convert the image to WebP format using sharp
            const webpBuffer = await sharp(buffer)
                .webp({ quality: 80 }) // Adjust the quality as needed
                .toBuffer();

            const webpKey = `${userId}/${fileUuid}.webp`;

            const params = {
                Bucket: "upload-bucket-autovit",
                Key: webpKey,
                Body: webpBuffer,
                ContentType: 'image/webp',
            };

            await s3.upload(params).promise();

            return `https://${params.Bucket}.r2.cloudflarestorage.com/${webpKey}`;
        });

        // Execute all upload promises and collect the URLs
        const fileUrls = await Promise.all(uploadPromises);

        return NextResponse.json({ message: 'All files uploaded successfully', fileUrls }, { status: 200 });
    } catch (error) {
        console.error('Error uploading files:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}