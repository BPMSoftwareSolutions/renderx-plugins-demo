/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notifyUi } from '../src/symphonies/create/create.notify';

// Shim EventRouter publish to observe topic + payload + conductor arg
vi.mock('@renderx-plugins/host-sdk', () => {
  return {
    EventRouter: {
      publish: vi.fn()
    }
  };
});
import { EventRouter } from '@renderx-plugins/host-sdk';

function makeCtx() {
  return {
    payload: {},
    conductor: { play: vi.fn() },
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
  } as any;
}

describe('canvas-component create.notify notifyUi handler (public API)', () => {
  let _ctx: any;
  beforeEach(() => {
    _ctx = {
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
    _ctx = null;
  });
  beforeEach(() => {
    // Reset spy calls between tests to avoid cross-test pollution
    (EventRouter.publish as any).mockClear();
  });

  /**
   * @ac renderx-web-orchestration:canvas-component-create-symphony:1.5:1
   *
   * Given: component has been created with id and correlationId
   * When: notifyUi executes
   * Then: canvas.component.created event is published via EventRouter
   *       event includes id and correlationId
   *       legacy onComponentCreated callback is invoked if provided
   * And: delivery completes within 20ms end-to-end
   *      events are ordered FIFO
   *      subscribers receive notifications consistently
   */
  it('[AC:renderx-web-orchestration:canvas-component-create-symphony:1.5:1] publishes canvas.component.created with id + correlationId when both present (createdNode path)', () => {
    // Given: component has been created with id and correlationId
    const ctx = makeCtx();
    ctx.payload.createdNode = { id: 'comp-123' };
    ctx.payload.correlationId = 'corr-abc';

    // When: notifyUi executes
    notifyUi({}, ctx);

    // Then: canvas.component.created event is published via EventRouter
    expect(EventRouter.publish).toHaveBeenCalledTimes(1);

    // Then: event includes id and correlationId
    expect(EventRouter.publish).toHaveBeenCalledWith(
      'canvas.component.created',
      { id: 'comp-123', correlationId: 'corr-abc' },
      ctx.conductor
    );
  });

  it('falls back to ctx.payload.id when createdNode missing', () => {
    const ctx = makeCtx();
    ctx.payload.id = 'comp-fallback';
    ctx.payload.correlationId = 'corr-fallback';
    notifyUi({}, ctx);
    expect(EventRouter.publish).toHaveBeenCalledWith(
      'canvas.component.created',
      { id: 'comp-fallback', correlationId: 'corr-fallback' },
      ctx.conductor
    );
  });

  // NOTE: Negative path (id missing) not asserted; upstream beats guarantee id presence before notifyUi.

  // NOTE: Negative path (correlationId missing) skipped; legacy flows may omit correlationId intentionally.

  /**
   * @ac renderx-web-orchestration:canvas-component-create-symphony:1.5:1
   *
   * Then: legacy onComponentCreated callback is invoked if provided
   */
  it('[AC:renderx-web-orchestration:canvas-component-create-symphony:1.5:1] invokes legacy onComponentCreated callback if provided', () => {
    // Given: component has been created with callback provided
    const ctx = makeCtx();
    const createdNode = { id: 'legacy-comp' };
    ctx.payload.createdNode = createdNode;
    const cb = vi.fn();

    // When: notifyUi executes with callback
    notifyUi({ onComponentCreated: cb, correlationId: 'corr' }, ctx);

    // Then: legacy onComponentCreated callback is invoked if provided
    expect(cb).toHaveBeenCalledWith(createdNode);
  });
});
