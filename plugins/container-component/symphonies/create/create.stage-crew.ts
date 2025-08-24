import { injectRawCss } from "../../../canvas-component/symphonies/create/create.css.stage-crew";
import {
  createElementWithId,
  applyClasses,
  applyInlineStyle,
  appendTo,
} from "../../../canvas-component/symphonies/create/create.dom.stage-crew";
import {
  computeInstanceClass,
  computeCssVarBlock,
  computeInlineStyle,
} from "../../../canvas-component/symphonies/create/create.style.stage-crew";
import {
  attachContainerAwareDrag,
  attachContainerAwareSelection,
} from "../../utils/drag-attachers";

function getContainerOrThrow(id?: string | null): HTMLElement {
  const el =
    typeof document !== "undefined" && id
      ? (document.getElementById(id) as HTMLElement | null)
      : null;
  if (!el)
    throw new Error(`Container element not found for id: ${id || "(none)"}`);
  return el;
}

export const createNodeInContainer = (data: any, ctx: any) => {
  const tpl = ctx.payload.template;
  const id = ctx.payload.nodeId;

  const containerId = data?.containerId || ctx.payload?.containerId;
  const container = getContainerOrThrow(containerId);

  const el = createElementWithId(tpl.tag, id);

  if (tpl.css) {
    injectRawCss(ctx, tpl.css);
    (ctx.payload._cssQueue ||= []).push(tpl.css);
  }

  const instanceClass = computeInstanceClass(tpl.tag, id);

  const cssVars: Record<string, string> = tpl.cssVariables || {};
  const varBlock = computeCssVarBlock(cssVars);
  if (varBlock) {
    injectRawCss(ctx, `.${instanceClass} ${varBlock}`);
  }

  const style = computeInlineStyle(data, tpl);

  const classList = ["rx-comp", ...(tpl.classes || []), instanceClass];
  applyClasses(el, classList);
  applyInlineStyle(el, style);
  if (typeof tpl.text === "string" && tpl.text.length)
    el.textContent = String(tpl.text);

  appendTo(container, el);

  // Attach container-aware interactions
  attachContainerAwareSelection(el, id, ctx.conductor, data?.onSelected);
  attachContainerAwareDrag(
    el,
    container,
    id,
    {
      onDragStart: data?.onDragStart,
      onDragMove: data?.onDragMove,
      onDragEnd: data?.onDragEnd,
    },
    ctx.conductor
  );

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
