import React from "react";

interface HeaderPanelTogglesProps {
  showElementLibrary: boolean;
  showControlPanel: boolean;
  onToggleElementLibrary: () => void;
  onToggleControlPanel: () => void;
}

const HeaderPanelToggles: React.FC<HeaderPanelTogglesProps> = ({
  showElementLibrary,
  showControlPanel,
  onToggleElementLibrary,
  onToggleControlPanel,
}) => {
  return (
    <div className="panel-toggles">
      <button
        className={`panel-toggle-button ${showElementLibrary ? "active" : ""}`}
        onClick={onToggleElementLibrary}
        title={`${showElementLibrary ? "Hide" : "Show"} Element Library`}
      >
        📚 Library
      </button>
      <button
        className={`panel-toggle-button ${showControlPanel ? "active" : ""}`}
        onClick={onToggleControlPanel}
        title={`${showControlPanel ? "Hide" : "Show"} Control Panel`}
      >
        🎛️ Properties
      </button>
    </div>
  );
};

export default HeaderPanelToggles;

