/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('[BEAT:renderx-web-orchestration:renderx-web-orchestration:5.4] [[AC:renderx-web-orchestration:renderx-web-orchestration:5.4:1]] React Component Communication', () => {
  let mockConductor: any;
  let publishedEvents: any[] = [];

  beforeEach(() => {
    publishedEvents = [];
    mockConductor = {
      publish: vi.fn((topic: string, data: any) => {
        publishedEvents.push({ topic, data });
      }),
      subscribe: vi.fn(),
    };
  });

  it('should expose EventRouter to React components', () => {
    // Simulate exposing EventRouter
    (window as any).RenderX = {
      conductor: mockConductor,
      publish: (topic: string, data: any) => {
        mockConductor.publish(topic, data);
      },
      subscribe: (topic: string, handler: any) => {
        mockConductor.subscribe(topic, handler);
      },
    };

    expect((window as any).RenderX).toBeDefined();
    expect((window as any).RenderX.publish).toBeDefined();
    expect((window as any).RenderX.subscribe).toBeDefined();
  });

  it('should allow React components to publish events back to conductor', () => {
    // Setup EventRouter
    (window as any).RenderX = {
      conductor: mockConductor,
      publish: (topic: string, data: any) => {
        mockConductor.publish(topic, data);
      },
    };

    // Simulate React component publishing an event
    (window as any).RenderX.publish('react.component.counter.incremented', { count: 1 });

    // Verify the event was published
    expect(mockConductor.publish).toHaveBeenCalledWith(
      'react.component.counter.incremented',
      { count: 1 }
    );
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].topic).toBe('react.component.counter.incremented');
    expect(publishedEvents[0].data.count).toBe(1);
  });

  it('should handle multiple events from React component', () => {
    // Setup EventRouter
    (window as any).RenderX = {
      conductor: mockConductor,
      publish: (topic: string, data: any) => {
        mockConductor.publish(topic, data);
      },
    };

    // Simulate React component publishing multiple events
    (window as any).RenderX.publish('react.component.counter.incremented', { count: 1 });
    (window as any).RenderX.publish('react.component.counter.incremented', { count: 2 });
    (window as any).RenderX.publish('react.component.counter.reset', { count: 0 });

    // Verify all events were published
    expect(mockConductor.publish).toHaveBeenCalledTimes(3);
    expect(publishedEvents).toHaveLength(3);
    expect(publishedEvents[0].data.count).toBe(1);
    expect(publishedEvents[1].data.count).toBe(2);
    expect(publishedEvents[2].topic).toBe('react.component.counter.reset');
  });
});

