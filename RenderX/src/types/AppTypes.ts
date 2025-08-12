/**
 * App-level type definitions for RenderX Evolution
 */

import type { LoadedJsonComponent } from "./JsonComponent";

export interface AppState {
  layoutMode: "editor" | "preview" | "fullscreen-preview";
  panels: {
    showElementLibrary: boolean;
    showControlPanel: boolean;
  };
  hasUnsavedChanges: boolean;
}

export interface ElementLibraryProps {
  // Optional callbacks for legacy UI; plugin UI may ignore these
  onDragStart?: (e: React.DragEvent, component: LoadedJsonComponent) => void;
  onDragEnd?: (e: React.DragEvent, component: LoadedJsonComponent) => void;
}

// Canvas types removed per ADR-0014; canvas UI is provided by plugin via PanelSlot
