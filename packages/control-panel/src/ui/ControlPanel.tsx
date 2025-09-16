import React from "react";
import { useControlPanelState } from "../hooks/useControlPanelState";
import { useSchemaResolver } from "../hooks/useSchemaResolver";
import { useControlPanelActions } from "../hooks/useControlPanelActions";
import { useControlPanelSequences } from "../hooks/useControlPanelSequences";
import { PanelHeader } from "../components/layout/PanelHeader";
import { EmptyState } from "../components/layout/EmptyState";
import { LoadingState } from "../components/layout/LoadingState";
import { PropertySection } from "../components/sections/PropertySection";
import { ClassManager } from "../components/sections/ClassManager";
import { EventRouter as SDKEventRouter } from "@renderx-plugins/host-sdk";
import { consumePendingSelection } from "../state/observer.store";
import "./ControlPanel.css";

export function ControlPanel() {
  const { state, dispatch } = useControlPanelState();
  const { resolver, isLoading } = useSchemaResolver();
  const sequences = useControlPanelSequences();
  const {
    handleAttributeChange,
    handleAddClass,
    handleRemoveClass,
    handleCreateCssClass,
    handleEditCssClass,
    handleDeleteCssClass,
    toggleSection
  } = useControlPanelActions(state.selectedElement, dispatch);

  // Mark UI mounted and consume any pending selection buffered before observer registered
  React.useEffect(() => {
    try {
      (globalThis as any).__RENDERX_CP_UI_MOUNTED__ = true;
      (globalThis as any).__RENDERX_CP_UI_SOURCE__ = 'packages';
      const pending = consumePendingSelection();
      if (pending) {
        dispatch({ type: "SET_SELECTED_ELEMENT", payload: pending });
      }
    } catch {}
  }, []);

  // Trigger render sequence when selected element changes
  React.useEffect(() => {
    if (sequences.isInitialized) {
      sequences.triggerRender(state.selectedElement);
    }
  }, [sequences, state.selectedElement]);


  // Fallback: subscribe to render-request topic to hydrate selectedElement if observer missed
  React.useEffect(() => {
    try {
      const router = (globalThis as any)?.RenderX?.EventRouter || SDKEventRouter;
      const unsub = router.subscribe(
        "control.panel.ui.render.requested",
        (p: any) => {
          const sel = p?.selectedElement || null;
          // received ui render request; set selected element if present
          if (sel) dispatch({ type: "SET_SELECTED_ELEMENT", payload: sel });
        }
      );
      return () => { try { unsub?.(); } catch {} };
    } catch {}
  }, [dispatch]);


  // Safety net: briefly poll for a pending selection that might arrive between mount and observer registration
  React.useEffect(() => {
    let alive = true;
    let tries = 0;
    const tick = () => {
      if (!alive) return;
      try {
        const g: any = (globalThis as any);
        const pending = g.__RENDERX_CP_STORE__?.pendingSelectionModel;
        if (pending) {
          dispatch({ type: "SET_SELECTED_ELEMENT", payload: pending });
          if (g.__RENDERX_CP_STORE__) g.__RENDERX_CP_STORE__.pendingSelectionModel = null;
          return;
        }
      } catch {}
      if (++tries < 10) setTimeout(tick, 100);
    };
    setTimeout(tick, 100);
    return () => { alive = false; };
  }, [dispatch]);

  // Generate dynamic fields and sections
  const { fields, sections } = React.useMemo(() => {
    if (!resolver || !state.selectedElement) {
      return { fields: [], sections: [] };
    }

    const generatedFields = resolver.generatePropertyFields(state.selectedElement);
    const generatedSections = resolver.generateSections(state.selectedElement.header.type);

    return { fields: generatedFields, sections: generatedSections };
  }, [resolver, state.selectedElement]);

  const handleFieldValidation = (fieldKey: string, isValid: boolean, errors: string[]) => {
    const newErrors = { ...state.validationErrors };
    if (isValid) {
      delete newErrors[fieldKey];
    } else {
      newErrors[fieldKey] = errors;
    }
    dispatch({ type: 'SET_VALIDATION_ERRORS', payload: newErrors });
  };

  if (isLoading) {
    return (
      <div className="control-panel">
        <PanelHeader selectedElement={null} />
        <div className="control-panel-content">
          <LoadingState />
        </div>
      </div>
    );
  }

  return (
    <div className="control-panel">
      <PanelHeader selectedElement={state.selectedElement} />
      <div className="control-panel-content">
        {!state.selectedElement ? (
          <EmptyState />
        ) : (
          <div className="property-sections">
            {sections.map(section => (
              <PropertySection
                key={section.id}
                section={section}
                fields={fields}
                selectedElement={state.selectedElement!}
                isExpanded={state.expandedSections.has(section.id)}
                onToggle={() => toggleSection(section.id)}
                onChange={handleAttributeChange}
                onValidate={handleFieldValidation}
              />
            ))}
            <ClassManager
              classes={state.currentClasses}
              onAdd={handleAddClass}
              onRemove={handleRemoveClass}
              onEdit={handleEditCssClass}
              onCreate={handleCreateCssClass}
              onDeleteClass={handleDeleteCssClass}
            />
          </div>
        )}
      </div>
    </div>
  );
}
