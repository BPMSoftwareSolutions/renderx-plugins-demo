import React from "react";
import { createRoot } from "react-dom/client";
import App from "./ui/App";
import { initConductor, registerAllSequences } from "./core/conductor"; // via barrel
import {
  initInteractionManifest,
  getInteractionManifestStats,
  resolveInteraction,
} from "./core/manifests/interactionManifest";
import {
  initTopicsManifest,
  getTopicsManifestStats,
  getTopicDef,
} from "./core/manifests/topicsManifest";
import {
  getPluginManifestStats,
  verifyArtifactsIntegrity,
} from "./core/startup/startupValidation";
import { EventRouter } from "./core/events/EventRouter";
import "./global.css";
import {
  listComponents,
  getComponentById,
  onInventoryChanged,
} from "./domain/components/inventory/inventory.service";
import { cssRegistry } from "./domain/css/cssRegistry.facade";
declare const process: { env?: Record<string, string | undefined> } | undefined;

(async () => {
  const existingConductor =
    typeof window !== "undefined"
      ? (window as any).RenderX?.conductor
      : undefined;
  const conductor = existingConductor || (await initConductor());
  // Ensure global pointer is set to the active conductor (protect against HMR/stale refs)
  (window as any).RenderX = (window as any).RenderX || {};
  (window as any).RenderX.conductor = conductor;
  await Promise.all([
    typeof window !== "undefined" && (window as any).RenderX?.sequencesReady
      ? Promise.resolve()
      : registerAllSequences(conductor),
    initInteractionManifest(),
    initTopicsManifest(),
    EventRouter.init(),
  ]);

  (window as any).RenderX = (window as any).RenderX || {};
  if (!(window as any).RenderX.resolveInteraction) {
    (window as any).RenderX.resolveInteraction = resolveInteraction;
  }
  if (!(window as any).RenderX.getTopicDef) {
    (window as any).RenderX.getTopicDef = getTopicDef;
  }
  // Always refresh the EventRouter bridge to avoid capturing a stale conductor in HMR/StrictMode
  (window as any).RenderX.EventRouter = {
    publish: (topic: string, payload: any, c?: any) => {
      try {
        console.log(
          `[sdk] publish '${topic}' (hasC=${!!c}, hasPlay=${!!(c && c.play)})`
        );
      } catch {}
      return EventRouter.publish(topic, payload, c);
    },
    subscribe: (topic: string, cb: (p: any) => void) =>
      EventRouter.subscribe(topic, cb),
    init: () => EventRouter.init(),
    getTopicsStats: () => ({} as any),
  } as any;

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

  (window as any).testEventRouter = function () {
    console.log("🧪 Testing EventRouter...");
    const testPayload = { id: "test-node-manual", type: "button" };
    console.log(
      "📤 Publishing control.panel.selection.updated with:",
      testPayload
    );
    (window as any).RenderX.EventRouter.publish(
      "control.panel.selection.updated",
      testPayload
    );
    console.log("✅ Publish complete");
  };

  (window as any).testCanvasSelection = function () {
    console.log("🧪 Testing canvas selection event...");
    const testPayload = { id: "test-node-manual-canvas" };
    console.log(
      "📤 Publishing canvas.component.selection.changed with:",
      testPayload
    );
    (window as any).RenderX.EventRouter.publish(
      "canvas.component.selection.changed",
      testPayload
    );
    console.log("✅ Canvas selection publish complete");
  };

  if (
    !(
      typeof process !== "undefined" &&
      process.env?.RENDERX_DISABLE_STARTUP_VALIDATION === "1"
    )
  ) {
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
