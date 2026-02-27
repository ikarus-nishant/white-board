import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { Board } from '@/types/board';
import { getBoardIndex, saveBoard } from '@/lib/blob';

export async function GET() {
  const index = await getBoardIndex();
  return NextResponse.json(index.boards);
}

export async function POST(request: NextRequest) {
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
}
