import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { Board } from '@/types/board';
import { getBoardIndex, saveBoard } from '@/lib/blob';

export async function GET() {
  try {
    const index = await getBoardIndex();
    return NextResponse.json(index.boards);
  } catch (err) {
    console.error('GET /api/boards error:', err);
    return NextResponse.json({ error: 'Failed to fetch boards' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = nanoid(10);
    const now = new Date().toISOString();

    const board: Board = {
      id,
      name: body.name || 'Untitled Board',
      createdAt: now,
      updatedAt: now,
      shareId: null,
      thumbnailUrl: null,
      canvasState: {
        version: '6.0.0',
        objects: [],
        background: '#F8F9FA',
      },
    };

    await saveBoard(board);

    return NextResponse.json(board, { status: 201 });
  } catch (err) {
    console.error('POST /api/boards error:', err);
    return NextResponse.json(
      { error: 'Failed to create board. Check that BLOB_READ_WRITE_TOKEN is set.' },
      { status: 500 }
    );
  }
}
