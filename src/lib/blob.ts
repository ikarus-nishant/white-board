import { put, list, del } from '@vercel/blob';
import { Board, BoardIndex, BoardListItem, ShareIndex } from '@/types/board';

const BOARDS_INDEX = 'boards/_index.json';
const SHARES_INDEX = 'shares/_index.json';

export async function getBoardIndex(): Promise<BoardIndex> {
  try {
    const result = await list({ prefix: 'boards/_index' });
    if (result.blobs.length > 0) {
      const res = await fetch(result.blobs[0].url);
      return await res.json();
    }
  } catch {
    // Index doesn't exist yet
  }
  return { boards: [] };
}

export async function saveBoardIndex(index: BoardIndex): Promise<void> {
  await put(BOARDS_INDEX, JSON.stringify(index), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}

export async function getBoard(id: string): Promise<Board | null> {
  try {
    const result = await list({ prefix: `boards/${id}.json` });
    if (result.blobs.length > 0) {
      const res = await fetch(result.blobs[0].url);
      return await res.json();
    }
  } catch {
    return null;
  }
  return null;
}

export async function saveBoard(board: Board): Promise<void> {
  await put(`boards/${board.id}.json`, JSON.stringify(board), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });

  // Update index
  const index = await getBoardIndex();
  const existing = index.boards.findIndex((b) => b.id === board.id);
  const item: BoardListItem = {
    id: board.id,
    name: board.name,
    updatedAt: board.updatedAt,
    thumbnailUrl: board.thumbnailUrl,
  };

  if (existing >= 0) {
    index.boards[existing] = item;
  } else {
    index.boards.unshift(item);
  }

  await saveBoardIndex(index);
}

export async function deleteBoard(id: string): Promise<void> {
  // Delete board JSON
  const boardBlobs = await list({ prefix: `boards/${id}` });
  for (const blob of boardBlobs.blobs) {
    await del(blob.url);
  }

  // Delete associated images
  const imageBlobs = await list({ prefix: `images/${id}/` });
  for (const blob of imageBlobs.blobs) {
    await del(blob.url);
  }

  // Delete thumbnail
  const thumbBlobs = await list({ prefix: `thumbnails/${id}` });
  for (const blob of thumbBlobs.blobs) {
    await del(blob.url);
  }

  // Update index
  const index = await getBoardIndex();
  index.boards = index.boards.filter((b) => b.id !== id);
  await saveBoardIndex(index);

  // Update share index
  const shareIndex = await getShareIndex();
  const shareEntries = Object.entries(shareIndex);
  for (const [shareId, boardId] of shareEntries) {
    if (boardId === id) {
      delete shareIndex[shareId];
    }
  }
  await saveShareIndex(shareIndex);
}

export async function getShareIndex(): Promise<ShareIndex> {
  try {
    const result = await list({ prefix: 'shares/_index' });
    if (result.blobs.length > 0) {
      const res = await fetch(result.blobs[0].url);
      return await res.json();
    }
  } catch {
    // Index doesn't exist yet
  }
  return {};
}

export async function saveShareIndex(index: ShareIndex): Promise<void> {
  await put(SHARES_INDEX, JSON.stringify(index), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}
