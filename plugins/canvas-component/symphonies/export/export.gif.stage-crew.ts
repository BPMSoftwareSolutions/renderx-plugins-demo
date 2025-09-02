// Stage-crew handler: Export SVG component to GIF
import GIF from "gif.js.optimized";
import workerUrl from "gif.js.optimized/dist/gif.worker.js?url";

function makeGifEncoder(
  width: number,
  height: number,
  opts?: Partial<{
    repeat: number;
    quality: number;
    workers: number;
  }>
) {
  return new GIF({
    workers: opts?.workers ?? 2,
    workerScript: workerUrl,
    quality: opts?.quality ?? 10, // lower = better quality, slower
    repeat: opts?.repeat ?? 0, // 0=infinite
    width,
    height,
  });
}

export async function exportSvgToGif(data: any, ctx: any) {
  try {
    if (typeof document === "undefined") {
      ctx.payload.error = "Browser environment required for GIF export";
      return;
    }

    // Initial payload arrives as `data`; ctx.payload is the baton across beats.
    // Since this sequence has a single beat, prefer `data` and fallback to ctx.payload for tests.
    const baton =
      data && Object.keys(data || {}).length > 0 ? data : ctx.payload || {};
    const { targetId, options } = baton as any;

    if (!targetId) {
      ctx.payload.error = "No target element ID provided";
      return;
    }

    // Find the target SVG element
    const svgEl = document.getElementById(targetId) as SVGElement | null;
    if (!svgEl) {
      ctx.payload.error = `Element with ID "${targetId}" not found`;
      return;
    }

    if (svgEl.tagName.toLowerCase() !== "svg") {
      ctx.payload.error = "Selected element is not an SVG";
      return;
    }

    // Determine output size
    const bbox = svgEl.getBoundingClientRect();
    const width = Math.round(options?.width ?? bbox.width);
    const height = Math.round(options?.height ?? bbox.height);

    if (width <= 0 || height <= 0) {
      ctx.payload.error = "Invalid dimensions for export";
      return;
    }

    ctx.logger?.info?.(
      `Exporting SVG "${targetId}" to GIF (${width}x${height})`
    );

    // Rasterize SVG to canvas (fast path for MVP)
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    const dataUri =
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx2d = canvas.getContext("2d");

    if (!ctx2d) {
      ctx.payload.error = "2D context unavailable";
      return;
    }

    // Load and draw SVG
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Optional background fill (transparent by default)
          if (options?.backgroundColor) {
            ctx2d.fillStyle = options.backgroundColor;
            ctx2d.fillRect(0, 0, width, height);
          }

          ctx2d.drawImage(img, 0, 0, width, height);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = (error) => reject(error);
      img.src = dataUri;
    });

    // Encode GIF using gif.js
    const gif = makeGifEncoder(width, height, {
      workers: 2,
      quality: 10,
      repeat: 0,
    });

    // Add single frame for static GIF
    gif.addFrame(canvas, { delay: 100, copy: true });

    // Handle completion and trigger download
    gif.on("finished", (blob: Blob) => {
      try {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${targetId}-${Date.now()}.gif`;
        a.click();
        URL.revokeObjectURL(url);

        ctx.payload.downloadTriggered = true;
        ctx.payload.gifSize = blob.size;
        ctx.logger?.info?.(`GIF export completed: ${blob.size} bytes`);
      } catch (error) {
        ctx.logger?.error?.("Failed to trigger download:", error);
        ctx.payload.error = `Download failed: ${error}`;
      }
    });

    gif.on("progress", (progress: number) => {
      ctx.logger?.info?.(
        `GIF encoding progress: ${Math.round(progress * 100)}%`
      );
    });

    // Start encoding
    gif.render();
  } catch (error) {
    ctx.logger?.error?.("Failed to export SVG to GIF:", error);
    ctx.payload.error = String(error);
    ctx.payload.downloadTriggered = false;
  }
}
