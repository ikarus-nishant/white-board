export enum ToolType {
  SELECT = 'select',
  PAN = 'pan',
  PENCIL = 'pencil',
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  LINE = 'line',
  TEXT = 'text',
  ERASER = 'eraser',
  IMAGE = 'image',
}

export interface ToolConfig {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  fontSize: number;
}

export const DEFAULT_TOOL_CONFIG: ToolConfig = {
  strokeColor: '#000000',
  fillColor: 'transparent',
  strokeWidth: 2,
  opacity: 1,
  fontSize: 24,
};
