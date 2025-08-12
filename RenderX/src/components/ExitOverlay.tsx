import React from "react";

interface ExitOverlayProps {
  variant: "preview" | "fullscreen";
  onExit: () => void;
}

const ExitOverlay: React.FC<ExitOverlayProps> = ({ variant, onExit }) => {
  const title = variant === "preview" ? "Exit Preview (Esc)" : "Exit Fullscreen Preview";
  const label = variant === "preview" ? "✕ Exit Preview" : "✕ Exit Fullscreen";

  return (
    <div className="preview-overlay">
      <button className="preview-exit-button" onClick={onExit} title={title}>
        {label}
      </button>
    </div>
  );
};

export default ExitOverlay;

