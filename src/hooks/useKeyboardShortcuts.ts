'use client';

import { useEffect } from 'react';
import { Canvas, ActiveSelection } from 'fabric';
import { ToolType } from '@/types/tools';

interface KeyboardShortcutsOptions {
  fabricRef: React.MutableRefObject<Canvas | null>;
  setActiveTool: (tool: ToolType) => void;
  undo: () => void;
  redo: () => void;
}

export function useKeyboardShortcuts({
  fabricRef,
  setActiveTool,
  undo,
  redo,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Check if any text object is being edited
      const canvas = fabricRef.current;
      if (canvas) {
        const activeObj = canvas.getActiveObject();
        if (activeObj && 'isEditing' in activeObj && activeObj.isEditing) {
          return;
        }
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'a':
            e.preventDefault();
            if (canvas) {
              canvas.discardActiveObject();
              const sel = new ActiveSelection(canvas.getObjects(), { canvas });
              canvas.setActiveObject(sel);
              canvas.requestRenderAll();
            }
            break;
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          setActiveTool(ToolType.SELECT);
          break;
        case 'h':
          setActiveTool(ToolType.PAN);
          break;
        case 'p':
          setActiveTool(ToolType.PENCIL);
          break;
        case 'r':
          setActiveTool(ToolType.RECTANGLE);
          break;
        case 'c':
          setActiveTool(ToolType.CIRCLE);
          break;
        case 'l':
          setActiveTool(ToolType.LINE);
          break;
        case 't':
          setActiveTool(ToolType.TEXT);
          break;
        case 'e':
          setActiveTool(ToolType.ERASER);
          break;
        case 'delete':
        case 'backspace':
          if (canvas) {
            const active = canvas.getActiveObjects();
            active.forEach((obj) => canvas.remove(obj));
            canvas.discardActiveObject();
            canvas.renderAll();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fabricRef, setActiveTool, undo, redo]);
}
