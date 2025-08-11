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

export interface CanvasProps {
  mode: "editor" | "preview" | "fullscreen-preview";
  onCanvasElementDragStart?: (element: any, dragData: any) => void;
  onCanvasElementDragEnd?: (e: React.DragEvent, element: any) => void;
}

export interface CanvasElementProps {
  id: string;
  type: string;
  content: string;
  style: React.CSSProperties;
  onDragStart?: (element: any, dragData: any) => void;
}
