import React from "react";

const ControlPanelFallback: React.FC = () => (
  <div className="panel-slot-empty" data-slot="right">
    <div className="empty-state">
      <h4>Right UI unavailable</h4>
      <p>Install a right-panel plugin to enable properties editing.</p>
    </div>
  </div>
);

export default ControlPanelFallback;

