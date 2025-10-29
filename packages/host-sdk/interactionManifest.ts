// Standalone interaction resolution for @renderx/host-sdk
// Delegates to host's interaction manifest

import "./types.js"; // Load global declarations

export type Route = {
  pluginId: string;
  sequenceId: string;
};

// Default routes for common interactions (fallback when host not available)
const DEFAULT_ROUTES: Record<string, Route> = {
  "app.ui.theme.get": {
    pluginId: "HeaderThemePlugin",
    sequenceId: "header-ui-theme-get-symphony",
  },
  "app.ui.theme.toggle": {
    pluginId: "HeaderThemePlugin",
    sequenceId: "header-ui-theme-toggle-symphony",
  },
  "control.panel.selection.show": {
    pluginId: "ControlPanelPlugin",
    sequenceId: "control-panel-selection-show-symphony",
  },
  "control.panel.update": {
    pluginId: "ControlPanelPlugin",
    sequenceId: "control-panel-update-symphony",
  },
  "control.panel.classes.add": {
    pluginId: "ControlPanelPlugin",
    sequenceId: "control-panel-classes-add-symphony",
  },
  "control.panel.classes.remove": {
    pluginId: "ControlPanelPlugin",
    sequenceId: "control-panel-classes-remove-symphony",
  },
  "control.panel.css.create": {
    pluginId: "ControlPanelPlugin",
    sequenceId: "control-panel-css-create-symphony",
  },
  "control.panel.css.edit": {
    pluginId: "ControlPanelPlugin",
    sequenceId: "control-panel-css-edit-symphony",
  },
  "control.panel.css.delete": {
    pluginId: "ControlPanelPlugin",
    sequenceId: "control-panel-css-delete-symphony",
  },
  "control.panel.ui.init": {
    pluginId: "ControlPanelPlugin",
    sequenceId: "control-panel-ui-init-symphony",
  },
  "control.panel.ui.init.batched": {
    pluginId: "ControlPanelPlugin",
    sequenceId: "control-panel-ui-init-batched-symphony",
  },
  "control.panel.ui.render": {
    pluginId: "ControlPanelPlugin",
    sequenceId: "control-panel-ui-render-symphony",
  },
  "control.panel.ui.field.change": {
    pluginId: "ControlPanelPlugin",
    sequenceId: "control-panel-ui-field-change-symphony",
  },
  "control.panel.ui.field.validate": {
    pluginId: "ControlPanelPlugin",
    sequenceId: "control-panel-ui-field-validate-symphony",
  },
  "control.panel.ui.section.toggle": {
    pluginId: "ControlPanelPlugin",
    sequenceId: "control-panel-ui-section-toggle-symphony",
  },
};



export function resolveInteraction(key: string): Route {
  if (typeof window !== "undefined") {
    const hostResolver = window.RenderX?.resolveInteraction;
    if (hostResolver) {
      try {
        return hostResolver(key);
      } catch {
        // Fall through to defaults
      }
    }
  }

  // Use built-in defaults
  const route = DEFAULT_ROUTES[key];
  if (!route) {
    throw new Error(`Unknown interaction: ${key}`);
  }
  
  return route;
}
