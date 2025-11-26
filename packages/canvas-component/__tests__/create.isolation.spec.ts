/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Stub EventRouter early so handlers pick up the mock
vi.mock('@renderx-plugins/host-sdk', () => {
  const publish = vi.fn(async () => {});
  return { EventRouter: { publish } };
});

// Mock React + ReactDOM for isolation harness (kept lightweight)
vi.mock('react', () => ({
  default: {
    createElement: vi.fn((type, props, ...children) => ({ type, props, children })),
  },
  startTransition: vi.fn((cb) => cb()),
}));
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({ render: vi.fn(), unmount: vi.fn() })),
}));
// Speed up tests by bypassing heavy Babel transform; return pre-transformed code
vi.mock('@babel/standalone', () => ({
  transform: vi.fn((_code: string) => ({
    code: `export default function MockComponent(props){ return React.createElement('div', null, 'Mock JSX') }`,
  })),
}));

import { handlers as createHandlers } from '../src/symphonies/create/create.symphony';
import { createRoot } from 'react-dom/client';
import { EventRouter } from '@renderx-plugins/host-sdk';

const mockCreateRoot = vi.mocked(createRoot);

function makeCtx() {
  const kvOps: any[] = [];
  const kvPut = vi.fn(async (...args: any[]) => {
    // tiny delay to surface ordering/concurrency issues without flaking
    await new Promise((r) => setTimeout(r, 1));
    kvOps.push(['kv.put', ...args]);
  });
  return {
    payload: {},
    io: { kv: { put: kvPut } },
    conductor: { publish: vi.fn() },
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    _ops: kvOps,
  } as any;
}

function divTemplate() {
  return {
    tag: 'div',
    text: 'Hello',
    classes: ['rx-comp', 'rx-div'],
    css: '.rx-div{color:var(--color,#111827)}',
    cssVariables: { color: '#111827' },
    dimensions: { width: 100, height: 50 },
  } as any;
}

function reactTemplate() {
  return {
    render: { strategy: 'react' },
    content: { reactCode: 'export default function Hello(){ return <div>Hi</div> }', props: {} },
    tag: 'div',
    classes: ['rx-comp', 'rx-react'],
    dimensions: { width: 120, height: 60 },
  } as any;
}

function svgLineTemplate() {
  return {
    tag: 'svg',
    classes: ['rx-comp', 'rx-line'],
    css: '.rx-line .segment{stroke:var(--stroke,#111);stroke-width:var(--thickness,2)}',
    cssVariables: { stroke: '#111827', thickness: 2 },
    dimensions: { width: 120, height: 60 },
  } as any;
}

describe('Isolation harness — Canvas Component Create', () => {
  let ctx: any;
  beforeEach(() => {
    ctx = {
      handler: null, // TODO: Import handler
      mocks: {
        database: vi.fn(),
        fileSystem: vi.fn(),
        logger: vi.fn(),
        eventBus: vi.fn()
      },
      input: {},
      output: null,
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
    vi.clearAllMocks();
  });

  it('creates a div under #rx-canvas, persists via kv.put, and publishes created event', async () => {
    const ctx = makeCtx();
    const data = {
      component: { template: divTemplate() },
      position: { x: 23, y: 45 },
      correlationId: 'corr-iso-1',
    } as any;

    await createHandlers.resolveTemplate(data, ctx);
    await createHandlers.registerInstance(data, ctx);
    await createHandlers.createNode(data, ctx);
    await createHandlers.notifyUi(data, ctx);

    const id = ctx.payload.nodeId as string;
    const el = document.getElementById(id)! as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.parentElement?.id).toBe('rx-canvas');
    expect(el.className).toContain('rx-div');
    expect(el.style.left).toBe('23px');
    expect(el.style.top).toBe('45px');
    expect(el.style.width).toBe('100px');
    expect(el.style.height).toBe('50px');

    // kv.put recorded
    expect(ctx.io.kv.put).toHaveBeenCalledTimes(1);
    const kvArgs = (ctx.io.kv.put as any).mock.calls[0];
    expect(kvArgs[0]).toBe(id);
    expect(kvArgs[1]?.type).toBe('div');

    // publish created
    expect(EventRouter.publish).toHaveBeenCalledWith(
      'canvas.component.created',
      expect.objectContaining({ id, correlationId: 'corr-iso-1' }),
      expect.anything()
    );
  });

  it('creates svg rx-line with child <line.segment> and non-scaling stroke', async () => {
    const ctx = makeCtx();
    const data = { component: { template: svgLineTemplate() }, position: { x: 5, y: 6 } } as any;

    await createHandlers.resolveTemplate(data, ctx);
    await createHandlers.createNode(data, ctx);

    const id = ctx.payload.nodeId as string;
    const svg = document.getElementById(id) as unknown as SVGSVGElement;
    expect(svg?.tagName.toLowerCase()).toBe('svg');

    const seg = svg.querySelector('line.segment') as SVGLineElement | null;
    expect(seg).toBeTruthy();
    expect(seg!.getAttribute('vector-effect')).toBe('non-scaling-stroke');
  });

  it('renders React template via startTransition; on error shows inline error instead of throwing', async () => {
    const ctx = makeCtx();
    const data = { component: { template: reactTemplate() }, position: { x: 10, y: 20 } } as any;

    // Happy path
    const startTime = Date.now();
    await createHandlers.resolveTemplate(data, ctx);
    await createHandlers.registerInstance(data, ctx);
    await createHandlers.createNode(data, ctx);
    await createHandlers.renderReact(data, ctx);
    const elapsed = Date.now() - startTime;

    // Should complete in <100ms (no 500ms after-beat delay from timing fix)
    expect(elapsed).toBeLessThan(100);
    expect(mockCreateRoot).toHaveBeenCalled();
    expect(ctx.payload.reactRendered).toBe(true);

    // Error path: force createRoot to throw, harness should catch and inline error UI
    (createRoot as any).mockImplementationOnce(() => { throw new Error('boom'); });
    const ctx2 = makeCtx();
    await createHandlers.resolveTemplate(data, ctx2);
    await createHandlers.registerInstance(data, ctx2);
    await createHandlers.createNode(data, ctx2);
    await createHandlers.renderReact(data, ctx2);

    const id2 = ctx2.payload.nodeId as string;
    const container = document.getElementById(id2)!;
    expect(container.innerHTML).toContain('React Error:');
    expect(ctx2.payload.reactError).toBeDefined();
  });

  it('optional: stress — N parallel harnesses remain stable (no flakes)', async () => {
    const N = 4;
    const tasks = Array.from({ length: N }).map(async (_, i) => {
      const ctx = makeCtx();
      const data = {
        component: {
          template: {
            ...divTemplate(),
            text: `Hello ${i}`,
            dimensions: { width: 60 + i * 5, height: 30 + i * 3 },
          },
        },
        position: { x: 10 + i * 2, y: 20 + i * 3 },
        correlationId: `corr-${i}`,
      } as any;

      await createHandlers.resolveTemplate(data, ctx);
      await createHandlers.registerInstance(data, ctx);
      await createHandlers.createNode(data, ctx);
      await createHandlers.notifyUi(data, ctx);

      const el = document.getElementById(ctx.payload.nodeId)! as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.left).toBe(`${10 + i * 2}px`);
      expect(el.style.top).toBe(`${20 + i * 3}px`);
    });

    await Promise.all(tasks);

    // Ensure we created N elements
    expect(document.querySelectorAll('#rx-canvas .rx-comp').length).toBeGreaterThanOrEqual(N);
  });
});

