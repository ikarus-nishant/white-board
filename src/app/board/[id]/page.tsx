'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Canvas, FabricImage } from 'fabric';
import { ToolType, ToolConfig, DEFAULT_TOOL_CONFIG } from '@/types/tools';
import { Board } from '@/types/board';
import { serializeCanvas, loadCanvasState } from '@/lib/canvas-serializer';
import { exportAsPNG, exportAsPDF } from '@/lib/export';
import Toolbar from '@/components/toolbar/Toolbar';
import StylePanel from '@/components/panels/StylePanel';
import TopBar from '@/components/topbar/TopBar';
import ShareDialog from '@/components/topbar/ShareDialog';
import { Toaster, toast } from 'sonner';

const WhiteboardCanvas = dynamic(
  () => import('@/components/canvas/WhiteboardCanvas'),
  { ssr: false }
);

export default function BoardPage() {
  const params = useParams();
  const boardId = params.id as string;

  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.SELECT);
  const [toolConfig, setToolConfig] = useState<ToolConfig>(DEFAULT_TOOL_CONFIG);
  const [boardName, setBoardName] = useState('Untitled Board');
  const [zoom, setZoom] = useState(1);
  const [hasSelection, setHasSelection] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const canvasRef = useRef<Canvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boardNameRef = useRef(boardName);
  boardNameRef.current = boardName;

  // Load board data from API
  useEffect(() => {
    async function loadBoard() {
      try {
        const res = await fetch(`/api/boards/${boardId}`);
        if (res.ok) {
          const board: Board = await res.json();
          setBoardName(board.name);
          setShareId(board.shareId);

          const waitForCanvas = setInterval(() => {
            if (canvasRef.current) {
              clearInterval(waitForCanvas);
              if (board.canvasState.objects.length > 0) {
                loadCanvasState(canvasRef.current, board.canvasState);
              }
              setLoaded(true);
            }
          }, 100);
        } else {
          setLoaded(true);
        }
      } catch {
        setLoaded(true);
      }
    }
    loadBoard();
  }, [boardId]);

  // Auto-save to Vercel Blob via API
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        const canvasState = serializeCanvas(canvas);
        await fetch(`/api/boards/${boardId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: boardNameRef.current, canvasState }),
        });
      } catch {
        // Silent fail for auto-save
      }
    }, 3000);
  }, [boardId]);

  // Place an image (from file or data URL) on the canvas
  const placeImageOnCanvas = useCallback(async (dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imgEl = await FabricImage.fromURL(dataUrl);
    const maxDim = 600;
    const scale = Math.min(maxDim / (imgEl.width || maxDim), maxDim / (imgEl.height || maxDim), 1);
    imgEl.scale(scale);

    // Place at center of current viewport
    const vpt = canvas.viewportTransform!;
    const cx = (-vpt[4] + canvas.getWidth() / 2) / canvas.getZoom();
    const cy = (-vpt[5] + canvas.getHeight() / 2) / canvas.getZoom();
    imgEl.set({
      left: cx - ((imgEl.width || 0) * scale) / 2,
      top: cy - ((imgEl.height || 0) * scale) / 2,
    });

    canvas.add(imgEl);
    canvas.setActiveObject(imgEl);
    canvas.renderAll();
  }, []);

  // Ctrl+V paste handler for images
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!canvasRef.current) return;

      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (!blob) continue;

          // Upload to Vercel Blob
          const formData = new FormData();
          formData.append('file', blob, `pasted-image.${item.type.split('/')[1] || 'png'}`);
          formData.append('boardId', boardId);

          try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Upload failed');
            const { url } = await res.json();
            const imgEl = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });

            const maxDim = 600;
            const scale = Math.min(maxDim / (imgEl.width || maxDim), maxDim / (imgEl.height || maxDim), 1);
            imgEl.scale(scale);

            const canvas = canvasRef.current!;
            const vpt = canvas.viewportTransform!;
            const cx = (-vpt[4] + canvas.getWidth() / 2) / canvas.getZoom();
            const cy = (-vpt[5] + canvas.getHeight() / 2) / canvas.getZoom();
            imgEl.set({
              left: cx - ((imgEl.width || 0) * scale) / 2,
              top: cy - ((imgEl.height || 0) * scale) / 2,
            });

            canvas.add(imgEl);
            canvas.setActiveObject(imgEl);
            canvas.renderAll();
            toast.success('Image pasted');
          } catch {
            // Fallback: use data URL directly
            const reader = new FileReader();
            reader.onload = async (event) => {
              const dataUrl = event.target?.result as string;
              await placeImageOnCanvas(dataUrl);
              toast.success('Image pasted');
            };
            reader.readAsDataURL(blob);
          }
          return;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [boardId, placeImageOnCanvas]);

  // Track canvas changes for auto-save
  const handleCanvasReady = useCallback(
    (canvas: Canvas) => {
      canvasRef.current = canvas;

      canvas.on('object:added', triggerAutoSave);
      canvas.on('object:modified', triggerAutoSave);
      canvas.on('object:removed', triggerAutoSave);

      canvas.on('selection:created', () => setHasSelection(true));
      canvas.on('selection:updated', () => setHasSelection(true));
      canvas.on('selection:cleared', () => setHasSelection(false));

      canvas.on('mouse:wheel', () => {
        setZoom(canvas.getZoom());
      });
    },
    [triggerAutoSave]
  );

  const getHelpers = () => (canvasRef.current as any)?.__helpers;

  const handleUndo = () => getHelpers()?.undo?.();
  const handleRedo = () => getHelpers()?.redo?.();

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

  const handleDeleteSelected = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    active.forEach((obj) => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.renderAll();
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvasRef.current) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('boardId', boardId);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();

      const imgEl = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
      imgEl.scaleToWidth(400);
      imgEl.set({ left: 100, top: 100 });
      canvasRef.current.add(imgEl);
      canvasRef.current.setActiveObject(imgEl);
      canvasRef.current.renderAll();
      toast.success('Image uploaded');
    } catch {
      // Fallback: load image locally via data URL
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        await placeImageOnCanvas(dataUrl);
        toast.success('Image added (local only)');
      };
      reader.readAsDataURL(file);
    }

    e.target.value = '';
  };

  const handleShare = () => setShareDialogOpen(true);

  const handleGenerateShareLink = async (): Promise<string> => {
    const res = await fetch(`/api/share/${boardId}`, { method: 'POST' });
    const data = await res.json();
    setShareId(data.shareId);
    return data.shareId;
  };

  const handleExportPNG = () => {
    if (canvasRef.current) exportAsPNG(canvasRef.current, boardName);
  };

  const handleExportPDF = () => {
    if (canvasRef.current) exportAsPDF(canvasRef.current, boardName);
  };

  const handleBoardNameChange = (name: string) => {
    setBoardName(name);
    triggerAutoSave();
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100">
      <Toaster position="bottom-right" />

      <TopBar
        boardName={boardName}
        onBoardNameChange={handleBoardNameChange}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onShare={handleShare}
        onExportPNG={handleExportPNG}
        onExportPDF={handleExportPDF}
      />

      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onImageUpload={handleImageUpload}
      />

      <StylePanel
        toolConfig={toolConfig}
        setToolConfig={setToolConfig}
        onDeleteSelected={handleDeleteSelected}
        hasSelection={hasSelection}
      />

      <div className="pt-12">
        <WhiteboardCanvas
          activeTool={activeTool}
          toolConfig={toolConfig}
          setActiveTool={setActiveTool}
          onCanvasReady={handleCanvasReady}
        />
      </div>

      <ShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        boardId={boardId}
        shareId={shareId}
        onGenerateLink={handleGenerateShareLink}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
