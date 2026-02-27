'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Canvas } from 'fabric';
import { MAX_HISTORY_STATES } from '@/lib/constants';

export function useCanvasHistory(fabricRef: React.MutableRefObject<Canvas | null>) {
  const historyRef = useRef<string[]>([]);
  const currentIndexRef = useRef(-1);
  const isRestoringRef = useRef(false);

  const saveState = useCallback(() => {
    if (isRestoringRef.current) return;
    const canvas = fabricRef.current;
    if (!canvas) return;

    const json = JSON.stringify(canvas.toJSON());

    // Truncate redo history beyond current index
    historyRef.current = historyRef.current.slice(0, currentIndexRef.current + 1);
    historyRef.current.push(json);
    currentIndexRef.current = historyRef.current.length - 1;

    // Cap history
    if (historyRef.current.length > MAX_HISTORY_STATES) {
      historyRef.current.shift();
      currentIndexRef.current--;
    }
  }, [fabricRef]);

  const undo = useCallback(() => {
    if (currentIndexRef.current <= 0) return;
    currentIndexRef.current--;
    restore();
  }, []);

  const redo = useCallback(() => {
    if (currentIndexRef.current >= historyRef.current.length - 1) return;
    currentIndexRef.current++;
    restore();
  }, []);

  const restore = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    isRestoringRef.current = true;
    const state = historyRef.current[currentIndexRef.current];
    canvas.loadFromJSON(JSON.parse(state)).then(() => {
      canvas.renderAll();
      isRestoringRef.current = false;
    });
  };

  const canUndo = useCallback(() => currentIndexRef.current > 0, []);
  const canRedo = useCallback(() => currentIndexRef.current < historyRef.current.length - 1, []);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const handler = () => saveState();
    canvas.on('object:added', handler);
    canvas.on('object:modified', handler);
    canvas.on('object:removed', handler);

    // Save initial empty state
    saveState();

    return () => {
      canvas.off('object:added', handler);
      canvas.off('object:modified', handler);
      canvas.off('object:removed', handler);
    };
  }, [fabricRef, saveState]);

  return { undo, redo, canUndo, canRedo, saveState };
}
