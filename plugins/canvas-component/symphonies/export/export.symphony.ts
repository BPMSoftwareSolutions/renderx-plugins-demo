import { queryAllComponents } from "./export.io";
import { collectLayoutData } from "./export.stage-crew";
import { collectCssClasses } from "./export.css.stage-crew";
import { downloadUiFile } from "./export.download.stage-crew";
import { buildUiFileContent } from "./export.pure";

// NOTE: Runtime sequences are mounted from JSON (see json-sequences/*). This file only exports handlers.

export const handlers = {
  queryAllComponents,
  collectCssClasses, // stage-crew
  collectLayoutData,
  buildUiFileContent,
  downloadUiFile, // stage-crew
};
