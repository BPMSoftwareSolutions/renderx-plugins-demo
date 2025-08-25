import React from 'react';

interface ClassManagerProps {
  classes: string[];
  onAdd: (className: string) => void;
  onRemove: (className: string) => void;
}

export const ClassManager: React.FC<ClassManagerProps> = ({ classes, onAdd, onRemove }) => {
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
                <button 
                  className="class-remove-btn" 
                  onClick={() => onRemove(className)} 
                  title="Remove class"
                >
                  ×
                </button>
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
