/**
 * Component Library Plugin for MusicalConductor (RenderX)
 */

export const sequence = {
  id: "load-components-symphony",
  name: "Component Library Loading Symphony No. 2",
  description:
    "Orchestrates loading and validation of component definitions from JSON sources",
  version: "1.0.0",
  key: "D Major",
  tempo: 140,
  timeSignature: "4/4",
  category: "data-operations",
  movements: [
    {
      id: "component-loading",
      name: "Component Loading Moderato",
      description: "Load, validate, and prepare component definitions",
      beats: [
        {
          beat: 1,
          event: "components:fetch:start",
          title: "Component Fetch",
          handler: "fetchComponentDefinitions",
          dynamics: "forte",
          timing: "immediate",
        },
        {
          beat: 2,
          event: "components:validation:start",
          title: "Component Validation",
          handler: "validateComponents",
          dynamics: "mezzo-forte",
          timing: "synchronized",
        },
        {
          beat: 3,
          event: "components:preparation:start",
          title: "Component Preparation",
          handler: "prepareComponents",
          dynamics: "mezzo-forte",
          timing: "synchronized",
        },
        {
          beat: 4,
          event: "components:notification:start",
          title: "Component Notification",
          handler: "notifyComponentsLoaded",
          dynamics: "forte",
          timing: "delayed",
        },
      ],
    },
  ],
  events: {
    triggers: ["components:load:request"],
    emits: [
      "components:fetch:start",
      "components:validation:start",
      "components:preparation:start",
      "components:notification:start",
      "components:load:complete",
    ],
  },
  configuration: {
    // Relax required fields to align with RenderX JSON structure
    // RenderX json-components have metadata.{name,type,icon?} and no top-level id
    requiredFields: ["metadata.name", "metadata.type"],
    maxComponents: 100,
    enableValidation: true,
    sortBy: "name",
    filterCategories: ["basic", "ui-components", "layout", "forms"],
  },
};

export const handlers = {
  fetchComponentDefinitions: async (data, context) => {
    // Load from RenderX public JSON components
    try {
      const response = await fetch("/json-components/index.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const index = await response.json();
      const components = [];
      for (const filename of index.components || []) {
        const res = await fetch(`/json-components/${filename}`);
        if (res.ok) components.push(await res.json());
      }
      context.logger.info(
        `📥 Component Library Plugin: fetched ${components.length} components from index.json`
      );
      return { components, loaded: true };
    } catch (e) {
      context.logger.warn(
        "⚠️ Falling back to empty component set:",
        e?.message
      );
      return { components: [], loaded: true };
    }
  },

  validateComponents: (data, context) => {
    const { components } = context.payload;
    // Support both direct access and context-provided configuration
    const cfg =
      (context && context.sequence && context.sequence.configuration) ||
      (data && data.sequence && data.sequence.configuration) ||
      {};
    const {
      requiredFields = ["metadata.name", "metadata.type"],
      maxComponents = 100,
      enableValidation = true,
    } = cfg;

    if (!enableValidation) {
      return {
        validComponents: components,
        validationPassed: true,
        skipped: true,
      };
    }
    const hasField = (obj, path) => {
      try {
        return (
          path
            .split(".")
            .reduce((o, k) => (o && o[k] != null ? o[k] : undefined), obj) !=
          null
        );
      } catch {
        return false;
      }
    };

    const validComponents = (components || [])
      .filter((c) => requiredFields.every((f) => hasField(c, f)))
      .slice(0, maxComponents);
    context.logger.info(
      `🧪 Component Library Plugin: validation passed for ${
        validComponents.length
      }/${(components || []).length}`
    );
    return {
      validComponents,
      validationPassed: true,
      filtered: (components || []).length - validComponents.length,
    };
  },

  prepareComponents: (data, context) => {
    const { validComponents } = context.payload;
    const { sortBy } = context.sequence.configuration;
    const pickName = (c) => c?.metadata?.name || c?.name || "";
    const pickType = (c) => c?.metadata?.type || c?.type || "";
    const preparedComponents = [...(validComponents || [])].sort((a, b) => {
      if (sortBy === "name") return pickName(a).localeCompare(pickName(b));
      if (sortBy === "type") return pickType(a).localeCompare(pickType(b));
      return 0;
    });
    context.logger.info(
      `📦 Component Library Plugin: prepared ${preparedComponents.length} components`
    );
    return { preparedComponents, prepared: true };
  },

  notifyComponentsLoaded: (data, context) => {
    const { preparedComponents } = context.payload;
    if (context.onComponentsLoaded) {
      try {
        context.onComponentsLoaded(preparedComponents);
      } catch {}
    }
    return { notified: true, count: (preparedComponents || []).length };
  },
};
