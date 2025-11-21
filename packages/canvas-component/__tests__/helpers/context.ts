// Shared lightweight test context helpers for canvas-component handler tests
import { vi } from 'vitest';

export interface TestCtx {
  conductor: { play: ReturnType<typeof vi.fn> };
  logger: { info: ReturnType<typeof vi.fn>; warn: ReturnType<typeof vi.fn> };
  payload: Record<string, any>;
  baton?: any;
}

export function createMockCtx(partial: Partial<TestCtx> = {}): TestCtx {
  const ctx: TestCtx = {
    conductor: { play: vi.fn() },
    logger: { info: vi.fn(), warn: vi.fn() },
    payload: {},
    ...partial,
  };
  return ctx;
}

// Simple spy injector for EventRouter.publish (host-sdk mock)
export function mockEventRouterPublish() {
  const publish = vi.fn(async () => undefined);
  // Host SDK may attach EventRouter to global or module scope; we shim minimal surface
  (globalThis as any).EventRouter = { publish };
  return publish;
}
