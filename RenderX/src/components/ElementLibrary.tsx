/**
 * Element Library Component
 * Displays available JSON components for drag-and-drop
 */

import React from "react";
import type { ElementLibraryProps } from "../types/AppTypes";
import LegacyElementLibrary from "./LegacyElementLibrary";
import PanelSlot from "./PanelSlot";

const ElementLibrary: React.FC<ElementLibraryProps> = () => {
  return <PanelSlot slot="left" fallback={<LegacyElementLibrary />} />;
};

export default ElementLibrary;
