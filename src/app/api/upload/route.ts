import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const boardId = formData.get('boardId') as string;

    if (!file || !boardId) {
      return NextResponse.json(
        { error: 'File and boardId are required' },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop() || 'png';
    const imageId = nanoid(10);
    const pathname = `images/${boardId}/${imageId}.${ext}`;

    const blob = await put(pathname, file, {
      access: 'private',
      contentType: file.type,
    });

    // Return a proxy URL that serves the private image through our API
    const proxyUrl = `/api/image?url=${encodeURIComponent(blob.url)}`;
    return NextResponse.json({ url: proxyUrl });
  } catch (err) {
    console.error('POST /api/upload error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Upload failed: ${message}` }, { status: 500 });
  }
}
