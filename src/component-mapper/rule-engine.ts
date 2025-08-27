// Minimal rule engine for Phase 2: update/content/extract rules
// Mirrors the acceptance criteria and current behavior to avoid regressions.

export type UpdateRule =
  | { whenAttr: string; action: "textContent"; valueFrom?: "value" }
  | { whenAttr: string; action: "style"; prop: string }
  | { whenAttr: string; action: "stylePx"; prop: string }
  | { whenAttr: string; action: "boolAttr"; attr: string }
  | {
      whenAttr: string;
      action: "toggleClassVariant";
      base: string; // e.g. "rx-button"
      prefix: string; // e.g. "rx-button--" (but keep single-dash to match current tests in update)
      values?: string[]; // explicit values
      valuesFromSchemaEnum?: string; // placeholder for future use
    };

export type UpdateRulesConfig = {
  default: UpdateRule[];
  byType?: Record<string, UpdateRule[]>;
};

// Content application rules
export type ContentRule =
  | { action: "textFrom"; from?: string; fallback?: string }
  | { action: "dupTextToContent" } // helper to set content=el.textContent for button
  | { action: "attr"; attr: string; from: string; boolAttr?: boolean }
  | { action: "prop"; prop: string; from: string }
  | { action: "style"; prop: string; from: string };

export type ContentRulesConfig = {
  default: ContentRule[];
  byType?: Record<string, ContentRule[]>;
};

// Extraction rules
export type ExtractRule =
  | { get: "textContent"; as: string }
  | { get: "attr"; attr: string; as: string }
  | { get: "hasAttr"; attr: string; as: string }
  | { get: "prop"; prop: string; as: string }
  | { get: "style"; prop: string; as: string };

export type ExtractRulesConfig = {
  default: ExtractRule[];
  byType?: Record<string, ExtractRule[]>;
};

// Default rules tuned to existing tests/behavior
const DEFAULT_UPDATE_RULES: UpdateRulesConfig = {
  default: [
    { whenAttr: "content", action: "textContent" },
    { whenAttr: "bg-color", action: "style", prop: "backgroundColor" },
    { whenAttr: "text-color", action: "style", prop: "color" },
    { whenAttr: "border-radius", action: "style", prop: "borderRadius" },
    { whenAttr: "font-size", action: "style", prop: "fontSize" },
    { whenAttr: "width", action: "stylePx", prop: "width" },
    { whenAttr: "height", action: "stylePx", prop: "height" },
    { whenAttr: "x", action: "stylePx", prop: "left" },
    { whenAttr: "y", action: "stylePx", prop: "top" },
    { whenAttr: "disabled", action: "boolAttr", attr: "disabled" },
  ],
  byType: {
    button: [
      // Keep single-dash variant names here to match current tests in attribute-editing.integration
      {
        whenAttr: "variant",
        action: "toggleClassVariant",
        base: "rx-button",
        prefix: "rx-button-",
        values: ["primary", "secondary", "danger"],
      },
      {
        whenAttr: "size",
        action: "toggleClassVariant",
        base: "rx-button",
        prefix: "rx-button-",
        values: ["small", "medium", "large"],
      },
    ],
  },
};

const DEFAULT_CONTENT_RULES: ContentRulesConfig = {
  default: [{ action: "textFrom", from: "text" }],
  byType: {
    button: [
      { action: "textFrom", from: "content" },
      { action: "attr", attr: "disabled", from: "disabled", boolAttr: true },
    ],
    input: [
      { action: "prop", prop: "placeholder", from: "placeholder" },
      { action: "prop", prop: "value", from: "value" },
      { action: "prop", prop: "type", from: "inputType" },
      { action: "prop", prop: "disabled", from: "disabled" },
      { action: "prop", prop: "required", from: "required" },
    ],
    img: [
      { action: "attr", attr: "src", from: "src" },
      { action: "attr", attr: "alt", from: "alt" },
      { action: "attr", attr: "loading", from: "loading" },
      { action: "style", prop: "objectFit", from: "objectFit" },
    ],
    image: [
      { action: "attr", attr: "src", from: "src" },
      { action: "attr", attr: "alt", from: "alt" },
      { action: "attr", attr: "loading", from: "loading" },
      { action: "style", prop: "objectFit", from: "objectFit" },
    ],
    container: [{ action: "textFrom", from: "text" }],
    div: [{ action: "textFrom", from: "text" }],
  },
};

const DEFAULT_EXTRACT_RULES: ExtractRulesConfig = {
  default: [{ get: "textContent", as: "text" }],
  byType: {
    button: [
      { get: "textContent", as: "content" },
      { get: "hasAttr", attr: "disabled", as: "disabled" },
    ],
    input: [
      { get: "prop", prop: "placeholder", as: "placeholder" },
      { get: "prop", prop: "value", as: "value" },
      { get: "prop", prop: "type", as: "inputType" },
      { get: "hasAttr", attr: "disabled", as: "disabled" },
      { get: "hasAttr", attr: "required", as: "required" },
    ],
    img: [
      { get: "attr", attr: "src", as: "src" },
      { get: "attr", attr: "alt", as: "alt" },
      { get: "attr", attr: "loading", as: "loading" },
      { get: "style", prop: "objectFit", as: "objectFit" },
    ],
    image: [
      { get: "attr", attr: "src", as: "src" },
      { get: "attr", attr: "alt", as: "alt" },
      { get: "attr", attr: "loading", as: "loading" },
      { get: "style", prop: "objectFit", as: "objectFit" },
    ],
    container: [{ get: "textContent", as: "text" }],
    div: [{ get: "textContent", as: "text" }],
  },
};

