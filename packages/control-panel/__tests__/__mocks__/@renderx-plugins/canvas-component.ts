/* eslint-disable play-routing/no-hardcoded-play-ids */
// Mock implementation for @renderx-plugins/canvas-component
import { vi } from 'vitest';

// Mock handlers for canvas component operations
export const handlers = {
  resolveTemplate: vi.fn((data: any, ctx: any) => {
    // Mock template resolution
    const template = data.component?.template || {};
    ctx.payload = { template, resolved: true };
    return ctx;
  }),

  createNode: vi.fn((data: any, ctx: any) => {
    // Mock node creation
    const position = data.position || { x: 0, y: 0 };
    const template = ctx.payload?.template || {};
    const element = document.createElement(template.tag || 'button');
    element.id = `mock-node-${Date.now()}`;
    element.textContent = template.text || '';
    element.style.position = 'absolute';
    element.style.left = `${position.x}px`;
    element.style.top = `${position.y}px`;

    if (template.classes) {
      element.className = template.classes.join(' ');
    }

    // Apply initial dimensions from template if provided
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

    ctx.payload = { element, id: element.id, nodeId: element.id, position };
    return ctx;
  }),

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
    }
    
    const canvas = document.getElementById('rx-canvas');
    if (canvas) {
      canvas.appendChild(element);
    }
    
    ctx.payload = { element, id: element.id };
    return ctx;
  }),
  
  update: vi.fn((data: any, ctx: any) => {
    // Mock update handler
    const element = document.getElementById(data.id);
    if (element && data.text !== undefined) {
      element.textContent = data.text;
    }
    ctx.payload = { element, updated: true };
    return ctx;
  }),
  
  drag: vi.fn((data: any, ctx: any) => {
    // Mock drag handler
    const element = document.getElementById(data.id);
    if (element && data.position) {
      element.style.left = `${data.position.x}px`;
      element.style.top = `${data.position.y}px`;
    }
    ctx.payload = { element, dragged: true };
    return ctx;
  }),
  
  resize: vi.fn((data: any, ctx: any) => {
    // Mock resize handler
    const element = document.getElementById(data.id);
    if (element && data.dimensions) {
      element.style.width = `${data.dimensions.width}px`;
      element.style.height = `${data.dimensions.height}px`;
    }
    ctx.payload = { element, resized: true };
    return ctx;
  }),

  refreshControlPanel: vi.fn((data: any, ctx: any) => {
    // Mock refresh control panel handler
    const elementId = ctx.payload?.elementId;
    if (ctx.conductor?.play && elementId) {
      ctx.conductor.play(
        "ControlPanelPlugin",
        "control-panel-update-symphony",
        { id: elementId, source: "attribute-update" }
      );
    }
    ctx.payload = { refreshed: true };
    return ctx;
  }),

  updateAttribute: vi.fn((data: any, ctx: any) => {
    // Mock attribute update handler
    const element = document.getElementById(data.id) as HTMLElement | null;
    if (element) {
      switch (data.attribute) {
        case 'content':
          element.textContent = data.value;
          break;
        case 'bg-color':
        case 'backgroundColor':
          element.style.backgroundColor = data.value;
          break;
        case 'text-color':
        case 'color':
          element.style.color = data.value;
          break;
        case 'width':
          element.style.width = `${data.value}px`;
          break;
        case 'height':
          element.style.height = `${data.value}px`;
          break;
        case 'x':
          element.style.left = `${data.value}px`;
          element.style.position = element.style.position || 'absolute';
          break;
        case 'y':
          element.style.top = `${data.value}px`;
          element.style.position = element.style.position || 'absolute';
          break;
        case 'variant':
          // Support specific component bases: button, image, input, paragraph, heading
          {
            const classes = Array.from(element.classList);
            const base = ['rx-button', 'rx-image', 'rx-input', 'rx-paragraph', 'rx-heading']
              .find(b => classes.includes(b));
            if (base) {
              const prefix = `${base}--`;
              classes
                .filter(c => c.startsWith(prefix))
                .forEach(c => element.classList.remove(c));
              element.classList.add(`${prefix}${data.value}`);
            }
          }
          break;
        case 'disabled':
          if (data.value) element.setAttribute('disabled', '');
          else element.removeAttribute('disabled');
          break;
        default:
          // ignore unknowns
          break;
      }
    }
    ctx.payload = { element, updated: true, attribute: data.attribute, value: data.value };
    return ctx;
  })
};

// Export default handlers
export default handlers;
