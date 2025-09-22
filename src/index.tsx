import React from "react";
import { createRoot } from "react-dom/client";
import App from "./ui/App";
import { initConductor, registerAllSequences } from "./core/conductor"; // via barrel
import { initInteractionManifest, getInteractionManifestStats, resolveInteraction } from "./core/manifests/interactionManifest";
import { initTopicsManifest, getTopicsManifestStats, getTopicDef } from "./core/manifests/topicsManifest";
import { getPluginManifestStats, verifyArtifactsIntegrity } from "./core/startup/startupValidation";
import { EventRouter } from "./core/events/EventRouter";
import "./global.css";
import { listComponents, getComponentById, onInventoryChanged } from "./domain/components/inventory/inventory.service";
import { cssRegistry } from "./domain/css/cssRegistry.facade";
declare const process: { env?: Record<string, string | undefined> } | undefined;

(async () => {
  const conductor = await initConductor();
  await Promise.all([
    registerAllSequences(conductor),
    initInteractionManifest(),
    initTopicsManifest(),
    EventRouter.init(),
  ]);

  (window as any).RenderX = (window as any).RenderX || {};
  // Expose the initialized conductor globally so SDK/hooks/events resolve the same instance
  if (!(window as any).RenderX.conductor) {
    (window as any).RenderX.conductor = conductor;
  }
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
  (window as any).RenderX.sequencesReady = true;

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

      // E2E readiness beacon: expose minimal, test-friendly object and fire an event
      try {
        const mountedIds = (conductor as any).getMountedPluginIds?.() || [];
        const readiness = {
          flag: false, // Will be set to true when Library components are loaded
          routes: interactionStats.routeCount,
          topics: topicsStats.topicCount,
          plugins: pluginStats.pluginCount,
          mountedCount: mountedIds.length,
          pluginIds: mountedIds,
          libraryComponentsLoaded: false,
          when: Date.now(),
        };
        (window as any).__rx = (window as any).__rx || {};
        (window as any).__rx.ready = readiness;

        // Set up a function to mark Library components as loaded and complete readiness
        (window as any).__rx.markLibraryComponentsLoaded = () => {
          if ((window as any).__rx?.ready) {
            (window as any).__rx.ready.libraryComponentsLoaded = true;
            (window as any).__rx.ready.flag = true; // Now fully ready
            try { window.dispatchEvent(new CustomEvent('renderx:ready', { detail: readiness })); } catch {}
          }
        };

        // Start a timer to check for Library components in the DOM
        // This is a fallback approach since we can't modify the external Library plugin
        const checkLibraryComponents = () => {
          const librarySlot = document.querySelector('[data-slot="library"]');
          if (librarySlot) {
            const draggableElements = librarySlot.querySelectorAll('[draggable="true"], [draggable]');
            if (draggableElements.length > 0) {
              (window as any).__rx.markLibraryComponentsLoaded();
              return;
            }
          }
          // Check again in 100ms if components not found yet
          setTimeout(checkLibraryComponents, 100);
        };

        // Start checking after a short delay to allow UI to mount
        setTimeout(checkLibraryComponents, 500);

      } catch {}
    } catch (e) {
      console.warn("Startup validation failed", e);
    }
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
