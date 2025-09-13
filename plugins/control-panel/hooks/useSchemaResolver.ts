import React from "react";
import { SchemaResolverService } from "../services/schema-resolver.service";
import type { ControlPanelConfig } from "../types/control-panel.types";

// Load configuration (browser first, then raw import fallback for tests)
async function loadConfig(): Promise<ControlPanelConfig> {
  try {
    const isBrowser = typeof globalThis !== 'undefined' && typeof (globalThis as any).fetch === 'function';
    if (isBrowser) {
      const res = await fetch('/plugins/control-panel/config/control-panel.schema.json');
      if (res.ok) return (await res.json()) as ControlPanelConfig;
    }
  } catch {}
  // Final fallback: minimal empty config to keep control panel UI from crashing
  return { components: [] } as any;
}

export function useSchemaResolver() {
  const [resolver, setResolver] = React.useState<SchemaResolverService | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    const initResolver = async () => {
      try {
        const config = await loadConfig();
        const schemaResolver = new SchemaResolverService(config);

        // Load common component schemas (extended with heading/paragraph/image/svg)
        await schemaResolver.loadComponentSchemas([
          "button",
          "input",
          "container",
          "line",
          "heading",
          "paragraph",
          "image",
          "svg",
          "html",
        ]);

        if (mounted) {
          setResolver(schemaResolver);
          setIsLoading(false);
        }
      } catch {
        // Silently handle schema resolver initialization failures
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initResolver();
    return () => {
      mounted = false;
    };
  }, []);

  return { resolver, isLoading };
}
