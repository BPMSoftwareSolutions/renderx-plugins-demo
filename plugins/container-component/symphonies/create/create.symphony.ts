import { resolveTemplate } from "./create.arrangement";
import { createNodeInContainer } from "./create.stage-crew";
import { notifyUi } from "./create.notify";

// NOTE: Runtime sequences are mounted from JSON (see json-sequences/*). This file only exports handlers.

export const handlers = {
  resolveTemplate,
  createNodeInContainer,
  notifyUi,
};

