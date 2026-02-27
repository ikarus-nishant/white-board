import { Canvas } from 'fabric';
import { CanvasState } from '@/types/board';

export function serializeCanvas(canvas: Canvas): CanvasState {
  const json = canvas.toJSON();
  // Strip data URL image sources to avoid bloating the saved JSON
  const objects = (json.objects || []).map((obj: Record<string, unknown>) => {
    if (obj.type === 'image' && typeof obj.src === 'string' && obj.src.startsWith('data:')) {
      return { ...obj, src: '' };
    }
    return obj;
  });
  return {
    version: json.version || '6.0.0',
    objects,
    background: (json.background as string) || '#F8F9FA',
  };
}

export async function loadCanvasState(
  canvas: Canvas,
  state: CanvasState
): Promise<void> {
  await canvas.loadFromJSON({
    version: state.version,
    objects: state.objects,
    background: state.background,
  });
  canvas.renderAll();
}
