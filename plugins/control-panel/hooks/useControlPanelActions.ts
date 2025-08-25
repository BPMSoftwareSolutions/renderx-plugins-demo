import React from 'react';
import { useConductor } from '../../../src/conductor';
import { resolveInteraction } from '../../../src/interactionManifest';
import { useControlPanelSequences } from './useControlPanelSequences';
import type { SelectedElement, ControlPanelAction } from '../types/control-panel.types';

export function useControlPanelActions(
  selectedElement: SelectedElement | null,
  dispatch: React.Dispatch<ControlPanelAction>
) {
  const conductor = useConductor();
  const sequences = useControlPanelSequences();

  const handleAction = React.useCallback((interaction: string, data: any) => {
    if (!selectedElement?.header?.id) return;
    try {
      const route = resolveInteraction(interaction);
      conductor?.play?.(route.pluginId, route.sequenceId, { id: selectedElement.header.id, ...data });
      dispatch({ type: 'SET_DIRTY', payload: true });
    } catch (error) {
      console.warn('Failed to execute interaction:', interaction, error);
    }
  }, [conductor, selectedElement, dispatch]);

  return {
    // Use sequence-driven field change for attribute updates
    handleAttributeChange: (attribute: string, value: any) => {
      if (sequences.isInitialized) {
        sequences.handleFieldChange(attribute, value, selectedElement);
      } else {
        // Fallback to direct canvas update
        handleAction("canvas.component.update", { attribute, value });
      }
    },
    handleAddClass: (className: string) =>
      className.trim() && handleAction("control.panel.classes.add", { className: className.trim() }),
    handleRemoveClass: (className: string) =>
      handleAction("control.panel.classes.remove", { className }),
    handleCreateCssClass: (className: string, content: string) =>
      handleAction("control.panel.css.create", { className, content }),
    handleEditCssClass: (className: string, content: string) =>
      handleAction("control.panel.css.edit", { className, content }),
    handleDeleteCssClass: (className: string) =>
      handleAction("control.panel.css.delete", { className }),
    // Use sequence-driven section toggle
    toggleSection: (sectionId: string) => {
      if (sequences.isInitialized) {
        sequences.handleSectionToggle(sectionId);
      }
      // Always update local state as well for immediate UI feedback
      dispatch({ type: 'TOGGLE_SECTION', payload: sectionId });
    }
  };
}
