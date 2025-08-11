/**
 * Control Panel Component
 * Properties panel for selected elements
 */

import React from "react";
import PanelSlot from "./PanelSlot";
import LegacyControlPanel from "./LegacyControlPanel";
import ErrorBoundary from "./ErrorBoundary";

const ControlPanel: React.FC = () => (
  <ErrorBoundary fallback={<LegacyControlPanel />}>
    <PanelSlot slot="right" fallback={<LegacyControlPanel />} />
  </ErrorBoundary>
);

export default ControlPanel;
