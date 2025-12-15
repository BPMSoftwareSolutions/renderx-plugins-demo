/* eslint-disable beat-kind/beat-kind-dom-access */
// Mock implementation for canvas component drag symphony
import { vi } from 'vitest';

export const handlers = {
  drag: vi.fn((data: any, ctx: any) => {
    // Mock drag handler
    const element = document.getElementById(data.id);
    if (element && data.position) {
      element.style.left = `${data.position.x}px`;
      element.style.top = `${data.position.y}px`;
      element.style.position = 'absolute';
    }
    ctx.payload = { element, dragged: true, position: data.position };
    return ctx;
  }),

  updatePosition: vi.fn((data: any, ctx: any) => {
    // Mock position update
    const element = document.getElementById(data.id);
    if (element && data.position) {
      element.style.left = `${data.position.x}px`;
      element.style.top = `${data.position.y}px`;
    }
    ctx.position = data.position;
    return ctx;
  })
};
