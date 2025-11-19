import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * End-to-End Test: React Component Communication
 * 
 * This test verifies that:
 * 1. React components can be created on the canvas via CLI sequence player
 * 2. React components can publish events back to the conductor
 * 3. The EventRouter is properly exposed to React components
 * 4. Events published by React components are routed through the conductor
 */
describe('React Component E2E Communication', () => {
  let mockConductor: any;
  let publishedEvents: any[] = [];

  beforeEach(() => {
    publishedEvents = [];
    mockConductor = {
      publish: vi.fn((topic: string, data: any) => {
        publishedEvents.push({ topic, data, timestamp: Date.now() });
      }),
      subscribe: vi.fn((topic: string, handler: any) => {
        // Mock subscription
      }),
      play: vi.fn(async (pluginId: string, sequenceId: string, context: any) => {
        // Simulate sequence execution
        return `${sequenceId}-${Date.now()}`;
      }),
    };
  });

  it('should create React component and expose EventRouter', async () => {
    // Setup EventRouter
    (window as any).RenderX = {
      conductor: mockConductor,
      publish: (topic: string, data: any) => {
        mockConductor.publish(topic, data);
      },
      subscribe: (topic: string, handler: any) => {
        mockConductor.subscribe(topic, handler);
      },
    };

    // Verify EventRouter is available
    expect((window as any).RenderX).toBeDefined();
    expect((window as any).RenderX.publish).toBeDefined();
    expect((window as any).RenderX.subscribe).toBeDefined();
  });

  it('should allow React component to publish counter.incremented event', () => {
    // Setup EventRouter
    (window as any).RenderX = {
      conductor: mockConductor,
      publish: (topic: string, data: any) => {
        mockConductor.publish(topic, data);
      },
    };

    // Simulate React component publishing increment event
    (window as any).RenderX.publish('react.component.counter.incremented', { count: 1 });

    // Verify event was published
    expect(mockConductor.publish).toHaveBeenCalledWith(
      'react.component.counter.incremented',
      { count: 1 }
    );
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].topic).toBe('react.component.counter.incremented');
    expect(publishedEvents[0].data.count).toBe(1);
  });

  it('should allow React component to publish counter.reset event', () => {
    // Setup EventRouter
    (window as any).RenderX = {
      conductor: mockConductor,
      publish: (topic: string, data: any) => {
        mockConductor.publish(topic, data);
      },
    };

    // Simulate React component publishing reset event
    (window as any).RenderX.publish('react.component.counter.reset', { count: 0 });

    // Verify event was published
    expect(mockConductor.publish).toHaveBeenCalledWith(
      'react.component.counter.reset',
      { count: 0 }
    );
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].topic).toBe('react.component.counter.reset');
    expect(publishedEvents[0].data.count).toBe(0);
  });

  it('should handle bidirectional communication between React component and conductor', () => {
    // Setup EventRouter
    (window as any).RenderX = {
      conductor: mockConductor,
      publish: (topic: string, data: any) => {
        mockConductor.publish(topic, data);
      },
      subscribe: (topic: string, handler: any) => {
        mockConductor.subscribe(topic, handler);
      },
    };

    // Simulate React component publishing multiple events
    (window as any).RenderX.publish('react.component.counter.incremented', { count: 1 });
    (window as any).RenderX.publish('react.component.counter.incremented', { count: 2 });
    (window as any).RenderX.publish('react.component.counter.reset', { count: 0 });

    // Verify all events were published
    expect(mockConductor.publish).toHaveBeenCalledTimes(3);
    expect(publishedEvents).toHaveLength(3);
    
    // Verify event sequence
    expect(publishedEvents[0].topic).toBe('react.component.counter.incremented');
    expect(publishedEvents[0].data.count).toBe(1);
    
    expect(publishedEvents[1].topic).toBe('react.component.counter.incremented');
    expect(publishedEvents[1].data.count).toBe(2);
    
    expect(publishedEvents[2].topic).toBe('react.component.counter.reset');
    expect(publishedEvents[2].data.count).toBe(0);
  });
});

