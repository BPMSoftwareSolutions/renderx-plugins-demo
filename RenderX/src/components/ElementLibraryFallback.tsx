import React from "react";

const ElementLibraryFallback: React.FC = () => {
  return (
    <div className="element-library">
      <div className="element-library-header">
        <h3>
          Element Library
          <span className="component-count" title="Loaded components"></span>
        </h3>
      </div>
      <div className="element-library-content">
        <div className="element-library-loading">
          <div className="loading-state">
            <h4>Loading Components...</h4>
            <p>Waiting for plugin UI…</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElementLibraryFallback;

