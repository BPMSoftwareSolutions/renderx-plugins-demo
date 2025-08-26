import {
  getCanvasOrThrow,
  createElementWithId,
  applyInlineStyle,
  appendTo,
} from "../create/create.dom.stage-crew";
import {
  attachSelection,
  attachDrag,
} from "../create/create.interactions.stage-crew";
import { resolveInteraction } from "../../../../src/interactionManifest";

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

export function createOrUpdateNodes(_data: any, ctx: any) {
  const list: any[] = ctx.payload.importComponents || [];
  const canvas = getCanvasOrThrow();

  for (const comp of list) {
    const existing = document.getElementById(comp.id) as HTMLElement | null;
    const el = existing || createElementWithId(comp.tag, comp.id);

    // Ensure classes
    const classes: string[] = Array.isArray(comp.classRefs)
      ? comp.classRefs
      : [];
    // Attach selection/drag interactions like create flow
    try {
      attachSelection(el, comp.id, ({ id }) => {
        try {
          const r = resolveInteraction("canvas.component.select");
          ctx?.conductor?.play?.(r.pluginId, r.sequenceId, { id });
        } catch {}
      });
      attachDrag(el, canvas, comp.id, {
        onDragStart: undefined,
        onDragMove: undefined,
        onDragEnd: undefined,
      });
    } catch {}

    for (const c of classes) el.classList.add(c);

    // If container, mark role and ensure positioning
    if (classes.includes("rx-container")) {
      (el as HTMLElement).dataset.role = "container";
      if (!(el as HTMLElement).style.position) {
        (el as HTMLElement).style.position = "relative";
      }
    }

    // Apply template.style properties first (background, color, padding, etc.)
    if (comp.style && typeof comp.style === "object") {
      applyInlineStyle(el, comp.style);
    }

    // Apply layout to style (position and dimensions)
    const layoutStyle: Record<string, string> = {
      position: "absolute",
      left: `${Math.round(comp.layout?.x || 0)}px`,
      top: `${Math.round(comp.layout?.y || 0)}px`,
    };
    if (comp.layout?.width != null)
      layoutStyle.width = `${Math.round(comp.layout.width)}px`;
    if (comp.layout?.height != null)
      layoutStyle.height = `${Math.round(comp.layout.height)}px`;
    applyInlineStyle(el, layoutStyle);

    // Apply content properties if they exist
    if (comp.content) {
      applyContentProperties(el, comp.content, comp.type);
    }

    if (!existing) appendTo(canvas, el);
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
