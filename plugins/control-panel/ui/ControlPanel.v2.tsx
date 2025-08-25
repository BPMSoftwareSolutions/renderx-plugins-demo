import React from "react";
import { useConductor } from "../../../src/conductor";
import { resolveInteraction } from "../../../src/interactionManifest";
import { setSelectionObserver, setClassesObserver } from "../state/observer.store";
import { SchemaResolverService } from "../services/schema-resolver.service";
import { getFieldRenderer } from "../components/field-renderers";
import type { 
  ControlPanelConfig, 
  SelectedElement, 
  PropertyField, 
  SectionConfig,
  ControlPanelState,
  ControlPanelAction
} from "../types/control-panel.types";
import "./ControlPanel.css";

// Load configuration
const configPromise = fetch('/plugins/control-panel/config/control-panel.schema.json')
  .then(r => r.json()) as Promise<ControlPanelConfig>;

// State reducer
function controlPanelReducer(state: ControlPanelState, action: ControlPanelAction): ControlPanelState {
  switch (action.type) {
    case 'SET_SELECTED_ELEMENT':
      return {
        ...state,
        selectedElement: action.payload,
        validationErrors: {},
        isDirty: false
      };
    case 'SET_CLASSES':
      return { ...state, currentClasses: action.payload };
    case 'TOGGLE_SECTION':
      const newExpanded = new Set(state.expandedSections);
      if (newExpanded.has(action.payload)) {
        newExpanded.delete(action.payload);
      } else {
        newExpanded.add(action.payload);
      }
      return { ...state, expandedSections: newExpanded };
    case 'SET_VALIDATION_ERRORS':
      return { ...state, validationErrors: action.payload };
    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload };
    case 'RESET_STATE':
      return {
        selectedElement: null,
        currentClasses: [],
        expandedSections: new Set(['content']),
        validationErrors: {},
        isDirty: false
      };
    default:
      return state;
  }
}

// Custom hooks
function useControlPanelState() {
  const [state, dispatch] = React.useReducer(controlPanelReducer, {
    selectedElement: null,
    currentClasses: [],
    expandedSections: new Set(['content']),
    validationErrors: {},
    isDirty: false
  });

  React.useEffect(() => {
    setSelectionObserver((selectionModel) => {
      dispatch({ type: 'SET_SELECTED_ELEMENT', payload: selectionModel });
      dispatch({ type: 'SET_CLASSES', payload: selectionModel?.classes || [] });
    });
    setClassesObserver((classData) => {
      if (classData?.classes) {
        dispatch({ type: 'SET_CLASSES', payload: classData.classes });
      }
    });
    return () => {
      setSelectionObserver(null);
      setClassesObserver(null);
    };
  }, []);

  return { state, dispatch };
}

