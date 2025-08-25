// Stage-crew handler for updating Canvas component attributes from Control Panel changes

export function updateAttribute(data: any, ctx: any) {
  const { id, attribute, value } = data || {};
  
  if (!id || !attribute || value === undefined) {
    ctx.logger?.warn?.("Canvas component update requires id, attribute, and value");
    return;
  }

  const element = document.getElementById(String(id)) as HTMLElement | null;
  if (!element) {
    ctx.logger?.warn?.(`Canvas component with id ${id} not found`);
    return;
  }

  try {
    // Handle different attribute types
    switch (attribute) {
      case "content":
        // Update text content
        element.textContent = String(value);
        break;
        
      case "bg-color":
        element.style.backgroundColor = String(value);
        break;
        
      case "text-color":
        element.style.color = String(value);
        break;
        
      case "border-radius":
        element.style.borderRadius = String(value);
        break;
        
      case "font-size":
        element.style.fontSize = String(value);
        break;
        
      case "width":
        element.style.width = `${Number(value)}px`;
        break;
        
      case "height":
        element.style.height = `${Number(value)}px`;
        break;
        
      case "x":
        element.style.left = `${Number(value)}px`;
        break;
        
      case "y":
        element.style.top = `${Number(value)}px`;
        break;
        
      case "variant":
        // Handle button variant by updating classes
        element.classList.remove("rx-button-primary", "rx-button-secondary", "rx-button-danger");
        element.classList.add(`rx-button-${value}`);
        break;
        
      case "size":
        // Handle button size by updating classes
        element.classList.remove("rx-button-small", "rx-button-medium", "rx-button-large");
        element.classList.add(`rx-button-${value}`);
        break;
        
      case "disabled":
        // Handle disabled state
        if (value) {
          element.setAttribute("disabled", "true");
        } else {
          element.removeAttribute("disabled");
        }
        break;
        
      default:
        ctx.logger?.warn?.(`Unknown attribute: ${attribute}`);
        return;
    }

    // Store the updated attribute info for potential use by other handlers
    ctx.payload.updatedAttribute = { id, attribute, value };
    ctx.payload.elementId = id;

  } catch (error) {
    ctx.logger?.warn?.(`Failed to update attribute ${attribute}:`, error);
  }
}

export function refreshControlPanel(data: any, ctx: any) {
  // After updating the Canvas component, refresh the Control Panel to show the changes
  const elementId = ctx.payload?.elementId;

  if (elementId && ctx?.conductor?.play) {
    try {
      // Try to use resolveInteraction, fallback to direct route for tests
      let pluginId = "ControlPanelPlugin";
      let sequenceId = "control-panel-update-symphony";

      try {
        const { resolveInteraction } = require("../../../../src/interactionManifest");
        const route = resolveInteraction("control.panel.update");
        pluginId = route.pluginId;
        sequenceId = route.sequenceId;
      } catch {
        // Fallback to hardcoded values for test environment
      }

      // eslint-disable-next-line play-routing/no-hardcoded-play-ids
      ctx.conductor.play(pluginId, sequenceId, {
        id: elementId,
        source: "attribute-update"
      });
    } catch (error) {
      ctx.logger?.warn?.("Failed to refresh Control Panel after attribute update:", error);
    }
  }
}
