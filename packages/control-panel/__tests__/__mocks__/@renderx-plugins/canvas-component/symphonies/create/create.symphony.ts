/* eslint-disable beat-kind/beat-kind-dom-access */
// Mock implementation for canvas component create symphony
import { vi } from 'vitest';

export const handlers = {
  create: vi.fn((data: any, ctx: any) => {
    // Mock create handler - simulates creating a component
    const element = document.createElement(data.tag || 'div');
    element.id = data.id || 'mock-element';
    element.textContent = data.text || '';

    if (data.classes) {
      element.className = data.classes.join(' ');
    }

    if (data.dimensions) {
      element.style.width = `${data.dimensions.width}px`;
      element.style.height = `${data.dimensions.height}px`;
      element.style.position = 'absolute';
    }

    if (data.position) {
      element.style.left = `${data.position.x}px`;
      element.style.top = `${data.position.y}px`;
    }

    const canvas = document.getElementById('rx-canvas');
    if (canvas) {
      canvas.appendChild(element);
    }

    ctx.payload = { element, id: element.id };
    return ctx;
  }),

  resolveTemplate: vi.fn((data: any, ctx: any) => {
    // Mock template resolution
    const template = data.component?.template || {};
    ctx.payload = { ...(ctx.payload || {}), template };
    return ctx;
  }),

  createNode: vi.fn((data: any, ctx: any) => {
    // Mock node creation using resolved template
    const position = data.position || { x: 0, y: 0 };
    const template = ctx.payload?.template || {};
    const element = document.createElement(template.tag || 'div');
    element.id = `mock-node-${Date.now()}`;
    element.textContent = template.text || '';
    element.style.position = 'absolute';
    element.style.left = `${position.x}px`;
    element.style.top = `${position.y}px`;

    if (template.classes) {
      element.className = template.classes.join(' ');
    }

    if (template.dimensions) {
      if (typeof template.dimensions.width === 'number') {
        element.style.width = `${template.dimensions.width}px`;
      }
      if (typeof template.dimensions.height === 'number') {
        element.style.height = `${template.dimensions.height}px`;
      }
    }

    const canvas = document.getElementById('rx-canvas');
    if (canvas) {
      canvas.appendChild(element);
    }

    ctx.payload = { ...(ctx.payload || {}), element, id: element.id, nodeId: element.id, position };
    return ctx;
  })
};
