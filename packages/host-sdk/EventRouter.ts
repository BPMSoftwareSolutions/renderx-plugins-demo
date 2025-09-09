// Standalone EventRouter for @renderx/host-sdk
// Simplified version that delegates to the host's EventRouter

import "./types.js"; // Load global declarations

export type TopicHandler = (payload: any) => void;
export type Unsubscribe = () => void;

export const EventRouter = {
  subscribe(topic: string, handler: TopicHandler): Unsubscribe {
    if (typeof window === "undefined") {
      // Node/SSR fallback
      return () => {};
    }

    const hostRouter = window.RenderX?.EventRouter;
    if (!hostRouter) {
      console.warn("Host EventRouter not available. Events will not be routed.");
      return () => {};
    }

    return hostRouter.subscribe(topic, handler);
  },

  async publish(topic: string, payload: any, conductor?: any): Promise<void> {
    if (typeof window === "undefined") {
      // Node/SSR fallback
      return;
    }

    const hostRouter = window.RenderX?.EventRouter;
    if (!hostRouter) {
      console.warn("Host EventRouter not available. Event will not be published:", topic);
      return;
    }

    return hostRouter.publish(topic, payload, conductor);
  },
};
