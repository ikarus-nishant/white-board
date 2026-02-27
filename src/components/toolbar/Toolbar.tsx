'use client';

import {
  MousePointer2,
  Hand,
  Pencil,
  Square,
  Circle,
  Minus,
  Type,
  Eraser,
  Image as ImageIcon,
  Undo2,
  Redo2,
} from 'lucide-react';
import { ToolType } from '@/types/tools';

interface ToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  onUndo: () => void;
  onRedo: () => void;
  onImageUpload: () => void;
}

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  isActive?: boolean;
  onClick: () => void;
}

function ToolButton({ icon, label, shortcut, isActive, onClick }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative group flex items-center justify-center w-10 h-10 rounded-lg transition-colors
        ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
      title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
    >
      {icon}
      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
        {label}
        {shortcut && <span className="ml-1 text-gray-400">{shortcut}</span>}
      </div>
    </button>
  );
}

function Divider() {
  return <div className="w-6 h-px bg-gray-200 mx-auto my-1" />;
}

export default function Toolbar({
  activeTool,
  setActiveTool,
  onUndo,
  onRedo,
  onImageUpload,
}: ToolbarProps) {
  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1 bg-white rounded-xl shadow-lg border border-gray-200 p-1.5">
      {/* Navigation */}
      <ToolButton
        icon={<MousePointer2 size={18} />}
        label="Select"
        shortcut="V"
        isActive={activeTool === ToolType.SELECT}
        onClick={() => setActiveTool(ToolType.SELECT)}
      />
      <ToolButton
        icon={<Hand size={18} />}
        label="Pan"
        shortcut="H"
        isActive={activeTool === ToolType.PAN}
        onClick={() => setActiveTool(ToolType.PAN)}
      />

      <Divider />

      {/* Drawing */}
      <ToolButton
        icon={<Pencil size={18} />}
        label="Pencil"
        shortcut="P"
        isActive={activeTool === ToolType.PENCIL}
        onClick={() => setActiveTool(ToolType.PENCIL)}
      />
      <ToolButton
        icon={<Square size={18} />}
        label="Rectangle"
        shortcut="R"
        isActive={activeTool === ToolType.RECTANGLE}
        onClick={() => setActiveTool(ToolType.RECTANGLE)}
      />
      <ToolButton
        icon={<Circle size={18} />}
        label="Circle"
        shortcut="C"
        isActive={activeTool === ToolType.CIRCLE}
        onClick={() => setActiveTool(ToolType.CIRCLE)}
      />
      <ToolButton
        icon={<Minus size={18} />}
        label="Line"
        shortcut="L"
        isActive={activeTool === ToolType.LINE}
        onClick={() => setActiveTool(ToolType.LINE)}
      />
      <ToolButton
        icon={<Type size={18} />}
        label="Text"
        shortcut="T"
        isActive={activeTool === ToolType.TEXT}
        onClick={() => setActiveTool(ToolType.TEXT)}
      />

      <Divider />

      {/* Insert */}
      <ToolButton
        icon={<ImageIcon size={18} />}
        label="Upload Image"
        isActive={activeTool === ToolType.IMAGE}
        onClick={onImageUpload}
      />

      <Divider />

      {/* Edit */}
      <ToolButton
        icon={<Eraser size={18} />}
        label="Eraser"
        shortcut="E"
        isActive={activeTool === ToolType.ERASER}
        onClick={() => setActiveTool(ToolType.ERASER)}
      />

      <Divider />

      {/* History */}
      <ToolButton
        icon={<Undo2 size={18} />}
        label="Undo"
        shortcut="Ctrl+Z"
        onClick={onUndo}
      />
      <ToolButton
        icon={<Redo2 size={18} />}
        label="Redo"
        shortcut="Ctrl+Y"
        onClick={onRedo}
      />
    </div>
  );
}
