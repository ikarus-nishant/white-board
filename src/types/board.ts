export interface Board {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  shareId: string | null;
  thumbnailUrl: string | null;
  canvasState: CanvasState;
}

export interface CanvasState {
  version: string;
  objects: Record<string, unknown>[];
  background: string;
}

export interface BoardListItem {
  id: string;
  name: string;
  updatedAt: string;
  thumbnailUrl: string | null;
}

export interface BoardIndex {
  boards: BoardListItem[];
}

export interface ShareIndex {
  [shareId: string]: string;
}
