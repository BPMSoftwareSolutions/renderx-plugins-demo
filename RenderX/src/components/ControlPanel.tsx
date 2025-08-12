/**
 * Control Panel Component
 * Properties panel for selected elements
 */

import React from "react";
import PanelSlot from "./PanelSlot";
import ControlPanelFallback from "./ControlPanelFallback";
import ErrorBoundary from "./ErrorBoundary";
import { Suspense } from "react";

const ControlPanel: React.FC = () => (
  <ErrorBoundary fallback={<ControlPanelFallback />}>
    <Suspense
      fallback={
        <div className="panel-slot-loading" data-slot="right">
          <div className="loading-state">
            <h4>Loading right UI...</h4>
          </div>
        </div>
      }
    >
      <PanelSlot slot="right" fallback={<ControlPanelFallback />} />
    </Suspense>
  </ErrorBoundary>
);

export default ControlPanel;
