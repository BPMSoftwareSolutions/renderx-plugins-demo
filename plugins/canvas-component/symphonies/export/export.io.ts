export const queryAllComponents = async (data: any, ctx: any) => {
  try {
    ctx.logger?.info?.("Querying all components from KV store");

    let components: any[] = [];
    let kvAvailable = false;

    // Try to get components from KV store if available
    if (ctx.io?.kv?.getAll) {
      try {
        components = await ctx.io.kv.getAll();
        kvAvailable = true;
        ctx.logger?.info?.(
          `KV store available, found ${components?.length || 0} components`
        );
      } catch (kvError) {
        ctx.logger?.warn?.("KV store error:", kvError);
        components = [];
      }
    } else {
      ctx.logger?.info?.("KV store not available, will use DOM scanning");
    }

    // If KV store is not available or empty, try DOM scanning in browser environment
    if (
      (!kvAvailable || !components || components.length === 0) &&
      typeof document !== "undefined"
    ) {
      ctx.logger?.info?.("Attempting DOM scanning fallback");
      const domComponents = scanDomForComponents();
      ctx.payload.components = domComponents;
      ctx.payload.componentCount = domComponents.length;
      ctx.payload.source = kvAvailable
        ? "dom-scan-fallback"
        : "dom-scan-primary";
      ctx.logger?.info?.(
        `Retrieved ${ctx.payload.componentCount} components from DOM scanning`
      );
    } else {
      ctx.payload.components = components || [];
      ctx.payload.componentCount = components?.length || 0;
      ctx.payload.source = "kv-store";
      ctx.logger?.info?.(
        `Retrieved ${ctx.payload.componentCount} components from KV store`
      );
    }
  } catch (error) {
    ctx.logger?.error?.("Failed to query components:", error);

    // Even if there's an error, try DOM scanning as last resort
    if (typeof document !== "undefined") {
      ctx.logger?.info?.("Attempting DOM scanning as error recovery");
      try {
        const domComponents = scanDomForComponents();
        ctx.payload.components = domComponents;
        ctx.payload.componentCount = domComponents.length;
        ctx.payload.source = "dom-scan-recovery";
        ctx.logger?.info?.(
          `Recovered ${ctx.payload.componentCount} components from DOM scanning`
        );
      } catch (domError) {
        ctx.logger?.error?.("DOM scanning also failed:", domError);
        ctx.payload.error = `KV store error: ${error}. DOM scan error: ${domError}`;
        ctx.payload.components = [];
        ctx.payload.componentCount = 0;
      }
    } else {
      ctx.payload.error = String(error);
      ctx.payload.components = [];
      ctx.payload.componentCount = 0;
    }
  }
};

function scanDomForComponents(): any[] {
  const canvas = document.getElementById("rx-canvas");
  if (!canvas) {
    return [];
  }

  // Find all elements with rx-comp class (canvas components)
  const componentElements = canvas.querySelectorAll(".rx-comp");
  const components: any[] = [];

  for (const element of componentElements) {
    const htmlElement = element as HTMLElement;

    // Extract component type from classes
    const classes = Array.from(htmlElement.classList);
    const typeClass = classes.find(
      (cls) => cls.startsWith("rx-") && cls !== "rx-comp"
    );
    const type = typeClass
      ? typeClass.replace("rx-", "")
      : htmlElement.tagName.toLowerCase();

    // Extract styles from computed style and inline style
    const computedStyle = window.getComputedStyle(htmlElement);
    const style: Record<string, string> = {};

    // Common style properties to extract
    const styleProps = [
      "padding",
      "margin",
      "border",
      "borderRadius",
      "background",
      "backgroundColor",
      "color",
      "fontSize",
      "fontWeight",
      "textAlign",
      "boxShadow",
      "width",
      "height",
    ];

    for (const prop of styleProps) {
      const value = computedStyle.getPropertyValue(prop);
      if (
        value &&
        value !== "initial" &&
        value !== "normal" &&
        value !== "auto"
      ) {
        style[prop] = value;
      }
    }

    // Also include inline styles
    if (htmlElement.style.cssText) {
      const inlineStyles = htmlElement.style.cssText.split(";");
      for (const styleDecl of inlineStyles) {
        const [prop, value] = styleDecl.split(":").map((s) => s.trim());
        if (prop && value) {
          style[prop] = value;
        }
      }
    }

    components.push({
      id: htmlElement.id,
      type: type,
      classes: classes,
      style: style,
      createdAt: Date.now(), // Fallback timestamp
    });
  }

  return components;
}

export const downloadUiFile = async (data: any, ctx: any) => {
  try {
    if (!ctx.payload.uiFileContent) {
      throw new Error("No UI file content to download");
    }

    // Check if we're in a browser environment
    if (typeof document === "undefined") {
      throw new Error("Browser environment required for file download");
    }

    const uiData = ctx.payload.uiFileContent;
    const jsonString = JSON.stringify(uiData, null, 2);

    // Create blob and download
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `canvas-design-${Date.now()}.ui`;
    a.click();

    // Clean up
    URL.revokeObjectURL(url);

    ctx.payload.downloadTriggered = true;
    ctx.logger?.info?.("UI file download triggered successfully");
  } catch (error) {
    ctx.logger?.error?.("Failed to download UI file:", error);
    ctx.payload.error = String(error);
    ctx.payload.downloadTriggered = false;
  }
};

export const collectCssClasses = async (data: any, ctx: any) => {
  try {
    ctx.logger?.info?.("Collecting CSS class definitions");

    const components = ctx.payload.components || [];
    const uniqueClasses = new Set<string>();

    // Collect all unique class names from components
    for (const component of components) {
      if (component.classes && Array.isArray(component.classes)) {
        component.classes.forEach((className: string) => {
          uniqueClasses.add(className);
        });
      }
    }

    ctx.logger?.info?.(
      `Found ${uniqueClasses.size} unique CSS classes to collect`
    );

    // Check if CSS registry is available
    if (!ctx.io?.cssRegistry?.getClass) {
      ctx.logger?.warn?.(
        "CSS registry not available, skipping CSS class collection"
      );
      ctx.payload.cssClasses = {};
      ctx.payload.error = "CSS registry not available";
      return;
    }

    // Collect CSS class definitions
    const cssClasses: Record<string, any> = {};

    for (const className of uniqueClasses) {
      try {
        const classDefinition = await ctx.io.cssRegistry.getClass(className);
        if (classDefinition) {
          cssClasses[className] = classDefinition;
          ctx.logger?.info?.(`Collected CSS class: ${className}`);
        } else {
          ctx.logger?.warn?.(`CSS class not found in registry: ${className}`);
        }
      } catch (error) {
        ctx.logger?.warn?.(`Failed to get CSS class ${className}:`, error);
      }
    }

    ctx.payload.cssClasses = cssClasses;
    ctx.payload.cssClassCount = Object.keys(cssClasses).length;
    ctx.logger?.info?.(
      `Collected ${ctx.payload.cssClassCount} CSS class definitions`
    );
  } catch (error) {
    ctx.logger?.error?.("Failed to collect CSS classes:", error);
    ctx.payload.error = String(error);
    ctx.payload.cssClasses = {};
    ctx.payload.cssClassCount = 0;
  }
};
