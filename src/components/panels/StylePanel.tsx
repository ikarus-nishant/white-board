'use client';

import { ToolConfig } from '@/types/tools';
import { PRESET_COLORS } from '@/lib/constants';
import { Trash2 } from 'lucide-react';

interface StylePanelProps {
  toolConfig: ToolConfig;
  setToolConfig: (config: ToolConfig) => void;
  onDeleteSelected?: () => void;
  hasSelection?: boolean;
}

export default function StylePanel({
  toolConfig,
  setToolConfig,
  onDeleteSelected,
  hasSelection,
}: StylePanelProps) {
  return (
    <div className="absolute right-3 top-16 z-20 w-56 bg-white rounded-xl shadow-lg border border-gray-200 p-4 space-y-4">
      {/* Stroke Color */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Stroke
        </label>
        <div className="grid grid-cols-5 gap-1.5 mt-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={`stroke-${color}`}
              className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                toolConfig.strokeColor === color
                  ? 'border-blue-500 scale-110'
                  : 'border-gray-200'
              }`}
              style={{ backgroundColor: color }}
              onClick={() =>
                setToolConfig({ ...toolConfig, strokeColor: color })
              }
            />
          ))}
        </div>
        <input
          type="text"
          value={toolConfig.strokeColor}
          onChange={(e) =>
            setToolConfig({ ...toolConfig, strokeColor: e.target.value })
          }
          className="mt-2 w-full px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="#000000"
        />
      </div>

      {/* Fill Color */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Fill
        </label>
        <div className="grid grid-cols-5 gap-1.5 mt-2">
          <button
            className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 relative ${
              toolConfig.fillColor === 'transparent'
                ? 'border-blue-500 scale-110'
                : 'border-gray-200'
            }`}
            onClick={() =>
              setToolConfig({ ...toolConfig, fillColor: 'transparent' })
            }
          >
            <div className="absolute inset-1 bg-white rounded">
              <div className="absolute inset-0 flex items-center justify-center text-red-400 text-lg font-light">/</div>
            </div>
          </button>
          {PRESET_COLORS.slice(0, 9).map((color) => (
            <button
              key={`fill-${color}`}
              className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                toolConfig.fillColor === color
                  ? 'border-blue-500 scale-110'
                  : 'border-gray-200'
              }`}
              style={{ backgroundColor: color }}
              onClick={() =>
                setToolConfig({ ...toolConfig, fillColor: color })
              }
            />
          ))}
        </div>
      </div>

      {/* Stroke Width */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Stroke Width: {toolConfig.strokeWidth}px
        </label>
        <input
          type="range"
          min="1"
          max="50"
          value={toolConfig.strokeWidth}
          onChange={(e) =>
            setToolConfig({
              ...toolConfig,
              strokeWidth: parseInt(e.target.value),
            })
          }
          className="w-full mt-2 accent-blue-500"
        />
      </div>

      {/* Opacity */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Opacity: {Math.round(toolConfig.opacity * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={Math.round(toolConfig.opacity * 100)}
          onChange={(e) =>
            setToolConfig({
              ...toolConfig,
              opacity: parseInt(e.target.value) / 100,
            })
          }
          className="w-full mt-2 accent-blue-500"
        />
      </div>

      {/* Font Size (for text tool) */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Font Size: {toolConfig.fontSize}px
        </label>
        <input
          type="range"
          min="8"
          max="120"
          value={toolConfig.fontSize}
          onChange={(e) =>
            setToolConfig({
              ...toolConfig,
              fontSize: parseInt(e.target.value),
            })
          }
          className="w-full mt-2 accent-blue-500"
        />
      </div>

      {/* Delete Selected */}
      {hasSelection && (
        <button
          onClick={onDeleteSelected}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
        >
          <Trash2 size={14} />
          Delete Selected
        </button>
      )}
    </div>
  );
}
