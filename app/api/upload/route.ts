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
        const accessToken = req.headers.get('Authorization');

        if (!accessToken) {
            return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
        }

        const { data: { user } } = await supabaseAdmin.auth.getUser(accessToken);

        if (!user) {
            return NextResponse.json({ error: 'Invalid access token' }, { status: 401 });
        }

        let { files } = await req.json();

        if (!files || (Array.isArray(files) && files.length === 0)) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        if (!Array.isArray(files)) {
            files = [files];
        }

        const uploadPromises = files.map(async (file: any) => {
            const { listingId, fileUuid, contentType, data } = file;

            if (!fileUuid || !contentType || !data || !listingId) {
                throw new Error('Missing file metadata or data');
            }

            const buffer = Buffer.from(data, 'base64');
            const dataSize = buffer.byteLength;

            if (dataSize > MAX_UPLOAD_SIZE) {
                throw new Error(`File size exceeds the maximum upload limit of 50MB for file ${fileUuid}`);
            }

            // Optimize image processing with sharp for original image
            const webpBuffer = await sharp(buffer)
                .resize({ width: 1280, height: 960, fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80, effort: 6 })
                .toBuffer();

            const webpKey = `${listingId}/${fileUuid}.webp`;

            const params = {
                Bucket: "upload-bucket-autovit",
                Key: webpKey,
                Body: webpBuffer,
                ContentType: 'image/webp',
            };

            await s3.upload(params).promise();

            // Create thumbnail
            const thumbnailBuffer = await sharp(buffer)
                .resize({ width: 320, height: 240, fit: 'inside', withoutEnlargement: true }) // Thumbnail size
                .webp({ quality: 80, effort: 6 })
                .toBuffer();

            const thumbnailKey = `${listingId}/${fileUuid}-thumbnail.webp`;

            const thumbnailParams = {
                Bucket: "upload-bucket-autovit",
                Key: thumbnailKey,
                Body: thumbnailBuffer,
                ContentType: 'image/webp',
            };

            await s3.upload(thumbnailParams).promise();

            return {
                originalUrl: `https://${params.Bucket}.r2.cloudflarestorage.com/${webpKey}`,
                thumbnailUrl: `https://${thumbnailParams.Bucket}.r2.cloudflarestorage.com/${thumbnailKey}`,
            };
        });

        // Execute all upload promises and collect the URLs
        const fileUrls = await Promise.all(uploadPromises);

        return NextResponse.json({ message: 'All files uploaded successfully', fileUrls }, { status: 200 });
    } catch (error) {
        console.error('Error uploading files:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}