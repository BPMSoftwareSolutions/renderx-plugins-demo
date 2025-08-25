import React from "react";
import { useConductor } from "../../../src/conductor";
import { resolveInteraction } from "../../../src/interactionManifest";
import type { SelectedElement } from "../types/control-panel.types";

// Global guards to dedupe init across multiple hook instances/mounts
let cpInitInFlight = false;
let cpInitialized = false;

/**
 * Hook to orchestrate Control Panel UI via sequences
 * This provides a thin layer over the existing UI logic to make it sequence-driven
 */
export function useControlPanelSequences() {
  const conductor = useConductor();
  const [isInitialized, setIsInitialized] = React.useState(false);
  const pendingRender = React.useRef<SelectedElement | null>(null);

  // Initialize UI sequences on mount (global dedupe across instances)
  React.useEffect(() => {
    if (!conductor || isInitialized || cpInitialized || cpInitInFlight) return;

    const initializeUI = async () => {
      cpInitInFlight = true;
      try {
        const perf = (window as any).__cpPerf || {};
        const key = perf.batchedInit
          ? "control.panel.ui.init.batched"
          : "control.panel.ui.init";
        const route = resolveInteraction(key);
        await conductor.play(route.pluginId, route.sequenceId, {
          componentTypes: ["button", "input", "container", "line"],
        });
        cpInitialized = true;
        setIsInitialized(true);
      } catch (error) {
        console.warn("Failed to initialize Control Panel UI sequences:", error);
        cpInitialized = true; // avoid infinite retries
        setIsInitialized(true);
      } finally {
        cpInitInFlight = false;
        // Flush a pending render if one was queued during init
        if (pendingRender.current) {
          try {
            const route = resolveInteraction("control.panel.ui.render");
            conductor.play(route.pluginId, route.sequenceId, {
              selectedElement: pendingRender.current,
            });
          } catch (e) {
            console.warn("Deferred render failed:", e);
          } finally {
            pendingRender.current = null;
          }
        }
      }
    };

    initializeUI();
  }, [conductor, isInitialized]);

  // Trigger UI render sequence when selected element changes
  const triggerRender = React.useCallback(
    (selectedElement: SelectedElement | null) => {
      if (!conductor) return;

      // Skip render while dragging for performance
      if (typeof window !== "undefined" && (window as any).__cpDragInProgress) {
        return;
      }

      // If init hasn't completed yet, queue a single pending render to run post-init
      if (!isInitialized || !cpInitialized || cpInitInFlight) {
        pendingRender.current = selectedElement;
        return;
      }

      try {
        const route = resolveInteraction("control.panel.ui.render");
        conductor.play(route.pluginId, route.sequenceId, { selectedElement });
      } catch (error) {
        console.warn("Failed to trigger UI render sequence:", error);
      }
    },
    [conductor, isInitialized]
  );

  // Expose a globally callable trigger for optional deferred post-drag rendering
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    (window as any).__cpTriggerRender = () => triggerRender(null);
    return () => {
      try {
        if ((window as any).__cpTriggerRender)
          delete (window as any).__cpTriggerRender;
      } catch {}
    };
  }, [triggerRender]);

  // Handle field changes via sequence
  const handleFieldChange = React.useCallback(
    (fieldKey: string, value: any, selectedElement: SelectedElement | null) => {
      if (!conductor || !isInitialized || !selectedElement) return;

      try {
        const route = resolveInteraction("control.panel.ui.field.change");
        conductor.play(route.pluginId, route.sequenceId, {
          fieldKey,
          value,
          selectedElement,
        });
      } catch (error) {
        console.warn("Failed to handle field change via sequence:", error);
      }
    },
    [conductor, isInitialized]
  );

  // Handle field validation via sequence
  const handleFieldValidation = React.useCallback(
    (field: any, value: any) => {
      if (!conductor || !isInitialized) return;

      try {
        const route = resolveInteraction("control.panel.ui.field.validate");
        conductor.play(route.pluginId, route.sequenceId, { field, value });
      } catch (error) {
        console.warn("Failed to handle field validation via sequence:", error);
      }
    },
    [conductor, isInitialized]
  );

  // Handle section toggle via sequence
  const handleSectionToggle = React.useCallback(
    (sectionId: string) => {
      if (!conductor || !isInitialized) return;

      try {
        const route = resolveInteraction("control.panel.ui.section.toggle");
        conductor.play(route.pluginId, route.sequenceId, { sectionId });
      } catch (error) {
        console.warn("Failed to handle section toggle via sequence:", error);
      }
    },
    [conductor, isInitialized]
  );

  return {
    isInitialized,
    triggerRender,
    handleFieldChange,
    handleFieldValidation,
    handleSectionToggle,
  };
}
