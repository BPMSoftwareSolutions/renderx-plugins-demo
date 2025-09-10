// Vitest global test setup to bridge SDK -> host resolver and provide a safe default conductor
import { resolveInteraction as hostResolve } from "../src/interactionManifest";
import { EventRouter as HostEventRouter } from "../src/EventRouter";

// Ensure a minimal window exists
if (typeof (globalThis as any).window === "undefined") {
  (globalThis as any).window = {} as any;
}

// Expose host resolver and event router to the SDK via RenderX namespace
const g: any = globalThis as any;
g.window.RenderX = g.window.RenderX || {};
g.window.RenderX.resolveInteraction = (key: string) => hostResolve(key);
// Bridge EventRouter so SDK delegates to host implementation
if (!g.window.RenderX.EventRouter) {
  g.window.RenderX.EventRouter = {
    publish: (topic: string, payload: any, conductor?: any) =>
      HostEventRouter.publish(topic, payload, conductor),
    subscribe: (topic: string, cb: (payload: any) => void) =>
      HostEventRouter.subscribe(topic, cb),
    init: () => HostEventRouter.init(),
    getTopicsStats: () => HostEventRouter.getTopicsStats?.(),
  };
}

// Provide a harmless default conductor so SDK useConductor() never throws
// (Tests that need to capture calls pass their own conductor to EventRouter.publish/sequence code.)
if (!g.window.renderxCommunicationSystem) {
  g.window.renderxCommunicationSystem = {
    conductor: {
      play: async (_pluginId: string, _sequenceId: string, _payload?: any) => ({}),
    },
  };
}

