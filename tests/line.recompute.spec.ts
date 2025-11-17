import { describe, it, expect, beforeEach } from 'vitest';
import { recomputeLineSvg } from '../packages/canvas-component/src/symphonies/augment/line.recompute.stage-crew';

function createSvg(): SVGSVGElement {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg') as unknown as SVGSVGElement;
  // make it measurable in jsdom by setting style width/height
  (svg as unknown as HTMLElement).style.width = '100px';
  (svg as unknown as HTMLElement).style.height = '100px';
  return svg;
}

describe('recomputeLineSvg', () => {
  it('computes viewBox and line attributes for inline css vars', () => {
    const svg = createSvg();
    const host = svg as unknown as HTMLElement;
    // set simple inline CSS vars: x1=10, y1=20, x2=90, y2=80
    host.style.setProperty('--x1', '10');
    host.style.setProperty('--y1', '20');
    host.style.setProperty('--x2', '90');
    host.style.setProperty('--y2', '80');

    recomputeLineSvg(svg);

    const line = svg.querySelector('line.segment') as SVGLineElement | null;
    expect(line).toBeTruthy();
    if (!line) return;
    // With width/height 100, toVbX(10)=10, y->10 etc.
    expect(line.getAttribute('x1')).toBe('10');
    expect(line.getAttribute('y1')).toBe('20');
    expect(line.getAttribute('x2')).toBe('90');
    expect(line.getAttribute('y2')).toBe('80');

    const vb = svg.getAttribute('viewBox');
    expect(vb).toBeTruthy();
  });
});
