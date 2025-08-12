import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import "./index.css";
import App from "./App.tsx";
import { ConductorService } from "./services/ConductorService";

// Make React available globally for plugins
(window as any).React = React;

// Set Musical Conductor environment for client app (RenderX)
try {
  const dev =
    (typeof import.meta !== "undefined" &&
      (import.meta as any).env &&
      (import.meta as any).env.DEV) === true;
  (window as any).__CONDUCTOR_ENV__ = {
    ...(window as any).__CONDUCTOR_ENV__,
    dev,
    mode: dev ? "development" : "production",
  };
  // Legacy toggle also supported by conductor
  (window as any).MC_DEV = dev;
  if (dev) console.log("🎼 RenderX: Conductor env set to development");
} catch (e) {
  console.warn(
    "⚠️ RenderX: Failed to set Conductor env:",
    (e as any)?.message || e
  );
}

// Initialize Musical Conductor once for the thin shell; plugins do the real work
try {
  ConductorService.getInstance().initialize();
} catch (e) {
  console.warn("⚠️ RenderX: Conductor initialization skipped", e);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
