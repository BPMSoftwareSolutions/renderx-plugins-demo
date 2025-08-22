function injectCssFallback(css: string) {
  if (!css) return;
  if (typeof document === "undefined") return;
  const id = "rx-components-styles";
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }
  const text = el.textContent || "";
  if (!text.includes(css)) {
    el.appendChild(document.createTextNode(css));
  }
}

function injectRawCss(ctx: any, css: string) {
  if (!css) return;
  if (ctx?.stageCrew?.injectRawCSS) {
    try {
      ctx.stageCrew.injectRawCSS(css);
      return;
    } catch {}
  }
  injectCssFallback(css);
}

export const createNode = (data: any, ctx: any) => {
  const tpl = ctx.payload.template;
  const id = ctx.payload.nodeId;
  const selector = `#${id}`;

  // 1) Create node via direct DOM and append to canvas
  const canvas =
    typeof document !== "undefined"
      ? document.getElementById("rx-canvas")
      : null;
  if (!canvas) throw new Error("#rx-canvas not found");
  const el = document.createElement(tpl.tag);
  el.setAttribute("id", id);
  // Defer class list until we compute instanceClass

  // 2) Inject component CSS (if provided by JSON schema)
  if (tpl.css) {
    injectRawCss(ctx, tpl.css);
    // queue for UI-side injection if needed
    (ctx.payload._cssQueue ||= []).push(tpl.css);
  }

  // 3) Build a unique, dedicated instance class for this node
  const type = tpl.tag;
  const shortId = String(id).replace(/^rx-node-/, "");
  const instanceClass = `rx-comp-${type}-${shortId}`;

  // 4) Apply variables via CSS custom properties on the instance class
  const cssVars: Record<string, string> = tpl.cssVariables || {};
  const varDecl = Object.entries(cssVars)
    .map(([k, v]) => `--${k}: ${String(v)};`)
    .join(" ");
  if (varDecl) {
    injectRawCss(ctx, `.${instanceClass} { ${varDecl} }`);
  }

  // 5) Build inline style: position + initial size
  const style: Record<string, string> = {};
  if (data?.position) {
    style.position = "absolute";
    style.left =
      typeof data.position.x === "number"
        ? `${data.position.x}px`
        : String(data.position.x);
    style.top =
      typeof data.position.y === "number"
        ? `${data.position.y}px`
        : String(data.position.y);
  }
  if (tpl?.dimensions) {
    const { width, height } = tpl.dimensions;
    if (width != null)
      style.width = typeof width === "number" ? `${width}px` : String(width);
    if (height != null)
      style.height =
        typeof height === "number" ? `${height}px` : String(height);
  }
  // 6) Apply classes and inline style (position + size) and text
  const classList = [...(tpl.classes || []), instanceClass];
  for (const c of classList) el.classList.add(c);
  // Position and dimensions
  Object.assign(el.style, style);
  // Set label text
  if (typeof tpl.text === "string" && tpl.text.length)
    el.textContent = String(tpl.text);

  // Append to canvas
  canvas.appendChild(el);

  // Attach selection listener to play select symphony via conductor if available
  try {
    (el as any).addEventListener?.("click", () => {
      // Prefer ctx.conductor if injected; fall back to global bridge
      const ctxConductor = (ctx as any)?.conductor;
      if (ctxConductor?.play) {
        ctxConductor.play(
          "CanvasComponentSelectionPlugin",
          "canvas-component-select-symphony",
          { id }
        );
        return;
      }
      const anyWin = window as any;
      const conductor = anyWin?.RenderX?.conductor;
      if (conductor?.play) {
        conductor.play(
          "CanvasComponentSelectionPlugin",
          "canvas-component-select-symphony",
          { id }
        );
      }
    });
  } catch {}

  // Attach drag listeners for canvas component dragging
  try {
    let isDragging = false;
    let startPos = { x: 0, y: 0 };
    let elementStartPos = { x: 0, y: 0 };

    (el as any).addEventListener?.("mousedown", (e: MouseEvent) => {
      // Only handle left mouse button
      if (e.button !== 0) return;

      isDragging = true;
      startPos = { x: e.clientX, y: e.clientY };

      // Get current element position
      const rect = el.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      elementStartPos = {
        x: rect.left - canvasRect.left,
        y: rect.top - canvasRect.top,
      };

      // Prevent text selection during drag
      e.preventDefault();

      // Add global listeners for drag
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      // Play drag start symphony
      const ctxConductor = (ctx as any)?.conductor;
      if (ctxConductor?.play) {
        ctxConductor.play(
          "CanvasComponentDragPlugin",
          "canvas-component-drag-symphony",
          {
            event: "canvas:component:drag:start",
            id,
            startPosition: elementStartPos,
            mousePosition: startPos,
          }
        );
      } else {
        const anyWin = window as any;
        const conductor = anyWin?.RenderX?.conductor;
        if (conductor?.play) {
          conductor.play(
            "CanvasComponentDragPlugin",
            "canvas-component-drag-symphony",
            {
              event: "canvas:component:drag:start",
              id,
              startPosition: elementStartPos,
              mousePosition: startPos,
            }
          );
        }
      }
    });

    // Global mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;
      const newPos = {
        x: elementStartPos.x + deltaX,
        y: elementStartPos.y + deltaY,
      };

      // Play drag move symphony
      const ctxConductor = (ctx as any)?.conductor;
      if (ctxConductor?.play) {
        ctxConductor.play(
          "CanvasComponentDragPlugin",
          "canvas-component-drag-symphony",
          {
            event: "canvas:component:drag:move",
            id,
            position: newPos,
            delta: { x: deltaX, y: deltaY },
          }
        );
      } else {
        const anyWin = window as any;
        const conductor = anyWin?.RenderX?.conductor;
        if (conductor?.play) {
          conductor.play(
            "CanvasComponentDragPlugin",
            "canvas-component-drag-symphony",
            {
              event: "canvas:component:drag:move",
              id,
              position: newPos,
              delta: { x: deltaX, y: deltaY },
            }
          );
        }
      }
    };

    // Global mouse up handler
    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;

      isDragging = false;

      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;
      const finalPos = {
        x: elementStartPos.x + deltaX,
        y: elementStartPos.y + deltaY,
      };

      // Play drag end symphony
      const ctxConductor = (ctx as any)?.conductor;
      if (ctxConductor?.play) {
        ctxConductor.play(
          "CanvasComponentDragPlugin",
          "canvas-component-drag-symphony",
          {
            event: "canvas:component:drag:end",
            id,
            finalPosition: finalPos,
            totalDelta: { x: deltaX, y: deltaY },
          }
        );
      } else {
        const anyWin = window as any;
        const conductor = anyWin?.RenderX?.conductor;
        if (conductor?.play) {
          conductor.play(
            "CanvasComponentDragPlugin",
            "canvas-component-drag-symphony",
            {
              event: "canvas:component:drag:end",
              id,
              finalPosition: finalPos,
              totalDelta: { x: deltaX, y: deltaY },
            }
          );
        }
      }

      // Remove global listeners
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  } catch {}

  ctx.payload.createdNode = {
    id,
    tag: tpl.tag,
    text: tpl.text,
    classes: [...(tpl.classes || []), instanceClass],
    style,
    position: data.position,
    css: tpl.css,
    cssVariables: cssVars,
    instanceClass,
  };
};
