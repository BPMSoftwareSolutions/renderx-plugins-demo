import * as React from "react";
import { createRoot } from "react-dom/client";

function SimpleTestApp() {
  return (
    <div className="plugin-explorer" data-testid="plugin-explorer">
      <div className="panel" style={{ marginBottom: '1rem' }}>
        <div className="panel-header">
          <h3 className="panel-title">Simple Test App</h3>
          <span className="panel-badge" data-testid="plugin-count">0</span>
        </div>
        <div className="panel-content">
          <input
            className="search-box"
            placeholder="Search plugins..."
            type="text"
          />
          <div>Simple test app loaded successfully!</div>
        </div>
      </div>
    </div>
  );
}

// Initialize the app
const container = document.getElementById('test-root');
if (container) {
  const root = createRoot(container);
  root.render(<SimpleTestApp />);
} else {
  console.error('Could not find test-root element');
}
