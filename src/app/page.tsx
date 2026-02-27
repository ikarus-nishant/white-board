'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, LayoutDashboard } from 'lucide-react';
import { BoardListItem } from '@/types/board';
import { Toaster, toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<BoardListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, []);

  async function fetchBoards() {
    try {
      const res = await fetch('/api/boards');
      if (res.ok) {
        const data = await res.json();
        setBoards(data);
      }
    } catch {
      // API not available (Vercel Blob not configured)
    } finally {
      setLoading(false);
    }
  }

  async function createBoard() {
    setCreating(true);
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Untitled Board' }),
      });

      if (res.ok) {
        const board = await res.json();
        router.push(`/board/${board.id}`);
      } else {
        // Fallback: create board with random ID (local only)
        const id = Math.random().toString(36).slice(2, 12);
        router.push(`/board/${id}`);
      }
    } catch {
      // Fallback: create board with random ID (local only)
      const id = Math.random().toString(36).slice(2, 12);
      router.push(`/board/${id}`);
    }
  }

  async function deleteBoard(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this board?')) return;

    try {
      await fetch(`/api/boards/${id}`, { method: 'DELETE' });
      setBoards((prev) => prev.filter((b) => b.id !== id));
      toast.success('Board deleted');
    } catch {
      toast.error('Failed to delete board');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="bottom-right" />

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard size={24} className="text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Whiteboard</h1>
          </div>
          <button
            onClick={createBoard}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus size={16} />
            New Board
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 h-48 animate-pulse"
              />
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard size={32} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-medium text-gray-800 mb-2">
              No boards yet
            </h2>
            <p className="text-gray-500 mb-6">
              Create your first whiteboard to get started.
            </p>
            <button
              onClick={createBoard}
              disabled={creating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
              Create Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* New Board Card */}
            <button
              onClick={createBoard}
              disabled={creating}
              className="group bg-white rounded-xl border-2 border-dashed border-gray-200 h-48 flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 transition-colors disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <Plus
                  size={20}
                  className="text-gray-400 group-hover:text-blue-600 transition-colors"
                />
              </div>
              <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
                New Board
              </span>
            </button>

            {/* Board Cards */}
            {boards.map((board) => (
              <div
                key={board.id}
                onClick={() => router.push(`/board/${board.id}`)}
                className="group relative bg-white rounded-xl border border-gray-200 h-48 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="h-32 bg-gray-50 flex items-center justify-center">
                  {board.thumbnailUrl ? (
                    <img
                      src={board.thumbnailUrl}
                      alt={board.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <LayoutDashboard size={24} className="text-gray-300" />
                  )}
                </div>

                {/* Info */}
                <div className="px-3 py-2 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {board.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(board.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => deleteBoard(board.id, e)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
