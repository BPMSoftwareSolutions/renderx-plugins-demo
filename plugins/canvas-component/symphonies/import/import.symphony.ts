import { openUiFile } from "./import.file.stage-crew";
import { parseUiFile } from "./import.parse.pure";
import { injectCssClasses } from "./import.css.stage-crew";
import {
  createOrUpdateNodes,
  applyHierarchyAndOrder,
} from "./import.nodes.stage-crew";
import { registerInstances } from "./import.io";

// NOTE: Runtime sequences are mounted from JSON (see json-sequences/*). This file only exports handlers.

export const handlers = {
  openUiFile,
  parseUiFile,
  injectCssClasses,
  createOrUpdateNodes,
  applyHierarchyAndOrder,
  registerInstances,
};
