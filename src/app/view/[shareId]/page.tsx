'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Canvas } from 'fabric';
import { ToolType, DEFAULT_TOOL_CONFIG } from '@/types/tools';
import { Board } from '@/types/board';
import { loadCanvasState } from '@/lib/canvas-serializer';
import { exportAsPNG, exportAsPDF } from '@/lib/export';
import TopBar from '@/components/topbar/TopBar';

const WhiteboardCanvas = dynamic(
  () => import('@/components/canvas/WhiteboardCanvas'),
  { ssr: false }
);

export default function ViewPage() {
  const params = useParams();
  const shareId = params.shareId as string;

  const [boardName, setBoardName] = useState('Loading...');
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState(false);

  const canvasRef = useRef<Canvas | null>(null);

  useEffect(() => {
    async function loadSharedBoard() {
      try {
        const res = await fetch(`/api/share/${shareId}`);
        if (!res.ok) {
          setError(true);
          setBoardName('Board not found');
          return;
        }

        const board: Board = await res.json();
        setBoardName(board.name);

        const waitForCanvas = setInterval(() => {
          if (canvasRef.current) {
            clearInterval(waitForCanvas);
            loadCanvasState(canvasRef.current, board.canvasState).then(() => {
              // Make all objects non-interactive
              const canvas = canvasRef.current!;
              canvas.selection = false;
              canvas.forEachObject((obj) => {
                obj.selectable = false;
                obj.evented = false;
              });
              canvas.renderAll();
            });
          }
        }, 100);
      } catch {
        setError(true);
        setBoardName('Error loading board');
      }
    }
    loadSharedBoard();
  }, [shareId]);

  const handleCanvasReady = useCallback((canvas: Canvas) => {
    canvasRef.current = canvas;
    canvas.selection = false;

    canvas.on('mouse:wheel', () => {
      setZoom(canvas.getZoom());
    });
  }, []);

  const handleZoomIn = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const newZoom = Math.min(canvas.getZoom() * 1.2, 20);
    const center = canvas.getCenterPoint();
    canvas.zoomToPoint(center, newZoom);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const newZoom = Math.max(canvas.getZoom() / 1.2, 0.1);
    const center = canvas.getCenterPoint();
    canvas.zoomToPoint(center, newZoom);
    setZoom(newZoom);
  };

  const handleZoomReset = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.renderAll();
    setZoom(1);
  };

  const handleExportPNG = () => {
    if (canvasRef.current) exportAsPNG(canvasRef.current, boardName);
  };

  const handleExportPDF = () => {
    if (canvasRef.current) exportAsPDF(canvasRef.current, boardName);
  };

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Board Not Found
          </h1>
          <p className="text-gray-500">
            This shared link may be invalid or the board may have been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100">
      <TopBar
        boardName={boardName}
        onBoardNameChange={() => {}}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onShare={() => {}}
        onExportPNG={handleExportPNG}
        onExportPDF={handleExportPDF}
        readOnly
      />

      <div className="pt-12">
        <WhiteboardCanvas
          activeTool={ToolType.PAN}
          toolConfig={DEFAULT_TOOL_CONFIG}
          setActiveTool={() => {}}
          onCanvasReady={handleCanvasReady}
          readOnly
        />
      </div>
    </div>
  );
}
