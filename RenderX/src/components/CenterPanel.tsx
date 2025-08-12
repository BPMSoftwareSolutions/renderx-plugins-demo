import React, { Suspense } from "react";
import PanelSlot from "./PanelSlot";
import ErrorBoundary from "./ErrorBoundary";

const CenterPanel: React.FC = () => (
  <section className="app-canvas" id="canvas" data-plugin-mounted="true">
    <ErrorBoundary
      fallback={
        <div className="panel-slot-loading" data-slot="center">
          <div className="loading-state">
            <h4>Center UI failed; falling back…</h4>
          </div>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="panel-slot-loading" data-slot="center">
            <div className="loading-state">
              <h4>Loading center UI…</h4>
            </div>
          </div>
        }
      >
        <PanelSlot
          slot="center"
          fallback={
            <div className="panel-slot-empty" data-slot="center">
              <div className="empty-state">
                <h4>Center UI unavailable</h4>
              </div>
            </div>
          }
        />
      </Suspense>
    </ErrorBoundary>
  </section>
);

export default CenterPanel;