function getComponentTypeFromClasses(el: HTMLElement): string {
  const typeClass = Array.from(el.classList).find(
    (c) => c.startsWith("rx-") && c !== "rx-comp"
  );
  return typeClass ? typeClass.replace("rx-", "") : el.tagName.toLowerCase();
}

export class ComponentRuleEngine {
  private updateRules: UpdateRulesConfig;
  private contentRules: ContentRulesConfig;
  private extractRules: ExtractRulesConfig;

  constructor(
    updateRules?: UpdateRulesConfig,
    contentRules?: ContentRulesConfig,
    extractRules?: ExtractRulesConfig
  ) {
    this.updateRules = updateRules || DEFAULT_UPDATE_RULES;
    this.contentRules = contentRules || DEFAULT_CONTENT_RULES;
    this.extractRules = extractRules || DEFAULT_EXTRACT_RULES;
  }

  // -------- Update --------
  getUpdateRulesFor(el: HTMLElement): UpdateRule[] {
    const type = getComponentTypeFromClasses(el);
    const typeRules = this.updateRules.byType?.[type] || [];
    return [...this.updateRules.default, ...typeRules];
  }

  applyUpdate(el: HTMLElement, attribute: string, value: any) {
    const rules = this.getUpdateRulesFor(el);
    const rule = rules.find((r) => r.whenAttr === attribute);
    if (!rule) return false;

    switch (rule.action) {
      case "textContent": {
        el.textContent = String(value);
        return true;
      }
      case "style": {
        (el.style as any)[(rule as any).prop] = String(value);
        return true;
      }
      case "stylePx": {
        (el.style as any)[(rule as any).prop] = `${Number(value)}px`;
        return true;
      }
      case "boolAttr": {
        const attr = (rule as any).attr as string;
        if (value) el.setAttribute(attr, "true");
        else el.removeAttribute(attr);
        return true;
      }
      case "toggleClassVariant": {
        const { base, prefix } = rule as any;
        const current = Array.from(el.classList).filter(
          (c) => c === base || c.startsWith(prefix)
        );
        // Remove existing prefixed variants (preserve base class)
        for (const c of current) {
          if (c.startsWith(prefix)) el.classList.remove(c);
        }
        // Add new variant class
        const val = String(value);
        if (val) el.classList.add(`${prefix}${val}`);
        return true;
      }
    }
  }

  // -------- Content apply --------
  applyContent(
    el: HTMLElement,
    tagOrType: string,
    content: Record<string, any>
  ) {
    if (!content || typeof content !== "object") return;
    const typeKey = String(tagOrType || "").toLowerCase();
    const rules: ContentRule[] = [
      ...(this.contentRules.default || []),
      ...((this.contentRules.byType?.[typeKey] as ContentRule[]) || []),
    ];

    for (const r of rules) {
      switch (r.action) {
        case "textFrom": {
          const v = (content as any)[(r as any).from] ?? (r as any).fallback;
          if (v !== undefined) el.textContent = String(v);
          break;
        }
        case "attr": {
          const v = (content as any)[(r as any).from];
          if ((r as any).boolAttr) {
            if (v) el.setAttribute((r as any).attr, "");
            else el.removeAttribute((r as any).attr);
          } else if (v !== undefined) {
            el.setAttribute((r as any).attr, String(v));
          }
          break;
        }
        case "prop": {
          const v = (content as any)[(r as any).from];
          if (v !== undefined) (el as any)[(r as any).prop] = v;
          break;
        }
        case "style": {
          const v = (content as any)[(r as any).from];
          if (v !== undefined) (el.style as any)[(r as any).prop] = String(v);
          break;
        }
      }
    }
  }

  // -------- Content extract --------
  extractContent(el: HTMLElement, typeHint?: string): Record<string, any> {
    const out: Record<string, any> = {};
    const type = String(
      typeHint || getComponentTypeFromClasses(el) || ""
    ).toLowerCase();
    const rules: ExtractRule[] = [
      ...(this.extractRules.default || []),
      ...((this.extractRules.byType?.[type] as ExtractRule[]) || []),
    ];
    for (const r of rules) {
      switch (r.get) {
        case "textContent": {
          const txt = el.textContent?.trim();
          if (txt) out[(r as any).as] = txt;
          break;
        }
        case "attr": {
          const val = el.getAttribute((r as any).attr);
          if (val != null) out[(r as any).as] = val;
          break;
        }
        case "hasAttr": {
          out[(r as any).as] = el.hasAttribute((r as any).attr) || false;
          break;
        }
        case "prop": {
          const v = (el as any)[(r as any).prop];
          if (v != null && v !== "") out[(r as any).as] = v;
          break;
        }
        case "style": {
          const v = (el.style as any)[(r as any).prop];
          if (v) out[(r as any).as] = v;
          break;
        }
      }
    }
    return out;
  }
}
