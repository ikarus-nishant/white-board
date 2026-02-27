import { Canvas } from 'fabric';
import { CanvasState } from '@/types/board';

export function serializeCanvas(canvas: Canvas): CanvasState {
  const json = canvas.toJSON();
  return {
    version: json.version || '6.0.0',
    objects: json.objects || [],
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
