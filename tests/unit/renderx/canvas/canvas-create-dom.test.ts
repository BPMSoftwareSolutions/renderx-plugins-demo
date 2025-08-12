import path from 'path';

// We will stub React for this test so we can import TSX without installing React
// Use a per-test module isolation to avoid affecting other tests

describe.skip('Canvas UI Plugin renderCanvasNode - renders pure component element with CSS (no wrapper, no inline positioning)', () => {
  const created: Array<{ type: any; props: any; children: any[] }>[] = [] as any;

  beforeEach(() => {
    // Clean head styles between tests
    while (document.head.firstChild) {
      document.head.removeChild(document.head.firstChild);
    }
  });

  it('creates a <button> element (no wrapper), injects CSS (position via instance CSS, not inline)', async () => {
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

      const plugin = await import(path.posix.join('RenderX', 'public', 'plugins', 'canvas-ui-plugin', 'index.js')) as any;
      const { renderCanvasNode } = plugin as any;

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

      const el = renderCanvasNode({
        id: elementId,
        cssClass: elementId,
        type: 'button',
        position: { x: 50, y: 30 },
        component: componentData,
      });

      // One element should be created and it should be a <button>
      expect(localCreated.length).toBeGreaterThan(0);
      const root = localCreated.find(n => n.type === 'button');
      expect(root).toBeTruthy();

      // No wrapper div created by CanvasElement around the button
      // i.e., the first created node should be the button itself
      const first = localCreated[0];
      expect(first.type).toBe('button');

      // Position should NOT be inline; plugin injects per-instance CSS styles
      const style = root!.props?.style || {};
      expect(style.position).toBeUndefined();
      expect(style.left).toBeUndefined();
      expect(style.top).toBeUndefined();

      // CSS injected for component styles and instance positioning
      const styles = Array.from(document.head.querySelectorAll('style')) as HTMLStyleElement[];
      expect(styles.length).toBeGreaterThan(0);
      const hasComponentCss = styles.some(s => /\.btn\s*\{/.test(s.textContent || ''));
      const hasInstanceCss = styles.some(s => new RegExp(`\\.${elementId}\\{[^}]*position:absolute`).test(s.textContent || ''));
      expect(hasComponentCss).toBe(true);
      expect(hasInstanceCss).toBe(true);
    });
  });
});

