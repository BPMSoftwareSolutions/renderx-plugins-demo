import { resolveInteraction } from "../../../../src/interactionManifest";

/**
 * Transform import component data to canvas.component.create format
 */
function transformImportDataToCreateFormat(importComponent: any): any {
  const template: any = {
    tag: importComponent.tag,
    classes: importComponent.classRefs || [],
    style: importComponent.style || {},
    text: importComponent.content?.text || importComponent.content?.content,
    // Map other content properties as needed
    cssVariables: importComponent.cssVariables || {},
    css: importComponent.css,
  };

  // Set container role if this is a container component
  if (
    importComponent.classRefs &&
    importComponent.classRefs.includes("rx-container")
  ) {
    template.attributes = { "data-role": "container" };
  }

  // Include content properties if they exist
  if (
    importComponent.content &&
    Object.keys(importComponent.content).length > 0
  ) {
    template.content = importComponent.content;
  }

  // Add dimensions to template if available
  if (importComponent.layout?.width && importComponent.layout?.height) {
    template.dimensions = {
      width: importComponent.layout.width,
      height: importComponent.layout.height,
    };
  }

  return {
    component: {
      template,
    },
    position: {
      x: importComponent.layout?.x || 0,
      y: importComponent.layout?.y || 0,
    },
    containerId: importComponent.parentId || undefined,
    // Override nodeId to preserve imported IDs
    _overrideNodeId: importComponent.id,
  };
}

// Helper function to apply content properties to DOM elements
function applyContentProperties(
  element: HTMLElement,
  content: Record<string, any>,
  type: string
) {
  // Apply type-specific content properties
  switch (type) {
    case "button":
      // Set button text content
      if (content.content !== undefined) {
        element.textContent = String(content.content);
      } else if (content.text !== undefined) {
        element.textContent = String(content.text);
      }
      // Set disabled state
      if (content.disabled === true) {
        element.setAttribute("disabled", "");
      } else if (content.disabled === false) {
        element.removeAttribute("disabled");
      }
      break;

    case "input":
      const inputEl = element as HTMLInputElement;
      // Set input-specific properties
      if (content.placeholder !== undefined) {
        inputEl.placeholder = String(content.placeholder);
      }
      if (content.value !== undefined) {
        inputEl.value = String(content.value);
      }
      if (content.inputType !== undefined) {
        inputEl.type = String(content.inputType);
      }
      if (content.disabled === true) {
        inputEl.disabled = true;
      } else if (content.disabled === false) {
        inputEl.disabled = false;
      }
      if (content.required === true) {
        inputEl.required = true;
      } else if (content.required === false) {
        inputEl.required = false;
      }
      break;

    case "container":
    case "div":
      // For containers, set text content if provided
      if (content.text !== undefined) {
        element.textContent = String(content.text);
      }
      break;

    default:
      // For other elements, set text content if provided
      if (content.text !== undefined) {
        element.textContent = String(content.text);
      } else if (content.content !== undefined) {
        element.textContent = String(content.content);
      }
      break;
  }
}

/**
 * NEW: Sequential component creation handler that uses canvas.component.create
 * as the single source of truth for all component creation
 */
export async function createComponentsSequentially(_data: any, ctx: any) {
  const components: any[] = ctx.payload.importComponents || [];
  const r = resolveInteraction("canvas.component.create");

  // Track created components for hierarchy application
  ctx.payload.createdComponents = [];

  for (const comp of components) {
    // Transform import data to canvas.component.create format
    const createPayload = transformImportDataToCreateFormat(comp);

    // Add interaction handlers (same as library drop flow)
    createPayload.onDragStart = (info: any) => {
      // Match CanvasDrop.ts behavior: mark drag in progress; no resolver call
      try {
        (globalThis as any).__cpDragInProgress = true;
      } catch {}
    };

    createPayload.onDragMove = (info: any) => {
      // Use the same resolver as CanvasDrop.ts
      try {
        const dragRoute = resolveInteraction("canvas.component.drag.move");
        ctx.conductor?.play?.(dragRoute.pluginId, dragRoute.sequenceId, {
          event: "canvas:component:drag:move",
          ...info,
        });
      } catch {}
    };

    createPayload.onDragEnd = (info: any) => {
      // Match CanvasDrop.ts behavior: clear flag; no resolver call
      try {
        (globalThis as any).__cpDragInProgress = false;
      } catch {}
    };

    createPayload.onSelected = (info: any) => {
      // Handle selection for imported components
      try {
        const selectRoute = resolveInteraction("canvas.component.select");
        ctx.conductor?.play?.(selectRoute.pluginId, selectRoute.sequenceId, {
          id: info.id,
        });
      } catch {}
    };

    // Call canvas.component.create for each component
    await ctx.conductor?.play?.(r.pluginId, r.sequenceId, createPayload);

    ctx.payload.createdComponents.push({
      id: comp.id,
      parentId: comp.parentId,
      siblingIndex: comp.siblingIndex,
    });
  }
}

export function applyHierarchyAndOrder(_data: any, ctx: any) {
  const list: any[] = ctx.payload.importComponents || [];
  const byParent = new Map<string | null, any[]>();

  for (const c of list) {
    const p = c.parentId ?? null;
    if (!byParent.has(p)) byParent.set(p, []);
    byParent.get(p)!.push(c);
  }

  // Sort each sibling group by siblingIndex
  for (const [parentId, group] of byParent) {
    group.sort((a, b) => (a.siblingIndex || 0) - (b.siblingIndex || 0));
    const parentEl = parentId
      ? (document.getElementById(parentId) as HTMLElement | null)
      : null;
    const container = parentEl || document.getElementById("rx-canvas");
    if (!container) continue;
    for (const child of group) {
      const el = document.getElementById(child.id) as HTMLElement | null;
      if (!el) continue;
      container.appendChild(el); // appending in order enforces sibling order
    }
  }
}
