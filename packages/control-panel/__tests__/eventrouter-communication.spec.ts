/**
 * Test to verify EventRouter-based communication works with Control Panel package imports
 * This replaces the observer pattern and should work across module boundaries
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EventRouter } from "@renderx-plugins/host-sdk";

describe('Control Panel EventRouter Communication', () => {
  let unsubscribeFunctions: (() => void)[] = [];

  beforeEach(async () => {
    // Ensure clean router state to avoid replayed payloads from previous tests
    (EventRouter as any).reset?.();

    // Clean up any existing subscriptions from previous tests first
    unsubscribeFunctions.forEach(unsub => unsub());
    unsubscribeFunctions = [];

    // Give a small delay to let EventRouter fully process unsubscriptions
    await new Promise(resolve => setTimeout(resolve, 5));
  });

  afterEach(() => {
    // Clean up subscriptions
    unsubscribeFunctions.forEach(unsub => unsub());
    unsubscribeFunctions = [];
  });

  it('publishes control.panel.selection.updated events via EventRouter', async () => {
    // Test that EventRouter can publish and receive the new topics
    const mockSelectionModel = {
      header: { type: 'button', id: 'test-button-123' },
      layout: { x: 100, y: 150, width: 200, height: 50 }
    };

    let receivedData: any = null;
    const unsubscribe = EventRouter.subscribe('control.panel.selection.updated', (data: any) => {
      receivedData = data;
    });
    unsubscribeFunctions.push(unsubscribe);

    // Simulate what the symphony would do
    EventRouter.publish('control.panel.selection.updated', mockSelectionModel);

    // Allow event to process
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(receivedData).toEqual(mockSelectionModel);
    expect(receivedData.header.type).toBe('button');
    expect(receivedData.layout.x).toBe(100);
  });

  it('publishes control.panel.classes.updated events via EventRouter', async () => {
    const mockClassData = {
      id: 'test-element-456',
      classes: ['btn', 'btn-primary', 'large']
    };

    let receivedData: any = null;
    const unsubscribe = EventRouter.subscribe('control.panel.classes.updated', (data: any) => {
      receivedData = data;
    });
    unsubscribeFunctions.push(unsubscribe);

    EventRouter.publish('control.panel.classes.updated', mockClassData);

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(receivedData).toEqual(mockClassData);
    expect(receivedData.classes).toContain('btn-primary');
  });

  it('publishes control.panel.css.registry.updated events via EventRouter', async () => {
    const mockCssData = {
      success: true,
      className: 'custom-style',
      content: '.custom-style { color: red; }',
      error: null,
      timestamp: Date.now()
    };

    let receivedData: any = null;
    const unsubscribe = EventRouter.subscribe('control.panel.css.registry.updated', (data: any) => {
      receivedData = data;
    });
    unsubscribeFunctions.push(unsubscribe);

    EventRouter.publish('control.panel.css.registry.updated', mockCssData);

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(receivedData).toEqual(mockCssData);
    expect(receivedData.success).toBe(true);
    expect(receivedData.className).toBe('custom-style');
  });

  it('allows multiple Control Panel components to listen for selection updates', async () => {
    // Test scenario: Control Panel header and Control Panel sidebar both listen for selection updates
    const headerReceived: any[] = [];
    const sidebarReceived: any[] = [];

    const headerUnsub = EventRouter.subscribe('control.panel.selection.updated', (data: any) => {
      headerReceived.push(data);
    });
    const sidebarUnsub = EventRouter.subscribe('control.panel.selection.updated', (data: any) => {
      sidebarReceived.push(data);
    });
    unsubscribeFunctions.push(headerUnsub, sidebarUnsub);

    // Use a unique id to avoid interference from replayed events between tests
    const uniqueId = `test-button-${Math.random().toString(36).slice(2, 7)}`;
    const selectionData = {
      header: { type: 'button', id: uniqueId },
      content: { content: 'Click me' }
    };

    await EventRouter.publish('control.panel.selection.updated', selectionData);

    await new Promise(resolve => setTimeout(resolve, 15));

    // Both components should receive an event matching our unique id
    expect(headerReceived.some(e => e?.header?.id === uniqueId)).toBe(true);
    expect(sidebarReceived.some(e => e?.header?.id === uniqueId)).toBe(true);
  });

  it('enables Control Panel UI package to receive symphony events', async () => {
    // Test scenario: Control Panel UI (loaded as package) receives events from Control Panel symphonies

    const id = `form-field-${Math.random().toString(36).slice(2, 6)}`;
    const controlPanelUiData = {
      header: { type: 'input', id },
      layout: { x: 100, y: 50, width: 200, height: 30 }
    };

    // Simulate Control Panel UI subscribing to updates
    let uiReceivedUpdate: any = null;
    const uiUnsubscribe = EventRouter.subscribe('control.panel.selection.updated', (data: any) => {
      if (data?.header?.id === id) uiReceivedUpdate = data;
    });
    unsubscribeFunctions.push(uiUnsubscribe);

    // Simulate Control Panel symphony publishing an update
    await EventRouter.publish('control.panel.selection.updated', controlPanelUiData);

    await new Promise(resolve => setTimeout(resolve, 15));

    // Some environments may replay the last payload; assert our unique id is received
    expect(uiReceivedUpdate?.header?.id).toBe(id);
  });
});

