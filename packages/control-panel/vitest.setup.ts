import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock performance.now if not available
if (typeof performance === 'undefined') {
  global.performance = { now: () => Date.now() } as any;
}

// Mock fetch if not available
if (typeof fetch === 'undefined') {
  global.fetch = vi.fn();
}

// Mock globalThis if needed
if (typeof globalThis === 'undefined') {
  (global as any).globalThis = global;
}

// Mock React's act function for testing
global.act = (callback: () => void) => {
  callback();
  return Promise.resolve();
};


// Global mock for host SDK EventRouter and interaction resolution used across tests
vi.mock('@renderx-plugins/host-sdk', () => {
  type Unsub = () => void;
  const topics = new Map<string, Set<(data: any) => void>>();
  const EventRouter = {
    subscribe(topic: string, cb: (data: any) => void): Unsub {
      let set = topics.get(topic);
      if (!set) {
        set = new Set();
        topics.set(topic, set);
      }
      set.add(cb);
      return () => {
        set!.delete(cb);
      };
    },
    async publish(topic: string, payload: any): Promise<void> {
      const set = topics.get(topic);
      if (set) {
        for (const cb of set) cb(payload);
      }
    },
    reset() {
      topics.clear();
    },
  };

  const routes: Record<string, { pluginId: string; sequenceId: string }> = {
    'control.panel.selection.show': { pluginId: 'ControlPanelPlugin', sequenceId: 'control-panel-selection-show-symphony' },
    'control.panel.classes.add': { pluginId: 'ControlPanelPlugin', sequenceId: 'control-panel-classes-add-symphony' },
    'control.panel.classes.remove': { pluginId: 'ControlPanelPlugin', sequenceId: 'control-panel-classes-remove-symphony' },
    'control.panel.update': { pluginId: 'ControlPanelPlugin', sequenceId: 'control-panel-update-symphony' },
  };

  return {
    EventRouter,
    resolveInteraction: (key: string) => routes[key] || { pluginId: 'unknown', sequenceId: 'unknown' },
    isFlagEnabled: (_: string) => false,
  };
});
