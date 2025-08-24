// Centralized mapper from JSON component definition → runtime Template model
// This isolates knowledge of component JSON structure away from symphonies.

export type RuntimeTemplate = {
  tag: string;
  text?: string;
  classes: string[];
  css?: string;
  cssVariables?: Record<string, string | number>;
  cssLibrary?: string;
  cssVariablesLibrary?: Record<string, string | number>;
  attributes?: Record<string, string>;
  dimensions?: { width?: number; height?: number };
  style?: Record<string, string>;
};

export function mapJsonComponentToTemplate(json: any): RuntimeTemplate {
  const type = json?.metadata?.type || json?.metadata?.replaces || "div";
  const name = json?.metadata?.name || type;
  // Base classes are derived once here
  const classes = ["rx-comp", `rx-${type}`];
  const ci = json?.integration?.canvasIntegration || {};

  // Icon data-* attributes (optional)
  const icon = json?.ui?.icon || {};
  const attrs: Record<string, string> = {};
  if (icon?.mode === "emoji" && icon?.value) {
    attrs["data-icon"] = String(icon.value);
    if (icon.position) attrs["data-icon-pos"] = String(icon.position);
  }

  // Overlay kind provided by component integration config (decouples selection overlay logic)
  const overlayKind = json?.integration?.canvasIntegration?.overlayKind;
  if (overlayKind) attrs["data-overlay"] = String(overlayKind);

  // Container role flag enables child appending and relative positioning host
  const isContainer =
    !!json?.integration?.canvasIntegration?.allowChildElements;
  if (isContainer) attrs["data-role"] = "container";

  // Normalize to safe HTML tag for preview/canvas
  const tag =
    type === "input"
      ? "input"
      : type === "line" || type === "container"
      ? "div"
      : type || "div";

  return {
    tag,
    text:
      type === "button"
        ? json?.integration?.properties?.defaultValues?.content || "Click Me"
        : undefined,
    classes,
    css: json?.ui?.styles?.css,
    cssVariables: json?.ui?.styles?.variables || {},
    cssLibrary: json?.ui?.styles?.library?.css,
    cssVariablesLibrary: json?.ui?.styles?.library?.variables || {},
    attributes: attrs,
    dimensions: { width: ci.defaultWidth, height: ci.defaultHeight },
    style: {},
  } as RuntimeTemplate;
}
