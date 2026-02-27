'use client';

import { useState } from 'react';
import { X, Copy, Check, Link as LinkIcon } from 'lucide-react';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  shareId: string | null;
  onGenerateLink: () => Promise<string>;
}

export default function ShareDialog({
  isOpen,
  onClose,
  boardId,
  shareId,
  onGenerateLink,
}: ShareDialogProps) {
  const [currentShareId, setCurrentShareId] = useState(shareId);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const shareUrl = currentShareId
    ? `${window.location.origin}/view/${currentShareId}`
    : null;

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const newShareId = await onGenerateLink();
      setCurrentShareId(newShareId);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl shadow-2xl w-[420px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Share Board</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {shareUrl ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Anyone with this link can view your whiteboard.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <LinkIcon size={14} className="text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700 truncate">{shareUrl}</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shrink-0"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Create a shareable link so others can view this whiteboard.
            </p>
            <button
              onClick={handleGenerateLink}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <LinkIcon size={14} />
              {loading ? 'Generating...' : 'Create Share Link'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
