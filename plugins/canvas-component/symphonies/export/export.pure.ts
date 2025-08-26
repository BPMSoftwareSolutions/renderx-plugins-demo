export const buildUiFileContent = (data: any, ctx: any) => {
  try {
    const components = ctx.payload.components || [];
    const layoutData = ctx.payload.layoutData || [];
    const canvasMetadata = ctx.payload.canvasMetadata || {
      width: 0,
      height: 0,
    };
    const cssClasses = ctx.payload.cssClasses || {};

    // Create a map for quick layout lookup
    const layoutMap = new Map();
    for (const layout of layoutData) {
      layoutMap.set(layout.id, layout);
    }

    // Map component type to HTML tag
    const getTemplateTag = (type: string): string => {
      switch (type) {
        case "button":
          return "button";
        case "input":
          return "input";
        case "container":
          return "div";
        default:
          return type;
      }
    };

    // Build UI file components with classRefs instead of classes
    const uiComponents = components.map((component: any) => {
      const layout = layoutMap.get(component.id) || {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        parentId: null,
        siblingIndex: 0,
      };

      return {
        id: component.id,
        type: component.type,
        template: {
          tag: getTemplateTag(component.type),
          classRefs: component.classes || [], // Changed from 'classes' to 'classRefs'
          style: component.style || {},
        },
        layout: {
          x: layout.x,
          y: layout.y,
          width: layout.width,
          height: layout.height,
        },
        parentId: layout.parentId ?? null,
        siblingIndex: layout.siblingIndex ?? 0,
        createdAt: component.createdAt,
      };
    });

    // Build complete UI file content with CSS classes section
    const uiFileContent = {
      version: "1.0.0",
      metadata: {
        createdAt: new Date().toISOString(),
        canvasSize: {
          width: canvasMetadata.width,
          height: canvasMetadata.height,
        },
        componentCount: components.length,
      },
      cssClasses: cssClasses, // Add CSS classes section
      components: uiComponents,
    };

    ctx.payload.uiFileContent = uiFileContent;
    ctx.logger?.info?.(
      `Built UI file content with ${uiComponents.length} components and ${
        Object.keys(cssClasses).length
      } CSS classes`
    );
  } catch (error) {
    ctx.logger?.error?.("Failed to build UI file content:", error);
    ctx.payload.error = String(error);
    ctx.payload.uiFileContent = {
      version: "1.0.0",
      metadata: {
        createdAt: new Date().toISOString(),
        canvasSize: { width: 0, height: 0 },
        componentCount: 0,
      },
      cssClasses: {},
      components: [],
    };
  }
};
