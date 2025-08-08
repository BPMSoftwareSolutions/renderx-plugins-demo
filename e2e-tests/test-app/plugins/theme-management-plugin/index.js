/**
 * Theme Management Plugin for MusicalConductor
 * 
 * This plugin demonstrates theme switching and management workflows
 * following the React SPA integration patterns from the documentation.
 */

export const sequence = {
  id: "theme-symphony",
  name: "Theme Management Symphony No. 1",
  description: "Orchestrates theme switching with smooth transitions and persistence",
  version: "1.0.0",
  key: "C Major",
  tempo: 120,
  timeSignature: "4/4",
  category: "ui-operations",
  movements: [
    {
      id: "theme-transition",
      name: "Theme Transition Allegro",
      description: "Handle theme switching workflow with validation and application",
      beats: [
        {
          beat: 1,
          event: "theme:validation:start",
          title: "Theme Validation",
          description: "Validate the target theme against available options",
          handler: "validateTheme",
          dynamics: "forte",
          timing: "immediate"
        },
        {
          beat: 2,
          event: "theme:application:start",
          title: "Theme Application",
          description: "Apply the new theme to the application DOM",
          handler: "applyTheme",
          dynamics: "forte",
          timing: "synchronized"
        },
        {
          beat: 3,
          event: "theme:persistence:start",
          title: "Theme Persistence",
          description: "Save theme preference to localStorage",
          handler: "persistTheme",
          dynamics: "mezzo-forte",
          timing: "delayed"
        },
        {
          beat: 4,
          event: "theme:notification:start",
          title: "Theme Notification",
          description: "Notify React components of theme change",
          handler: "notifyThemeChange",
          dynamics: "mezzo-forte",
          timing: "synchronized"
        }
      ]
    }
  ],
  events: {
    triggers: ["theme:change:request"],
    emits: [
      "theme:validation:start",
      "theme:application:start", 
      "theme:persistence:start",
      "theme:notification:start",
      "theme:change:complete"
    ]
  },
  configuration: {
    availableThemes: ["light", "dark", "auto"],
    transitionDuration: 300,
    persistToStorage: true,
    enableSystemTheme: true
  }
};

export const handlers = {
  validateTheme: (data, context) => {
    const { targetTheme } = context;
    const { availableThemes } = context.sequence.configuration;

    console.log(`🎨 Theme Management Plugin: Validating theme: ${targetTheme}`);

    if (!availableThemes.includes(targetTheme)) {
      const error = new Error(
        `Invalid theme: ${targetTheme}. Available: ${availableThemes.join(", ")}`
      );
      console.error("❌ Theme validation failed:", error.message);
      throw error;
    }

    console.log(`✅ Theme validation passed: ${targetTheme}`);
    return { 
      validated: true, 
      theme: targetTheme,
      availableThemes,
      validationTimestamp: new Date().toISOString()
    };
  },

  applyTheme: (data, context) => {
    const { targetTheme } = context;
    const { transitionDuration } = context.sequence.configuration;

    console.log(`🎨 Theme Management Plugin: Applying theme: ${targetTheme}`);

    try {
      // Apply theme to document root with transition
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute("data-theme", targetTheme);
        document.body.className = `theme-${targetTheme}`;
        document.documentElement.style.setProperty(
          "--theme-transition-duration",
          `${transitionDuration}ms`
        );
        
        console.log(`✅ Theme applied to DOM: ${targetTheme}`);
      } else {
        console.log(`ℹ️ DOM not available (likely Node.js environment), theme application simulated`);
      }

      return { 
        applied: true, 
        theme: targetTheme,
        transitionDuration,
        applicationTimestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("❌ Theme application failed:", error.message);
      throw error;
    }
  },

  persistTheme: (data, context) => {
    const { theme } = context.payload; // From previous beat via data baton
    const { persistToStorage } = context.sequence.configuration;

    console.log(`🎨 Theme Management Plugin: Persisting theme: ${theme}`);

    if (!persistToStorage) {
      console.log(`ℹ️ Theme persistence disabled`);
      return { 
        persisted: false, 
        reason: "disabled", 
        theme,
        persistenceTimestamp: new Date().toISOString()
      };
    }

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem("app-theme", theme);
        console.log(`✅ Theme persisted to localStorage: ${theme}`);
        return { 
          persisted: true, 
          theme,
          storage: "localStorage",
          persistenceTimestamp: new Date().toISOString()
        };
      } else {
        console.log(`ℹ️ localStorage not available, persistence simulated`);
        return { 
          persisted: true, 
          theme,
          storage: "simulated",
          persistenceTimestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.warn("⚠️ Failed to persist theme:", error.message);
      return { 
        persisted: false, 
        error: error.message, 
        theme,
        persistenceTimestamp: new Date().toISOString()
      };
    }
  },

  notifyThemeChange: (data, context) => {
    const { theme } = context.payload; // From data baton

    console.log(`🎨 Theme Management Plugin: Notifying theme change: ${theme}`);

    // Update React components through callback mechanism
    if (context.onThemeChange) {
      try {
        context.onThemeChange(theme);
        console.log(`✅ React callback executed for theme: ${theme}`);
      } catch (error) {
        console.warn("⚠️ React callback failed:", error.message);
      }
    }

    // Simulate theme change event emission
    const themeChangeEvent = {
      type: "theme-changed",
      theme,
      timestamp: new Date().toISOString(),
      source: "Theme Management Plugin"
    };

    console.log(`📢 Theme change notification sent:`, themeChangeEvent);

    // In a real implementation, this would emit through the conductor
    // For E2E testing, we log the event that would be emitted
    console.log(`📡 Would emit event: theme-changed with data:`, { theme });

    return { 
      notified: true, 
      theme,
      callbackExecuted: !!context.onThemeChange,
      eventData: themeChangeEvent,
      notificationTimestamp: new Date().toISOString()
    };
  }
};