function useSchemaResolver() {
  const [resolver, setResolver] = React.useState<SchemaResolverService | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    
    const initResolver = async () => {
      try {
        const config = await configPromise;
        const schemaResolver = new SchemaResolverService(config);
        
        // Load common component schemas
        await schemaResolver.loadComponentSchemas(['button', 'input', 'container', 'line']);
        
        if (mounted) {
          setResolver(schemaResolver);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to initialize schema resolver:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initResolver();
    return () => { mounted = false; };
  }, []);

  return { resolver, isLoading };
}

function useControlPanelActions(selectedElement: SelectedElement | null, dispatch: React.Dispatch<ControlPanelAction>) {
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

// Components
const PanelHeader = ({ selectedElement }: { selectedElement: SelectedElement | null }) => (
  <div className="control-panel-header">
    <h3>⚙️ Properties Panel</h3>
    {selectedElement && (
      <div className="element-info">
        <span className="element-type">{selectedElement.header.type}</span>
        <span className="element-id">#{selectedElement.header.id}</span>
      </div>
    )}
  </div>
);

const EmptyState = () => (
  <div className="no-selection">
    <div className="no-selection-icon">🎯</div>
    <h4>No Element Selected</h4>
    <p>Click on a component in the canvas to edit its properties and styling options.</p>
  </div>
);

const LoadingState = () => (
  <div className="loading-state">
    <div className="loading-spinner">⏳</div>
    <p>Loading control panel...</p>
  </div>
);

interface PropertyFieldProps {
  field: PropertyField;
  selectedElement: SelectedElement;
  onChange: (key: string, value: any) => void;
  onValidate: (fieldKey: string, isValid: boolean, errors: string[]) => void;
}

const PropertyFieldRenderer: React.FC<PropertyFieldProps> = ({ field, selectedElement, onChange, onValidate }) => {
  const FieldComponent = getFieldRenderer(field.type);
  const value = getNestedValue(selectedElement, field.path) || field.defaultValue;

  const handleValidate = (isValid: boolean, errors: string[]) => {
    onValidate(field.key, isValid, errors);
  };

  return (
    <div className="property-item">
      {field.type !== "checkbox" && (
        <label className="property-label">
          {field.label}
          {field.required && <span className="required-indicator">*</span>}
        </label>
      )}
      <FieldComponent
        field={field}
        value={value}
        onChange={(newValue) => onChange(field.key, newValue)}
        onValidate={handleValidate}
      />
      {field.description && field.type !== "checkbox" && (
        <div className="field-description">{field.description}</div>
      )}
    </div>
  );
};

interface PropertySectionProps {
  section: SectionConfig;
  fields: PropertyField[];
  selectedElement: SelectedElement;
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (key: string, value: any) => void;
  onValidate: (fieldKey: string, isValid: boolean, errors: string[]) => void;
}

const PropertySection: React.FC<PropertySectionProps> = ({
  section,
  fields,
  selectedElement,
  isExpanded,
  onToggle,
  onChange,
  onValidate
}) => {
  const sectionFields = fields.filter(field => field.section === section.id);
  
  if (sectionFields.length === 0) return null;

  return (
    <div className="property-section">
      <div 
        className={`property-section-title ${section.collapsible ? 'collapsible' : ''}`}
        onClick={section.collapsible ? onToggle : undefined}
      >
        <span>{section.title}</span>
        {section.collapsible && (
          <span className={`collapse-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
        )}
      </div>
      {isExpanded && (
        <div className="property-grid">
          {sectionFields.map(field => (
            <PropertyFieldRenderer
              key={field.key}
              field={field}
              selectedElement={selectedElement}
              onChange={onChange}
              onValidate={onValidate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ClassManager = ({ classes, onAdd, onRemove }: { 
  classes: string[]; 
  onAdd: (className: string) => void; 
  onRemove: (className: string) => void; 
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  const handleSubmit = () => {
    if (inputRef.current?.value) {
      onAdd(inputRef.current.value);
      inputRef.current.value = '';
    }
  };

  return (
    <div className="property-section">
      <div className="property-section-title">🏷️ CSS Classes</div>
      <div className="property-grid">
        <div className="property-item">
          <label className="property-label">Current Classes</label>
          <div className="class-list">
            {classes.map((className, index) => (
              <span key={index} className="class-pill">
                {className}
                <button className="class-remove-btn" onClick={() => onRemove(className)} title="Remove class">×</button>
              </span>
            ))}
          </div>
        </div>
        <div className="property-item">
          <label className="property-label">Add Class</label>
          <div className="add-class-controls">
            <input
              ref={inputRef}
              className="property-input"
              type="text"
              placeholder="Enter class name..."
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button className="add-class-btn" onClick={handleSubmit}>Add</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility function
function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

export function ControlPanel() {
  const { state, dispatch } = useControlPanelState();
  const { resolver, isLoading } = useSchemaResolver();
  const { handleAttributeChange, handleAddClass, handleRemoveClass, toggleSection } = 
    useControlPanelActions(state.selectedElement, dispatch);

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
            />
          </div>
        )}
      </div>
    </div>
  );
}
