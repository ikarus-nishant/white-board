'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Canvas, PencilBrush, Rect, Circle, Line, IText, FabricObject } from 'fabric';
import { ToolType, ToolConfig } from '@/types/tools';

export function useDrawingTools(
  fabricRef: React.MutableRefObject<Canvas | null>,
  activeTool: ToolType,
  toolConfig: ToolConfig
) {
  const isDrawingShapeRef = useRef(false);
  const activeShapeRef = useRef<FabricObject | null>(null);
  const startPointRef = useRef({ x: 0, y: 0 });
  const handlersRef = useRef<{
    mouseDown?: (opt: any) => void;
    mouseMove?: (opt: any) => void;
    mouseUp?: (opt: any) => void;
  }>({});

  const cleanup = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (handlersRef.current.mouseDown) {
      canvas.off('mouse:down', handlersRef.current.mouseDown);
    }
    if (handlersRef.current.mouseMove) {
      canvas.off('mouse:move', handlersRef.current.mouseMove);
    }
    if (handlersRef.current.mouseUp) {
      canvas.off('mouse:up', handlersRef.current.mouseUp);
    }
    handlersRef.current = {};
    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.defaultCursor = 'default';
    canvas.hoverCursor = 'move';
  }, [fabricRef]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    cleanup();

    switch (activeTool) {
      case ToolType.SELECT:
        canvas.selection = true;
        canvas.forEachObject((obj) => {
          obj.selectable = true;
          obj.evented = true;
        });
        break;

      case ToolType.PAN:
        canvas.selection = false;
        canvas.defaultCursor = 'grab';
        canvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        setupPanTool(canvas);
        break;

      case ToolType.PENCIL:
        canvas.isDrawingMode = true;
        const brush = new PencilBrush(canvas);
        brush.color = toolConfig.strokeColor;
        brush.width = toolConfig.strokeWidth;
        canvas.freeDrawingBrush = brush;
        break;

      case ToolType.RECTANGLE:
      case ToolType.CIRCLE:
      case ToolType.LINE:
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';
        setupShapeTool(canvas, activeTool, toolConfig);
        break;

      case ToolType.TEXT:
        canvas.selection = false;
        canvas.defaultCursor = 'text';
        setupTextTool(canvas, toolConfig);
        break;

      case ToolType.ERASER:
        canvas.selection = false;
        canvas.defaultCursor = 'pointer';
        setupEraserTool(canvas);
        break;

      default:
        break;
    }

    return cleanup;
  }, [fabricRef, activeTool, toolConfig, cleanup]);

  function setupPanTool(canvas: Canvas) {
    let isDragging = false;
    let lastPos = { x: 0, y: 0 };

    const mouseDown = (opt: any) => {
      isDragging = true;
      const evt = opt.e as MouseEvent;
      lastPos = { x: evt.clientX, y: evt.clientY };
      canvas.setCursor('grabbing');
    };

    const mouseMove = (opt: any) => {
      if (!isDragging) return;
      const evt = opt.e as MouseEvent;
      const vpt = canvas.viewportTransform!;
      vpt[4] += evt.clientX - lastPos.x;
      vpt[5] += evt.clientY - lastPos.y;
      lastPos = { x: evt.clientX, y: evt.clientY };
      canvas.requestRenderAll();
    };

    const mouseUp = () => {
      isDragging = false;
      canvas.setCursor('grab');
      canvas.setViewportTransform(canvas.viewportTransform!);
    };

    canvas.on('mouse:down', mouseDown);
    canvas.on('mouse:move', mouseMove);
    canvas.on('mouse:up', mouseUp);
    handlersRef.current = { mouseDown, mouseMove, mouseUp };
  }

  function setupShapeTool(canvas: Canvas, tool: ToolType, config: ToolConfig) {
    const mouseDown = (opt: any) => {
      if (opt.target) return;
      isDrawingShapeRef.current = true;
      const pointer = canvas.getScenePoint(opt.e);
      startPointRef.current = { x: pointer.x, y: pointer.y };

      let shape: FabricObject;
      if (tool === ToolType.RECTANGLE) {
        shape = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: config.fillColor === 'transparent' ? 'transparent' : config.fillColor,
          stroke: config.strokeColor,
          strokeWidth: config.strokeWidth,
          opacity: config.opacity,
        });
      } else if (tool === ToolType.CIRCLE) {
        shape = new Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 0,
          fill: config.fillColor === 'transparent' ? 'transparent' : config.fillColor,
          stroke: config.strokeColor,
          strokeWidth: config.strokeWidth,
          opacity: config.opacity,
        });
      } else {
        shape = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: config.strokeColor,
          strokeWidth: config.strokeWidth,
          opacity: config.opacity,
        });
      }

      canvas.add(shape);
      activeShapeRef.current = shape;
    };

    const mouseMove = (opt: any) => {
      if (!isDrawingShapeRef.current || !activeShapeRef.current) return;
      const pointer = canvas.getScenePoint(opt.e);
      const shape = activeShapeRef.current;
      const start = startPointRef.current;

      if (tool === ToolType.RECTANGLE) {
        const left = Math.min(start.x, pointer.x);
        const top = Math.min(start.y, pointer.y);
        (shape as Rect).set({
          left,
          top,
          width: Math.abs(pointer.x - start.x),
          height: Math.abs(pointer.y - start.y),
        });
      } else if (tool === ToolType.CIRCLE) {
        const radius = Math.sqrt(
          Math.pow(pointer.x - start.x, 2) + Math.pow(pointer.y - start.y, 2)
        ) / 2;
        const left = Math.min(start.x, pointer.x);
        const top = Math.min(start.y, pointer.y);
        (shape as Circle).set({ left, top, radius });
      } else {
        (shape as Line).set({ x2: pointer.x, y2: pointer.y });
      }

      canvas.renderAll();
    };

    const mouseUp = () => {
      isDrawingShapeRef.current = false;
      const shape = activeShapeRef.current;
      if (shape) {
        shape.setCoords();
        canvas.setActiveObject(shape);
      }
      activeShapeRef.current = null;
    };

    canvas.on('mouse:down', mouseDown);
    canvas.on('mouse:move', mouseMove);
    canvas.on('mouse:up', mouseUp);
    handlersRef.current = { mouseDown, mouseMove, mouseUp };
  }

  function setupTextTool(canvas: Canvas, config: ToolConfig) {
    const mouseDown = (opt: any) => {
      if (opt.target) return;
      const pointer = canvas.getScenePoint(opt.e);
      const text = new IText('Type here', {
        left: pointer.x,
        top: pointer.y,
        fontSize: config.fontSize,
        fill: config.strokeColor,
        fontFamily: 'Arial',
        opacity: config.opacity,
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      text.enterEditing();
    };

    canvas.on('mouse:down', mouseDown);
    handlersRef.current = { mouseDown };
  }

  function setupEraserTool(canvas: Canvas) {
    const mouseDown = (opt: any) => {
      if (opt.target) {
        canvas.remove(opt.target);
        canvas.renderAll();
      }
    };

    canvas.on('mouse:down', mouseDown);
    handlersRef.current = { mouseDown };
  }
}
