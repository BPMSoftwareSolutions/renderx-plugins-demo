import React from 'react';
import { useConductor } from '../../../src/conductor';
import { resolveInteraction } from '../../../src/interactionManifest';
import type { SelectedElement } from '../types/control-panel.types';

/**
 * Hook to orchestrate Control Panel UI via sequences
 * This provides a thin layer over the existing UI logic to make it sequence-driven
 */
export function useControlPanelSequences() {
  const conductor = useConductor();
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initialize UI sequences on mount
  React.useEffect(() => {
    if (!conductor || isInitialized) return;

    const initializeUI = async () => {
      try {
        const route = resolveInteraction("control.panel.ui.init");
        await conductor.play(route.pluginId, route.sequenceId, {
          componentTypes: ['button', 'input', 'container', 'line']
        });
        setIsInitialized(true);
      } catch (error) {
        console.warn('Failed to initialize Control Panel UI sequences:', error);
        // Fall back to non-sequence mode
        setIsInitialized(true);
      }
    };

    initializeUI();
  }, [conductor, isInitialized]);

  // Trigger UI render sequence when selected element changes
  const triggerRender = React.useCallback((selectedElement: SelectedElement | null) => {
    if (!conductor || !isInitialized) return;

    try {
      const route = resolveInteraction("control.panel.ui.render");
      conductor.play(route.pluginId, route.sequenceId, { selectedElement });
    } catch (error) {
      console.warn('Failed to trigger UI render sequence:', error);
    }
  }, [conductor, isInitialized]);

  // Handle field changes via sequence
  const handleFieldChange = React.useCallback((fieldKey: string, value: any, selectedElement: SelectedElement | null) => {
    if (!conductor || !isInitialized || !selectedElement) return;

    try {
      const route = resolveInteraction("control.panel.ui.field.change");
      conductor.play(route.pluginId, route.sequenceId, {
        fieldKey,
        value,
        selectedElement
      });
    } catch (error) {
      console.warn('Failed to handle field change via sequence:', error);
    }
  }, [conductor, isInitialized]);

  // Handle field validation via sequence
  const handleFieldValidation = React.useCallback((field: any, value: any) => {
    if (!conductor || !isInitialized) return;

    try {
      const route = resolveInteraction("control.panel.ui.field.validate");
      conductor.play(route.pluginId, route.sequenceId, { field, value });
    } catch (error) {
      console.warn('Failed to handle field validation via sequence:', error);
    }
  }, [conductor, isInitialized]);

  // Handle section toggle via sequence
  const handleSectionToggle = React.useCallback((sectionId: string) => {
    if (!conductor || !isInitialized) return;

    try {
      const route = resolveInteraction("control.panel.ui.section.toggle");
      conductor.play(route.pluginId, route.sequenceId, { sectionId });
    } catch (error) {
      console.warn('Failed to handle section toggle via sequence:', error);
    }
  }, [conductor, isInitialized]);

  return {
    isInitialized,
    triggerRender,
    handleFieldChange,
    handleFieldValidation,
    handleSectionToggle
  };
}
