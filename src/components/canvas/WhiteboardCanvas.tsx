'use client';

import { useRef, useEffect } from 'react';
import { Canvas } from 'fabric';
import { useCanvas } from '@/hooks/useCanvas';
import { useCanvasHistory } from '@/hooks/useCanvasHistory';
import { useDrawingTools } from '@/hooks/useDrawingTools';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ToolType, ToolConfig } from '@/types/tools';

interface WhiteboardCanvasProps {
  activeTool: ToolType;
  toolConfig: ToolConfig;
  setActiveTool: (tool: ToolType) => void;
  onZoomChange?: (zoom: number) => void;
  onCanvasReady?: (canvas: Canvas) => void;
  readOnly?: boolean;
}

export default function WhiteboardCanvas({
  activeTool,
  toolConfig,
  setActiveTool,
  onZoomChange,
  onCanvasReady,
  readOnly = false,
}: WhiteboardCanvasProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const { fabricRef, getZoom, setZoom, resetView } = useCanvas(canvasElRef);
  const { undo, redo } = useCanvasHistory(fabricRef);
  const onCanvasReadyRef = useRef(onCanvasReady);
  onCanvasReadyRef.current = onCanvasReady;

  // Always call hooks (React rules), but pass readOnly so they can no-op internally
  useDrawingTools(fabricRef, readOnly ? ToolType.SELECT : activeTool, toolConfig);
  useKeyboardShortcuts({
    fabricRef,
    setActiveTool: readOnly ? () => {} : setActiveTool,
    undo: readOnly ? () => {} : undo,
    redo: readOnly ? () => {} : redo,
  });

  // Notify parent when canvas is ready
  useEffect(() => {
    if (fabricRef.current && onCanvasReadyRef.current) {
      onCanvasReadyRef.current(fabricRef.current);
    }
  });

  // Expose helpers for parent access
  useEffect(() => {
    (fabricRef as any).__helpers = { getZoom, setZoom, resetView, undo, redo };
  }, [fabricRef, getZoom, setZoom, resetView, undo, redo]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasElRef} />
    </div>
  );
}
