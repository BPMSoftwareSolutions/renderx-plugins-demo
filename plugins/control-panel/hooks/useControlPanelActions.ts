import React from 'react';
import { useConductor } from '../../../src/conductor';
import { resolveInteraction } from '../../../src/interactionManifest';
import type { SelectedElement, ControlPanelAction } from '../types/control-panel.types';

export function useControlPanelActions(
  selectedElement: SelectedElement | null, 
  dispatch: React.Dispatch<ControlPanelAction>
) {
  const conductor = useConductor();

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
    handleAttributeChange: (attribute: string, value: any) =>
      handleAction("canvas.component.update", { attribute, value }),
    handleAddClass: (className: string) =>
      className.trim() && handleAction("control.panel.classes.add", { className: className.trim() }),
    handleRemoveClass: (className: string) =>
      handleAction("control.panel.classes.remove", { className }),
    toggleSection: (sectionId: string) =>
      dispatch({ type: 'TOGGLE_SECTION', payload: sectionId })
  };
}
