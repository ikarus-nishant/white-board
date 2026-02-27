import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getBoard, saveBoard, getShareIndex, saveShareIndex } from '@/lib/blob';

// POST: Generate share link for a board
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const board = await getBoard(id);

  if (!board) {
    return NextResponse.json({ error: 'Board not found' }, { status: 404 });
  }

  // If already has a share ID, return it
  if (board.shareId) {
    return NextResponse.json({ shareId: board.shareId });
  }

  // Generate new share ID
  const shareId = nanoid(12);
  board.shareId = shareId;
  board.updatedAt = new Date().toISOString();
  await saveBoard(board);

  // Update share index
  const shareIndex = await getShareIndex();
  shareIndex[shareId] = id;
  await saveShareIndex(shareIndex);

  return NextResponse.json({ shareId });
}

// GET: Load a shared board by shareId
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: shareId } = await params;
  const shareIndex = await getShareIndex();
  const boardId = shareIndex[shareId];

  if (!boardId) {
    return NextResponse.json({ error: 'Shared board not found' }, { status: 404 });
  }

  const board = await getBoard(boardId);

  if (!board) {
    return NextResponse.json({ error: 'Board not found' }, { status: 404 });
  }

  return NextResponse.json(board);
}
