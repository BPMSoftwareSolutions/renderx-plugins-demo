/**
 * Element Library Component
 * Displays available JSON components for drag-and-drop
 */

import React from "react";
import type { ElementLibraryProps } from "../types/AppTypes";
import LegacyElementLibrary from "./LegacyElementLibrary";
import PanelSlot from "./PanelSlot";
import ErrorBoundary from "./ErrorBoundary";
import { Suspense } from "react";

const ElementLibrary: React.FC<ElementLibraryProps> = () => {
  return (
    <ErrorBoundary fallback={<LegacyElementLibrary />}>
      <Suspense
        fallback={
          <div className="panel-slot-loading" data-slot="left">
            <div className="loading-state">
              <h4>Loading left UI...</h4>
            </div>
          </div>
        }
      >
        <PanelSlot slot="left" fallback={<LegacyElementLibrary />} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default ElementLibrary;
