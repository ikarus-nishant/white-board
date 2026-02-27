import { Board, BoardIndex, BoardListItem, ShareIndex } from '@/types/board';

// localStorage-based storage for local development (no Vercel Blob needed)

const BOARDS_INDEX_KEY = 'whiteboard:boards:index';
const SHARES_INDEX_KEY = 'whiteboard:shares:index';

function boardKey(id: string) {
  return `whiteboard:board:${id}`;
}

export function getBoardIndexLocal(): BoardIndex {
  if (typeof window === 'undefined') return { boards: [] };
  try {
    const raw = localStorage.getItem(BOARDS_INDEX_KEY);
    return raw ? JSON.parse(raw) : { boards: [] };
  } catch {
    return { boards: [] };
  }
}

export function saveBoardIndexLocal(index: BoardIndex): void {
  localStorage.setItem(BOARDS_INDEX_KEY, JSON.stringify(index));
}

export function getBoardLocal(id: string): Board | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(boardKey(id));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveBoardLocal(board: Board): void {
  localStorage.setItem(boardKey(board.id), JSON.stringify(board));

  // Update index
  const index = getBoardIndexLocal();
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

  saveBoardIndexLocal(index);
}

export function deleteBoardLocal(id: string): void {
  localStorage.removeItem(boardKey(id));

  const index = getBoardIndexLocal();
  index.boards = index.boards.filter((b) => b.id !== id);
  saveBoardIndexLocal(index);

  // Clean share index
  const shareIndex = getShareIndexLocal();
  for (const [shareId, boardId] of Object.entries(shareIndex)) {
    if (boardId === id) {
      delete shareIndex[shareId];
    }
  }
  saveShareIndexLocal(shareIndex);
}

export function getShareIndexLocal(): ShareIndex {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SHARES_INDEX_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveShareIndexLocal(index: ShareIndex): void {
  localStorage.setItem(SHARES_INDEX_KEY, JSON.stringify(index));
}
