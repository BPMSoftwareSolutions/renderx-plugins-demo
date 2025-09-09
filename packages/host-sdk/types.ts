// Global type declarations for @renderx/host-sdk

import type { ConductorClient } from "./conductor";
import type { TopicHandler, Unsubscribe } from "./EventRouter";
import type { Route } from "./interactionManifest";
import type { FlagMeta } from "./feature-flags";

declare global {
  interface Window {
    renderxCommunicationSystem?: {
      conductor: ConductorClient;
    };
    RenderX?: {
      conductor: ConductorClient;
      EventRouter?: {
        subscribe(topic: string, handler: TopicHandler): Unsubscribe;
        publish(topic: string, payload: any, conductor?: any): Promise<void>;
      };
      resolveInteraction?: (key: string) => Route;
      featureFlags?: {
        isFlagEnabled(id: string): boolean;
        getFlagMeta(id: string): FlagMeta | undefined;
        getAllFlags(): Record<string, FlagMeta>;
      };
      componentMapperConfig?: any;
    };
  }
}

export {};
