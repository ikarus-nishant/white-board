'use client';

import { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Share2,
  Download,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import Link from 'next/link';

interface TopBarProps {
  boardName: string;
  onBoardNameChange: (name: string) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onShare: () => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
  readOnly?: boolean;
}

export default function TopBar({
  boardName,
  onBoardNameChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onShare,
  onExportPNG,
  onExportPDF,
  readOnly = false,
}: TopBarProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="absolute top-0 left-0 right-0 h-12 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4">
      {/* Left: Logo + Board Name */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <LayoutDashboard size={20} />
        </Link>
        <div className="w-px h-6 bg-gray-200" />
        {readOnly ? (
          <span className="text-sm font-medium text-gray-700">{boardName}</span>
        ) : (
          <input
            type="text"
            value={boardName}
            onChange={(e) => onBoardNameChange(e.target.value)}
            className="text-sm font-medium text-gray-700 bg-transparent border-none outline-none hover:bg-gray-50 focus:bg-gray-50 px-2 py-1 rounded transition-colors"
            placeholder="Untitled Board"
          />
        )}
        {readOnly && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            View only
          </span>
        )}
      </div>

      {/* Center: Zoom Controls */}
      <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-1 py-0.5">
        <button
          onClick={onZoomOut}
          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-xs font-medium text-gray-600 min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={onZoomReset}
          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          title="Reset View"
        >
          <Maximize size={16} />
        </button>
      </div>

      {/* Right: Share + Export */}
      <div className="flex items-center gap-2">
        {!readOnly && (
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Share2 size={14} />
            Share
          </button>
        )}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Download size={14} />
            Export
            <ChevronDown size={12} />
          </button>
          {showExportMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowExportMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
                <button
                  onClick={() => {
                    onExportPNG();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Export as PNG
                </button>
                <button
                  onClick={() => {
                    onExportPDF();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Export as PDF
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
