/**
 * Element Library Component
 * Displays available JSON components for drag-and-drop
 */

import React from "react";
import type { ElementLibraryProps } from "../types/AppTypes";
import LegacyElementLibrary from "./LegacyElementLibrary";
import PanelSlot from "./PanelSlot";
import ErrorBoundary from "./ErrorBoundary";

const ElementLibrary: React.FC<ElementLibraryProps> = () => {
  return (
    <ErrorBoundary fallback={<LegacyElementLibrary />}>
      <PanelSlot slot="left" fallback={<LegacyElementLibrary />} />
    </ErrorBoundary>
  );
};

export default ElementLibrary;
