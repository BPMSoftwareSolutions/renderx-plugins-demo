import React from "react";
import { ThemeToggleButton } from "../providers/ThemeProvider";

interface HeaderActionsProps {
  onEnterPreview: () => void;
  onEnterFullscreen: () => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  onEnterPreview,
  onEnterFullscreen,
}) => {
  return (
    <div className="app-header-right">
      <button
        className="preview-button"
        onClick={onEnterPreview}
        title="Enter Preview Mode"
      >
        👁️ Preview
      </button>
      <button
        className="fullscreen-preview-button"
        onClick={onEnterFullscreen}
        title="Enter Fullscreen Preview"
      >
        ⛶ Fullscreen
      </button>
      <ThemeToggleButton />
    </div>
  );
};

export default HeaderActions;

