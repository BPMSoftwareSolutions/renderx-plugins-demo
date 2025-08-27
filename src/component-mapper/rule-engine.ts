// Minimal rule engine for Phase 2: update rules and (optionally) content application
// This mirrors the acceptance criteria and current behavior to avoid regressions.

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

function getComponentTypeFromClasses(el: HTMLElement): string {
  const typeClass = Array.from(el.classList).find(
    (c) => c.startsWith("rx-") && c !== "rx-comp"
  );
  return typeClass ? typeClass.replace("rx-", "") : el.tagName.toLowerCase();
}

export class ComponentRuleEngine {
  private updateRules: UpdateRulesConfig;

  constructor(updateRules?: UpdateRulesConfig) {
    this.updateRules = updateRules || DEFAULT_UPDATE_RULES;
  }

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
    return false;
  }
}

