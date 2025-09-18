import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
// Force TS source to avoid stale compiled JS shadowing in dev
import { initConductor, registerAllSequences } from "./conductor";
import { initInteractionManifest, getInteractionManifestStats, resolveInteraction } from "./interactionManifest";
import { initTopicsManifest, getTopicsManifestStats, getTopicDef } from "./topicsManifest";
import { getPluginManifestStats, verifyArtifactsIntegrity } from "./startupValidation";
import { EventRouter } from "./EventRouter";
import "./global.css";
import { listComponents, getComponentById, onInventoryChanged } from "./inventory";
// Updated import: cssRegistry now lives under domain/css
import { cssRegistry } from "./domain/css/cssRegistry.facade";
// minimal ambient typing for optional env flag without pulling full @types/node
declare const process: { env?: Record<string, string | undefined> } | undefined;

(async () => {
  const conductor = await initConductor();
  await Promise.all([
    registerAllSequences(conductor),
    initInteractionManifest(),
    initTopicsManifest(),
    EventRouter.init(),
  ]);

  // Expose host resolvers/routers for externalized plugins via Host SDK delegation
  (window as any).RenderX = (window as any).RenderX || {};
  if (!(window as any).RenderX.resolveInteraction) {
    (window as any).RenderX.resolveInteraction = resolveInteraction;
  }
  if (!(window as any).RenderX.getTopicDef) {
    (window as any).RenderX.getTopicDef = getTopicDef;
  }
  if (!(window as any).RenderX.EventRouter) {
    (window as any).RenderX.EventRouter = {
      publish: (topic: string, payload: any, c?: any) => {
        try { console.log(`[sdk] publish '${topic}' (hasC=${!!c}, hasPlay=${!!(c && c.play)})`); } catch {}
        return EventRouter.publish(topic, payload, c || conductor);
      },
      subscribe: (topic: string, cb: (p: any) => void) => EventRouter.subscribe(topic, cb),
      init: () => EventRouter.init(),
      getTopicsStats: () => ({}) as any,
    } as any;
  }

  // Expose inventory and cssRegistry facades for SDK delegation
  if (!(window as any).RenderX.inventory) {
    (window as any).RenderX.inventory = {
      listComponents,
      getComponentById,
      onInventoryChanged,
    } as any;
  }
  if (!(window as any).RenderX.cssRegistry) {
    (window as any).RenderX.cssRegistry = cssRegistry as any;
  }
  // Signal that runtime registration and catalog mounting have completed
  (window as any).RenderX.sequencesReady = true;

  // Add debug function for manual testing
  (window as any).testEventRouter = function() {
    console.log('🧪 Testing EventRouter...');
    const testPayload = { id: 'test-node-manual', type: 'button' };
    console.log('📤 Publishing control.panel.selection.updated with:', testPayload);
    (window as any).RenderX.EventRouter.publish('control.panel.selection.updated', testPayload);
    console.log('✅ Publish complete');
  };

  (window as any).testCanvasSelection = function() {
    console.log('🧪 Testing canvas selection event...');
    const testPayload = { id: 'test-node-manual-canvas' };
    console.log('📤 Publishing canvas.component.selection.changed with:', testPayload);
    (window as any).RenderX.EventRouter.publish('canvas.component.selection.changed', testPayload);
    console.log('✅ Canvas selection publish complete');
  };


  if (!(typeof process !== 'undefined' && process.env?.RENDERX_DISABLE_STARTUP_VALIDATION === '1')) {
    try {
      const interactionStats = getInteractionManifestStats();
      const topicsStats = getTopicsManifestStats();
      const pluginStats = await getPluginManifestStats();
      console.log("🧪 Startup validation:", {
        routes: interactionStats.routeCount,
        topics: topicsStats.topicCount,
        plugins: pluginStats.pluginCount,
      });
    } catch (e) {
      console.warn("Startup validation failed", e);
    }
    // Fire-and-forget integrity verification (dev only)
    verifyArtifactsIntegrity(true);
  }

  const rootEl = document.getElementById("root");
  if (!rootEl) {
    const el = document.createElement("div");
    el.id = "root";
    document.body.appendChild(el);
  }
  const root = createRoot(document.getElementById("root")!);
  root.render(<App />);
})();
