import { Canvas, util } from 'fabric';

function getAllObjectsBounds(canvas: Canvas) {
  const objects = canvas.getObjects();
  if (objects.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  objects.forEach((obj) => {
    const rect = obj.getBoundingRect();
    minX = Math.min(minX, rect.left);
    minY = Math.min(minY, rect.top);
    maxX = Math.max(maxX, rect.left + rect.width);
    maxY = Math.max(maxY, rect.top + rect.height);
  });

  return {
    left: minX,
    top: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function exportAsPNG(canvas: Canvas, boardName: string) {
  const objects = canvas.getObjects();
  if (objects.length === 0) return;

  // Save current viewport
  const currentVPT = [...canvas.viewportTransform!];
  canvas.viewportTransform = [1, 0, 0, 1, 0, 0] as any;
  canvas.renderAll();

  const bounds = getAllObjectsBounds(canvas);
  if (!bounds) return;

  const dataURL = canvas.toDataURL({
    format: 'png',
    quality: 1,
    left: bounds.left - 20,
    top: bounds.top - 20,
    width: bounds.width + 40,
    height: bounds.height + 40,
    multiplier: 2,
  });

  // Restore viewport
  canvas.viewportTransform = currentVPT as any;
  canvas.renderAll();

  // Trigger download
  const link = document.createElement('a');
  link.download = `${boardName || 'whiteboard'}.png`;
  link.href = dataURL;
  link.click();
}

export async function exportAsPDF(canvas: Canvas, boardName: string) {
  const objects = canvas.getObjects();
  if (objects.length === 0) return;

  const { jsPDF } = await import('jspdf');

  // Save current viewport
  const currentVPT = [...canvas.viewportTransform!];
  canvas.viewportTransform = [1, 0, 0, 1, 0, 0] as any;
  canvas.renderAll();

  const bounds = getAllObjectsBounds(canvas);
  if (!bounds) return;

  const dataURL = canvas.toDataURL({
    format: 'png',
    quality: 1,
    left: bounds.left - 20,
    top: bounds.top - 20,
    width: bounds.width + 40,
    height: bounds.height + 40,
    multiplier: 2,
  });

  // Restore viewport
  canvas.viewportTransform = currentVPT as any;
  canvas.renderAll();

  const isLandscape = bounds.width > bounds.height;
  const pdf = new jsPDF(isLandscape ? 'landscape' : 'portrait');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;

  const availWidth = pageWidth - margin * 2;
  const availHeight = pageHeight - margin * 2;
  const scale = Math.min(
    availWidth / bounds.width,
    availHeight / bounds.height
  );

  const imgWidth = bounds.width * scale;
  const imgHeight = bounds.height * scale;
  const x = (pageWidth - imgWidth) / 2;
  const y = (pageHeight - imgHeight) / 2;

  pdf.addImage(dataURL, 'PNG', x, y, imgWidth, imgHeight);
  pdf.save(`${boardName || 'whiteboard'}.pdf`);
}
