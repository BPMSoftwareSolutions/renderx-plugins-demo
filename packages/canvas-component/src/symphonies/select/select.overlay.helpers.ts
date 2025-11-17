export type Point = { x: number; y: number };

export class CoordinateConverter {
  private minX: number;
  private minY: number;
  private vbW: number;
  private vbH: number;
  private containerWidth: number;
  private containerHeight: number;

  constructor(viewBox: string | number[], containerRect: DOMRect) {
    const vb = Array.isArray(viewBox)
      ? viewBox
      : (String(viewBox || "0 0 100 100").split(/\s+/).map((v) => parseFloat(v)) as number[]);
    this.minX = Number.isFinite(vb[0]) ? vb[0] : 0;
    this.minY = Number.isFinite(vb[1]) ? vb[1] : 0;
    this.vbW = Number.isFinite(vb[2]) && vb[2] !== 0 ? vb[2] : 100;
    this.vbH = Number.isFinite(vb[3]) && vb[3] !== 0 ? vb[3] : 100;
    this.containerWidth = Math.max(0, Math.round(containerRect.width));
    this.containerHeight = Math.max(0, Math.round(containerRect.height));
  }

  svgToPixel(nx: number, ny: number): Point {
    const x = ((nx - this.minX) / this.vbW) * this.containerWidth;
    const y = ((ny - this.minY) / this.vbH) * this.containerHeight;
    return { x, y };
  }

  pixelToSvg(px: number, py: number): Point {
    const x = (px / this.containerWidth) * this.vbW + this.minX;
    const y = (py / this.containerHeight) * this.vbH + this.minY;
    return { x, y };
  }
}

export function createOverlayStructure(canvas: HTMLElement) {
  let ov = document.getElementById("rx-adv-line-overlay") as HTMLDivElement | null;
  if (!ov) {
    ov = document.createElement("div");
    ov.id = "rx-adv-line-overlay";
    ov.className = "rx-adv-line-overlay";
    const a = document.createElement("div");
    a.className = "handle a";
    const b = document.createElement("div");
    b.className = "handle b";
    ov.appendChild(a);
    ov.appendChild(b);
    canvas.appendChild(ov);
  }
  // cleanup legacy handles
  Array.from(ov.querySelectorAll(".handle.curve, .handle.rotate")).forEach((n) => n.remove());
  if (!ov.querySelector(".handle.a")) {
    const a = document.createElement("div");
    a.className = "handle a";
    ov.appendChild(a);
  }
  if (!ov.querySelector(".handle.b")) {
    const b = document.createElement("div");
    b.className = "handle b";
    ov.appendChild(b);
  }
  return ov as HTMLDivElement;
}

function readCssNumber(target: HTMLElement, cs: CSSStyleDeclaration | null, name: string, fallback: string) {
  const inline = target.style.getPropertyValue(name);
  const comp = cs && typeof cs.getPropertyValue === "function" ? cs.getPropertyValue(name) : "";
  const val = inline || comp || fallback;
  const n = parseFloat(String(val));
  return Number.isFinite(n) ? n : parseFloat(fallback);
}

export function resolveEndpoints(target: HTMLElement): { a: Point; b: Point } {
  // Attempt to resolve from actual SVG geometry first, then CSS vars
  const r = target.getBoundingClientRect();
  const svg = target as unknown as SVGSVGElement;

  const vb = (svg.getAttribute && svg.getAttribute("viewBox")
    ? svg.getAttribute("viewBox")
    : "0 0 100 100")
    .split(/\s+/)
    .map((v) => parseFloat(v));
  const [minX, minY, vbW, vbH] = [vb[0] || 0, vb[1] || 0, vb[2] || 100, vb[3] || 100];
  const conv = new CoordinateConverter([minX, minY, vbW, vbH], r);

  const line = svg.querySelector ? (svg.querySelector("line.segment") as SVGLineElement | null) : null;
  const path = svg.querySelector ? (svg.querySelector("path.segment-curve") as SVGPathElement | null) : null;

  let pA = { x: 0, y: 0 };
  let pB = { x: r.width, y: r.height };

  if (line && line.style.display !== "none") {
    const nx1 = parseFloat(line.getAttribute("x1") || "0");
    const ny1 = parseFloat(line.getAttribute("y1") || "0");
    const nx2 = parseFloat(line.getAttribute("x2") || "100");
    const ny2 = parseFloat(line.getAttribute("y2") || "0");
    pA = conv.svgToPixel(nx1, ny1);
    pB = conv.svgToPixel(nx2, ny2);
  } else if (path && path.style.display !== "none") {
    const total = typeof path.getTotalLength === "function" ? path.getTotalLength() : 0;
    if (total > 0 && typeof path.getPointAtLength === "function") {
      const s = path.getPointAtLength(0);
      const e = path.getPointAtLength(total);
      pA = conv.svgToPixel(s.x, s.y);
      pB = conv.svgToPixel(e.x, e.y);
    }
  } else {
    const cs = typeof window !== "undefined" ? getComputedStyle(target) : null;
    const ax = readCssNumber(target as HTMLElement, cs, "--x1", "0");
    const ay = readCssNumber(target as HTMLElement, cs, "--y1", "0");
    const bx = readCssNumber(target as HTMLElement, cs, "--x2", String(r.width));
    const by = readCssNumber(target as HTMLElement, cs, "--y2", String(ay));
    pA = { x: ax, y: ay };
    pB = { x: bx, y: by };
  }

  // Rotation
  const cs = typeof window !== "undefined" ? getComputedStyle(target) : null;
  const angleStr = (target.style.getPropertyValue("--angle") || (cs && typeof cs.getPropertyValue === "function" ? cs.getPropertyValue("--angle") : "0")) as string;
  const angle = parseFloat(angleStr || "0");
  if (Number.isFinite(angle) && Math.abs(angle) > 0.0001) {
    const rad = (angle * Math.PI) / 180;
    const mx = (pA.x + pB.x) / 2;
    const my = (pA.y + pB.y) / 2;
    const rot = (p: Point) => {
      const dx = p.x - mx;
      const dy = p.y - my;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      return { x: mx + dx * cos - dy * sin, y: my + dx * sin + dy * cos };
    };
    pA = rot(pA);
    pB = rot(pB);
  }

  return { a: pA, b: pB };
}
