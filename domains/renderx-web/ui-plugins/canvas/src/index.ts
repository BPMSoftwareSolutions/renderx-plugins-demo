export { CanvasPage } from './ui/CanvasPage';
export async function register(conductor?: any) {
  try {
    if (conductor && (conductor as any)._canvasRegistered) return;
    if (conductor) (conductor as any)._canvasRegistered = true;
  } catch {}
}
