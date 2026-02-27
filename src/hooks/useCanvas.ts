'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Canvas, Point } from 'fabric';
import { CANVAS_BG, MIN_ZOOM, MAX_ZOOM } from '@/lib/constants';

export function useCanvas(canvasElRef: React.RefObject<HTMLCanvasElement | null>) {
  const fabricRef = useRef<Canvas | null>(null);
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasElRef.current || fabricRef.current) return;

    const canvas = new Canvas(canvasElRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: CANVAS_BG,
      selection: true,
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;

    // Pan with middle mouse button or spacebar+drag
    canvas.on('mouse:down', (opt) => {
      const evt = opt.e as MouseEvent;
      if (evt.button === 1 || evt.altKey) {
        isDraggingRef.current = true;
        lastPosRef.current = { x: evt.clientX, y: evt.clientY };
        canvas.selection = false;
        canvas.setCursor('grabbing');
        evt.preventDefault();
      }
    });

    canvas.on('mouse:move', (opt) => {
      if (!isDraggingRef.current) return;
      const evt = opt.e as MouseEvent;
      const vpt = canvas.viewportTransform!;
      vpt[4] += evt.clientX - lastPosRef.current.x;
      vpt[5] += evt.clientY - lastPosRef.current.y;
      lastPosRef.current = { x: evt.clientX, y: evt.clientY };
      canvas.requestRenderAll();
    });

    canvas.on('mouse:up', () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        canvas.selection = true;
        canvas.setCursor('default');
        canvas.setViewportTransform(canvas.viewportTransform!);
      }
    });

    // Zoom with scroll wheel
    canvas.on('mouse:wheel', (opt) => {
      const evt = opt.e as WheelEvent;
      const delta = evt.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.min(Math.max(zoom, MIN_ZOOM), MAX_ZOOM);
      canvas.zoomToPoint(new Point(evt.offsetX, evt.offsetY), zoom);
      evt.preventDefault();
      evt.stopPropagation();
    });

    // Resize handler
    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      canvas.renderAll();
    };
    window.addEventListener('resize', handleResize);

    // Draw dot grid
    renderDotGrid(canvas);
    canvas.on('after:render', () => {
      renderDotGrid(canvas);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [canvasElRef]);

  const getZoom = useCallback(() => {
    return fabricRef.current?.getZoom() ?? 1;
  }, []);

  const setZoom = useCallback((zoom: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const center = canvas.getCenterPoint();
    canvas.zoomToPoint(center, Math.min(Math.max(zoom, MIN_ZOOM), MAX_ZOOM));
  }, []);

  const resetView = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.renderAll();
  }, []);

  return { fabricRef, getZoom, setZoom, resetView };
}

function renderDotGrid(canvas: Canvas) {
  const ctx = canvas.getContext();
  const vpt = canvas.viewportTransform!;
  const zoom = canvas.getZoom();

  const spacing = 20;
  const dotRadius = 1;

  const width = canvas.getWidth();
  const height = canvas.getHeight();

  const offsetX = vpt[4] % (spacing * zoom);
  const offsetY = vpt[5] % (spacing * zoom);

  ctx.save();
  ctx.fillStyle = '#D0D0D0';

  for (let x = offsetX; x < width; x += spacing * zoom) {
    for (let y = offsetY; y < height; y += spacing * zoom) {
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}
