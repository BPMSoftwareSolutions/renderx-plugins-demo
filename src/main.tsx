import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initConductor, registerAllSequences } from "./conductor";

(async () => {
  const conductor = await initConductor();
  await registerAllSequences(conductor);

  const rootEl = document.getElementById("root");
  if (!rootEl) {
    const el = document.createElement("div");
    el.id = "root";
    document.body.appendChild(el);
  }
  const root = createRoot(document.getElementById("root")!);
  root.render(<App />);
})();

