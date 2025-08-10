/**
 * Control Panel Component
 * Properties panel for selected elements
 */

import React from "react";
import PanelSlot from "./PanelSlot";
import LegacyControlPanel from "./LegacyControlPanel";

const ControlPanel: React.FC = () => (
  <PanelSlot slot="right" fallback={<LegacyControlPanel />} />
);

export default ControlPanel;
