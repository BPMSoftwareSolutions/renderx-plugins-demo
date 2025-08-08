/**
 * Component Library Plugin for MusicalConductor
 * 
 * This plugin demonstrates component library loading and management workflows
 * for data operations and UI workflow orchestration.
 */

export const sequence = {
  id: "load-components-symphony",
  name: "Component Library Loading Symphony No. 2",
  description: "Orchestrates loading and validation of component definitions from JSON sources",
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
          description: "Load component definitions from JSON source",
          handler: "fetchComponentDefinitions",
          dynamics: "forte",
          timing: "immediate"
        },
        {
          beat: 2,
          event: "components:validation:start",
          title: "Component Validation",
          description: "Validate component structure and required properties",
          handler: "validateComponents",
          dynamics: "mezzo-forte",
          timing: "synchronized"
        },
        {
          beat: 3,
          event: "components:preparation:start",
          title: "Component Preparation",
          description: "Prepare components for library display",
          handler: "prepareComponents",
          dynamics: "mezzo-forte",
          timing: "synchronized"
        },
        {
          beat: 4,
          event: "components:notification:start",
          title: "Component Notification",
          description: "Notify React components that library is ready",
          handler: "notifyComponentsLoaded",
          dynamics: "forte",
          timing: "delayed"
        }
      ]
    }
  ],
  events: {
    triggers: ["components:load:request"],
    emits: [
      "components:fetch:start",
      "components:validation:start",
      "components:preparation:start",
      "components:notification:start",
      "components:load:complete"
    ]
  },
  configuration: {
    requiredFields: ["id", "name", "type", "icon"],
    maxComponents: 50,
    enableValidation: true,
    sortBy: "name",
    filterCategories: ["ui-components", "layout", "forms"]
  }
};

export const handlers = {
  fetchComponentDefinitions: async (data, context) => {
    const { source } = context;
    
    console.log(`📚 Component Library Plugin: Fetching components from: ${source || 'default source'}`);

    try {
      // For E2E testing, simulate component loading with mock data
      const mockComponents = [
        {
          id: "button-component",
          name: "Button",
          type: "button",
          icon: "🔘",
          category: "ui-components",
          properties: {
            text: "Click me",
            variant: "primary",
            size: "medium"
          }
        },
        {
          id: "text-component", 
          name: "Text",
          type: "text",
          icon: "📝",
          category: "ui-components",
          properties: {
            content: "Sample text",
            fontSize: "16px",
            color: "#333"
          }
        },
        {
          id: "image-component",
          name: "Image",
          type: "image", 
          icon: "🖼️",
          category: "ui-components",
          properties: {
            src: "https://via.placeholder.com/150",
            alt: "Sample image",
            width: "150px",
            height: "150px"
          }
        },
        {
          id: "container-component",
          name: "Container",
          type: "container",
          icon: "📦",
          category: "layout",
          properties: {
            padding: "16px",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px"
          }
        },
        {
          id: "form-input-component",
          name: "Input Field",
          type: "input",
          icon: "📝",
          category: "forms",
          properties: {
            placeholder: "Enter text...",
            type: "text",
            required: false
          }
        }
      ];

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log(`✅ Fetched ${mockComponents.length} component definitions`);
      return { 
        components: mockComponents, 
        loaded: true, 
        source: source || 'mock-data',
        fetchTimestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("❌ Failed to fetch components:", error.message);
      throw error;
    }
  },

  validateComponents: (data, context) => {
    const { components } = context.payload;
    const { requiredFields, maxComponents, enableValidation } = context.sequence.configuration;

    console.log(`📚 Component Library Plugin: Validating ${components?.length || 0} components`);

    if (!enableValidation) {
      console.log(`ℹ️ Component validation disabled`);
      return {
        validComponents: components,
        validationPassed: true,
        skipped: true,
        validationTimestamp: new Date().toISOString()
      };
    }

    const validComponents = components
      .filter((component) => {
        const hasRequiredFields = requiredFields.every((field) => component[field]);
        if (!hasRequiredFields) {
          console.warn(`⚠️ Component missing required fields:`, component.id || 'unknown');
        }
        return hasRequiredFields;
      })
      .slice(0, maxComponents); // Limit to maxComponents

    const filteredCount = components.length - validComponents.length;
    
    console.log(`✅ Validated ${validComponents.length}/${components.length} components`);
    if (filteredCount > 0) {
      console.log(`ℹ️ Filtered out ${filteredCount} components (validation or limit)`);
    }

    return {
      validComponents,
      validationPassed: true,
      filtered: filteredCount,
      totalOriginal: components.length,
      validationTimestamp: new Date().toISOString()
    };
  },

  prepareComponents: (data, context) => {
    const { validComponents } = context.payload;
    const { sortBy, filterCategories } = context.sequence.configuration;

    console.log(`📚 Component Library Plugin: Preparing ${validComponents?.length || 0} components`);

    // Filter by categories if specified
    let preparedComponents = validComponents;
    if (filterCategories.length > 0) {
      preparedComponents = validComponents.filter((component) =>
        filterCategories.includes(component.category)
      );
      console.log(`🔍 Filtered by categories: ${preparedComponents.length} components remain`);
    }

    // Sort components
    preparedComponents.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "type") return a.type.localeCompare(b.type);
      if (sortBy === "category") return a.category.localeCompare(b.category);
      return 0;
    });

    // Add preparation metadata
    preparedComponents = preparedComponents.map(component => ({
      ...component,
      prepared: true,
      preparationTimestamp: new Date().toISOString()
    }));

    console.log(`🎨 Prepared ${preparedComponents.length} components for display (sorted by ${sortBy})`);
    
    return { 
      preparedComponents, 
      prepared: true,
      sortedBy: sortBy,
      categoryFiltered: filterCategories.length > 0,
      preparationTimestamp: new Date().toISOString()
    };
  },

  notifyComponentsLoaded: (data, context) => {
    const { preparedComponents } = context.payload;

    console.log(`📚 Component Library Plugin: Notifying components loaded: ${preparedComponents?.length || 0} components`);

    // Update React components through callback mechanism
    if (context.onComponentsLoaded) {
      try {
        context.onComponentsLoaded(preparedComponents);
        console.log(`✅ React callback executed with ${preparedComponents.length} components`);
      } catch (error) {
        console.warn("⚠️ React callback failed:", error.message);
      }
    }

    // Simulate component load event emission
    const componentLoadEvent = {
      type: "components-loaded",
      components: preparedComponents,
      count: preparedComponents.length,
      timestamp: new Date().toISOString(),
      source: "Component Library Plugin"
    };

    console.log(`📢 Component library loaded and notified:`, {
      count: preparedComponents.length,
      categories: [...new Set(preparedComponents.map(c => c.category))],
      types: [...new Set(preparedComponents.map(c => c.type))]
    });

    // In a real implementation, this would emit through the conductor
    // For E2E testing, we log the event that would be emitted
    console.log(`📡 Would emit event: components-loaded with ${preparedComponents.length} components`);

    return { 
      notified: true, 
      count: preparedComponents.length,
      callbackExecuted: !!context.onComponentsLoaded,
      eventData: componentLoadEvent,
      notificationTimestamp: new Date().toISOString()
    };
  }
};
