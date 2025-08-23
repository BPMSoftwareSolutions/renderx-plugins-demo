export const sequence = {
  id: "library-component-drag-symphony",
  name: "Library Component Drag",
  movements: [
    {
      id: "drag",
      name: "Drag",
      beats: [
        {
          beat: 1,
          event: "library:component:drag:start",
          title: "Start Drag",
          dynamics: "mf",
          handler: "onDragStart",
          timing: "immediate",
        },
      ],
    },
  ],
} as const;

export const handlers = {
  onDragStart(data: any) {
    const e = data?.domEvent;
    const dt = e?.dataTransfer;

    // Always set the payload for drop handlers
    dt?.setData(
      "application/rx-component",
      JSON.stringify({ component: data.component })
    );

    // Enhance UX: provide a blurred drag preview (ghost image) sized to the component
    try {
      if (typeof document !== "undefined" && dt?.setDragImage) {
        // Determine desired ghost dimensions
        const targetEl = (e?.target as HTMLElement) || null;
        let width: number | undefined;
        let height: number | undefined;

        // Prefer template-provided dimensions if available
        const tplDim = (data?.component as any)?.template?.dimensions;
        if (tplDim) {
          if (Number.isFinite(tplDim.width)) width = tplDim.width;
          if (Number.isFinite(tplDim.height)) height = tplDim.height;
        }
        // Fallback to dragged element size
        if ((!width || !height) && targetEl?.getBoundingClientRect) {
          const rect = targetEl.getBoundingClientRect();
          width = width ?? Math.round(rect.width);
          height = height ?? Math.round(rect.height);
        }
        // Final defaults
        width = width ?? 120;
        height = height ?? 40;

        // Build a temporary element to use as the drag image
        const ghost = document.createElement("div");
        ghost.style.width = `${width}px`;
        ghost.style.height = `${height}px`;
        ghost.style.boxSizing = "border-box";
        ghost.style.padding = "0";
        ghost.style.margin = "0";
        ghost.style.position = "absolute";
        ghost.style.left = "-9999px";
        ghost.style.top = "-9999px";
        ghost.style.pointerEvents = "none";
        ghost.style.background = "transparent";
        // Slight blur to distinguish as a ghost image
        ghost.style.filter = "blur(2px)";
        ghost.style.opacity = "0.9";

        // Compose preview from component.template first (single source of truth)
        const tplObj = (data?.component as any)?.template;
        if (tplObj && typeof tplObj === "object") {
          const child = document.createElement(tplObj?.tag || "div");
          try {
            const classes: string[] = Array.isArray(tplObj?.classes)
              ? (tplObj.classes as string[])
              : [];
            classes.forEach((cls) => child.classList.add(cls));
          } catch {}
          if (typeof tplObj?.text === "string") child.textContent = tplObj.text;
          child.style.width = `${width}px`;
          child.style.height = `${height}px`;
          child.style.display = "inline-block";
          ghost.appendChild(child);

          if (typeof tplObj?.css === "string") {
            const styleEl = document.createElement("style");
            styleEl.textContent = tplObj.css;
            ghost.appendChild(styleEl);
          }
          const vars = tplObj?.cssVariables;
          if (vars && typeof vars === "object") {
            for (const [k, v] of Object.entries(vars)) {
              try {
                const name = String(k).startsWith("--") ? String(k) : `--${k}`;
                ghost.style.setProperty(name, String(v));
              } catch {}
            }
          }
        } else if (targetEl) {
          // Fallback: clone the dragged element
          const clone = targetEl.cloneNode(true) as HTMLElement;
          clone.style.width = `${width}px`;
          clone.style.height = `${height}px`;
          clone.style.display = clone.style.display || "inline-block";
          clone.style.boxSizing = "border-box";
          ghost.appendChild(clone);
        }

        document.body.appendChild(ghost);

        // Use cursor-relative offsets so the ghost stays under the pointer
        let offsetX = Math.round((width as number) / 2);
        let offsetY = Math.round((height as number) / 2);
        if (
          targetEl &&
          typeof e?.clientX === "number" &&
          typeof e?.clientY === "number"
        ) {
          try {
            const rect = targetEl.getBoundingClientRect();
            offsetX = Math.max(0, Math.round(e.clientX - rect.left));
            offsetY = Math.max(0, Math.round(e.clientY - rect.top));
          } catch {}
        }

        try {
          dt.setDragImage(ghost, offsetX, offsetY);
        } finally {
          // Clean up soon after to avoid DOM leaks in real browser/JSDOM
          if (typeof requestAnimationFrame === "function") {
            requestAnimationFrame(() => ghost.remove());
          } else {
            // Fallback cleanup
            setTimeout(() => ghost.remove(), 0);
          }
        }
      }
    } catch {
      // Best-effort: if anything goes wrong, continue without custom drag image
    }

    return { started: true };
  },
};
