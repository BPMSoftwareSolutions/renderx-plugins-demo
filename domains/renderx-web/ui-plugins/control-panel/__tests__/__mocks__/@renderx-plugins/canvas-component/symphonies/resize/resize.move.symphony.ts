/* eslint-disable beat-kind/beat-kind-dom-access */
// Mock implementation for canvas component resize symphony
import { vi } from 'vitest';

export const handlers = {
  resize: vi.fn((data: any, ctx: any) => {
    // Mock resize handler
    const element = document.getElementById(data.id);
    if (element && data.dimensions) {
      element.style.width = `${data.dimensions.width}px`;
      element.style.height = `${data.dimensions.height}px`;
    }
    ctx.payload = { element, resized: true, dimensions: data.dimensions };
    return ctx;
  }),

  updateSize: vi.fn((data: any, ctx: any) => {
    // Mock size update supporting start* + delta or direct dimensions
    const element = document.getElementById(data.id) as HTMLElement | null;
    if (element) {
      let width: number | null = null;
      let height: number | null = null;

      if (data.dimensions && typeof data.dimensions.width === 'number' && typeof data.dimensions.height === 'number') {
        width = data.dimensions.width;
        height = data.dimensions.height;
      } else if (
        typeof data.startWidth === 'number' &&
        typeof data.startHeight === 'number' &&
        typeof data.dx === 'number' &&
        typeof data.dy === 'number'
      ) {
        // Basic SE resize behavior
        width = data.startWidth + data.dx;
        height = data.startHeight + data.dy;
      }

      if (width != null) element.style.width = `${width}px`;
      if (height != null) element.style.height = `${height}px`;
    }

    ctx.dimensions = { width: parseInt(element?.style.width || '0', 10), height: parseInt(element?.style.height || '0', 10) };
    return ctx;
  })
};
