/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "../../src/domain/css/sanitizeHtml";

// Helper to simulate gallery ingestion; samples are small so sync import is fine.
async function loadSample(path: string): Promise<string> {
  const mod = await import(path + "?raw"); // Vite raw import pattern
  return (mod as any).default || (mod as any);
}

describe("Gallery sample integration (sanitization smoke)", () => {
  const svgSamples = [
    "../../docs/samples/svg-sample-bar-chart.html",
    "../../docs/samples/svg-sample-line-chart-animated.html",
    "../../docs/samples/svg-sample-network-diagram.html",
    "../../docs/samples/svg-sample-process-flow.html",
    "../../docs/samples/svg-sample-animated-pulse.html",
    "../../docs/samples/svg-dark-mode-line-chart.html",
  ];

  it("sanitizes all SVG samples without stripping core structure", async () => {
    for (const p of svgSamples) {
      const raw = await loadSample(p);
      const out = sanitizeHtml(raw);
      expect(out.length).toBeGreaterThan(20);
      expect(out).toMatch(/<svg/i);
      expect(out).not.toMatch(/<script/i);
    }
  });

  it("retains animate / gradient elements where present", async () => {
    const animated = await loadSample(
      "../../docs/samples/svg-sample-line-chart-animated.html"
    );
    const pulse = await loadSample(
      "../../docs/samples/svg-sample-animated-pulse.html"
    );
    const grad = await loadSample(
      "../../docs/samples/svg-sample-bar-chart.html"
    );
    const outA = sanitizeHtml(animated);
    const outP = sanitizeHtml(pulse);
    const outG = sanitizeHtml(grad);
    expect(outA).toMatch(/animateTransform/);
    expect(outP).toMatch(/animate/);
    expect(outG).toMatch(/linearGradient/i);
  });
});
