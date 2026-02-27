import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
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
    access: 'public',
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
