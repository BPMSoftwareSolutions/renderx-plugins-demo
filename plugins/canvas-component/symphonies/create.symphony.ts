import { resolveTemplate } from "./create.arrangement";
import { registerInstance } from "./create.io";
import { createNode } from "./create.stage-crew";
import { notifyUi } from "./create.notify";

export const sequence = {
  id: "canvas-component-create-symphony",
  name: "Canvas Component Create",
  movements: [
    {
      id: "create",
      name: "Create",
      beats: [
        { beat: 1, event: "canvas:component:resolve-template", title: "Resolve Template", dynamics: "mf", handler: "resolveTemplate", timing: "immediate", kind: "pure" },
          { beat: 2, event: "canvas:component:register-instance", title: "Register Instance", dynamics: "mf", handler: "registerInstance", timing: "immediate", kind: "io" },
        { beat: 3, event: "canvas:component:create", title: "Create Node", dynamics: "mf", handler: "createNode", timing: "after-beat", kind: "stage-crew" },
        { beat: 4, event: "canvas:component:notify-ui", title: "Notify UI", dynamics: "mf", handler: "notifyUi", timing: "after-beat", kind: "pure" },
      ],
    },
  ],
} as const;

export const handlers = { resolveTemplate, registerInstance, createNode, notifyUi };
