import { injectRawCss } from "./create.css.stage-crew";
import {
  getCanvasOrThrow,
  createElementWithId,
  applyClasses,
  applyInlineStyle,
  appendTo,
} from "./create.dom.stage-crew";
import {
  computeInstanceClass,
  computeCssVarBlock,
  computeInlineStyle,
} from "./create.style.stage-crew";
import { attachSelection, attachDrag } from "./create.interactions.stage-crew";

export const createNode = (data: any, ctx: any) => {
  const tpl = ctx.payload.template;
  const id = ctx.payload.nodeId;

  // 1) Create node via direct DOM and append to canvas
  const canvas = getCanvasOrThrow();
  const el = createElementWithId(tpl.tag, id);

  // 2) Inject component CSS (if provided by JSON schema)
  if (tpl.css) {
    injectRawCss(ctx, tpl.css);
    // queue for UI-side injection if needed
    (ctx.payload._cssQueue ||= []).push(tpl.css);
  }

  // 3) Build a unique, dedicated instance class for this node
  const instanceClass = computeInstanceClass(tpl.tag, id);

  // 4) Apply variables via CSS custom properties on the instance class
  const cssVars: Record<string, string> = tpl.cssVariables || {};
  const varBlock = computeCssVarBlock(cssVars);
  if (varBlock) {
    injectRawCss(ctx, `.${instanceClass} ${varBlock}`);
  }

  // 5) Build inline style: position + initial size
  const style = computeInlineStyle(data, tpl);

  // 6) Apply classes and inline style (position + size) and text
  const classList = [...(tpl.classes || []), instanceClass];
  applyClasses(el, classList);
  applyInlineStyle(el, style);
  if (typeof tpl.text === "string" && tpl.text.length)
    el.textContent = String(tpl.text);

  // Append to canvas
  appendTo(canvas, el);

  // Interactions: selection + drag via callbacks
  attachSelection(el, id, data?.onSelected);
  attachDrag(el, canvas, id, {
    onDragStart: data?.onDragStart,
    onDragMove: data?.onDragMove,
    onDragEnd: data?.onDragEnd,
  });

  ctx.payload.createdNode = {
    id,
    tag: tpl.tag,
    text: tpl.text,
    classes: [...(tpl.classes || []), instanceClass],
    style,
    position: data.position,
    css: tpl.css,
    cssVariables: cssVars,
    instanceClass,
  };
};
