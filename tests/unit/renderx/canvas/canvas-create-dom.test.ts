import path from 'path';

// We will stub React for this test so we can import TSX without installing React
// Use a per-test module isolation to avoid affecting other tests

describe('CanvasElement - renders pure component element with positioning and CSS', () => {
  const created: Array<{ type: any; props: any; children: any[] }>[] = [] as any;

  beforeEach(() => {
    // Clean head styles between tests
    while (document.head.firstChild) {
      document.head.removeChild(document.head.firstChild);
    }
  });

  it('creates a <button> element (no wrapper), applies position and injects CSS', async () => {
    await jest.isolateModulesAsync(async () => {
      // Per-module arrays to capture created elements
      const localCreated: Array<{ type: any; props: any; children: any[] }> = [];
      created.push(localCreated);

      // Virtual React stub
      jest.doMock('react', () => {
        return {
          __esModule: true,
          default: {},
          createElement: (type: any, props: any, ...children: any[]) => {
            localCreated.push({ type, props, children });
            return { type, props, children };
          },
          useEffect: (fn: any) => fn(),
          useState: (init: any) => [init, () => {}],
          useCallback: (fn: any) => fn,
        };
      }, { virtual: true });

      const mod = await import(path.posix.join('RenderX', 'src', 'components', 'CanvasElement.tsx')) as any;
      const CanvasElement = mod.default as (props: any) => any;

      const componentData = {
        metadata: { name: 'Button', type: 'button' },
        ui: {
          template: '<button class="btn {{variant}}">{{content}}</button>',
          styles: { css: '.btn { background: rgb(1, 2, 3); color: rgb(250, 250, 250); }' },
          tools: { resize: { handles: ['n','s','e','w'] } },
        },
        integration: { canvasIntegration: { defaultWidth: 80, defaultHeight: 24 } },
      };

      const elementId = 'rx-comp-button-testid';

      // Invoke component (function component call is fine for our stub)
      CanvasElement({
        element: {
          id: elementId,
          type: 'button',
          position: { x: 50, y: 30 },
          style: {},
          componentData,
          metadata: componentData.metadata,
        },
        elementId,
        cssClass: elementId,
      });

      // One element should be created and it should be a <button>
      expect(localCreated.length).toBeGreaterThan(0);
      const root = localCreated.find(n => n.type === 'button');
      expect(root).toBeTruthy();

      // No wrapper div created by CanvasElement around the button
      // i.e., the first created node should be the button itself
      const first = localCreated[0];
      expect(first.type).toBe('button');

      // Positioning applied directly on the button
      const style = root!.props?.style || {};
      expect(style.position).toBe('absolute');
      expect(style.left).toBe(50);
      expect(style.top).toBe(30);
      // Width/height from integration defaults present
      expect(style.width === 80 || style.width === '80px').toBeTruthy();
      expect(style.height === 24 || style.height === '24px').toBeTruthy();

      // CSS injected for component styles
      const styles = Array.from(document.head.querySelectorAll('style')) as HTMLStyleElement[];
      expect(styles.length).toBeGreaterThan(0);
      const anyStyleHasBtnRule = styles.some(s => /\.btn\s*\{/.test(s.textContent || ''));
      expect(anyStyleHasBtnRule).toBe(true);
    });
  });
});

