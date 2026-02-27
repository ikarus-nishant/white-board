import { NextRequest, NextResponse } from 'next/server';
import { getBoard, saveBoard, deleteBoard } from '@/lib/blob';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const board = await getBoard(id);

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    return NextResponse.json(board);
  } catch (err) {
    console.error('GET /api/boards/[id] error:', err);
    return NextResponse.json({ error: 'Failed to fetch board' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const board = await getBoard(id);

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    const body = await request.json();
    const updated = {
      ...board,
      name: body.name ?? board.name,
      canvasState: body.canvasState ?? board.canvasState,
      thumbnailUrl: body.thumbnailUrl ?? board.thumbnailUrl,
      updatedAt: new Date().toISOString(),
    };

    await saveBoard(updated);

    return NextResponse.json(updated);
  } catch (err) {
    console.error('PUT /api/boards/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update board' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteBoard(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/boards/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete board' }, { status: 500 });
  }
}
