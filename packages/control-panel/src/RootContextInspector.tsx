import React, { useState, useEffect } from 'react';
import './RootContextInspector.css';

interface RootContext {
  version: string;
  rootGoal: string;
  principles: string[];
  eightEvolutions: Array<{
    id: number;
    name: string;
    sprint: string;
    goal: string;
  }>;
  contextBoundaries: {
    inScope: string[];
    outOfScope: string[];
  };
  metrics: Record<string, string>;
}

interface ContextEnvelope {
  timestamp: string;
  rootGoal: string;
  currentSprint: string;
  action: string;
  agentId: string;
  principles: string[];
  requiredTelemetryFields: string[];
  boundaries: {
    inScope: string[];
    outOfScope: string[];
  };
  violations: string[];
}

export const RootContextInspector: React.FC = () => {
  const [rootContext, setRootContext] = useState<RootContext | null>(null);
  const [contextEnvelope, setContextEnvelope] = useState<ContextEnvelope | null>(null);
  const [activeTab, setActiveTab] = useState<'root' | 'envelope' | 'boundaries'>('root');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContextData();
  }, []);

  const loadContextData = async () => {
    try {
      // In production, these would be fetched from the server
      // For now, we'll load from the generated files
      const rootResponse = await fetch('/root-context.json');
      const envelopeResponse = await fetch('/.generated/context-remount-envelope.json');
      
      if (rootResponse.ok) {
        setRootContext(await rootResponse.json());
      }
      if (envelopeResponse.ok) {
        setContextEnvelope(await envelopeResponse.json());
      }
    } catch (error) {
      console.warn('Could not load context data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="root-context-inspector loading">Loading context...</div>;
  }

  return (
    <div className="root-context-inspector">
      <div className="inspector-header">
        <h2>🧠 Root Context Inspector</h2>
        <div className="header-actions">
          <button onClick={loadContextData} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'root' ? 'active' : ''}`}
          onClick={() => setActiveTab('root')}
        >
          🎯 Root Goal
        </button>
        <button
          className={`tab ${activeTab === 'envelope' ? 'active' : ''}`}
          onClick={() => setActiveTab('envelope')}
        >
          📍 Context Envelope
        </button>
        <button
          className={`tab ${activeTab === 'boundaries' ? 'active' : ''}`}
          onClick={() => setActiveTab('boundaries')}
        >
          🚧 Boundaries
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'root' && rootContext && (
          <div className="root-goal-panel">
            <div className="goal-statement">
              <h3>🎯 Root Goal</h3>
              <p className="goal-text">{rootContext.rootGoal}</p>
            </div>

            <div className="principles-section">
              <h4>📋 Principles</h4>
              <ul className="principles-list">
                {rootContext.principles.map((principle, idx) => (
                  <li key={idx}>{principle}</li>
                ))}
              </ul>
            </div>

            <div className="evolutions-section">
              <h4>🔄 Eight Evolutionary Capabilities</h4>
              <div className="evolutions-grid">
                {rootContext.eightEvolutions.map((evo) => (
                  <div key={evo.id} className="evolution-card">
                    <div className="evo-number">{evo.id}</div>
                    <div className="evo-name">{evo.name}</div>
                    <div className="evo-sprint">{evo.sprint}</div>
                    <div className="evo-goal">{evo.goal}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="metrics-section">
              <h4>📈 Success Metrics</h4>
              <div className="metrics-list">
                {Object.entries(rootContext.metrics).map(([key, value]) => (
                  <div key={key} className="metric-item">
                    <span className="metric-key">{key}</span>
                    <span className="metric-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'envelope' && contextEnvelope && (
          <div className="envelope-panel">
            <div className="envelope-header">
              <div className="envelope-item">
                <span className="label">Root Goal:</span>
                <span className="value">{contextEnvelope.rootGoal}</span>
              </div>
              <div className="envelope-item">
                <span className="label">Current Sprint:</span>
                <span className="value">{contextEnvelope.currentSprint}</span>
              </div>
              <div className="envelope-item">
                <span className="label">Action:</span>
                <span className="value">{contextEnvelope.action}</span>
              </div>
              <div className="envelope-item">
                <span className="label">Agent:</span>
                <span className="value">{contextEnvelope.agentId}</span>
              </div>
            </div>

            <div className="telemetry-fields">
              <h4>📊 Required Telemetry Fields</h4>
              <div className="fields-grid">
                {contextEnvelope.requiredTelemetryFields.map((field) => (
                  <div key={field} className="field-badge">
                    {field}
                  </div>
                ))}
              </div>
            </div>

            {contextEnvelope.violations.length > 0 && (
              <div className="violations-section">
                <h4>⚠️ Violations</h4>
                <ul className="violations-list">
                  {contextEnvelope.violations.map((violation, idx) => (
                    <li key={idx} className="violation-item">{violation}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="timestamp">
              <small>Last updated: {new Date(contextEnvelope.timestamp).toLocaleString()}</small>
            </div>
          </div>
        )}

        {activeTab === 'boundaries' && rootContext && (
          <div className="boundaries-panel">
            <div className="boundary-section in-scope">
              <h4>✅ In-Scope Paths</h4>
              <ul className="path-list">
                {rootContext.contextBoundaries.inScope.map((path, idx) => (
                  <li key={idx} className="path-item in-scope-item">
                    <span className="path-icon">📁</span>
                    <span className="path-text">{path}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="boundary-section out-of-scope">
              <h4>❌ Out-of-Scope Paths</h4>
              <ul className="path-list">
                {rootContext.contextBoundaries.outOfScope.map((path, idx) => (
                  <li key={idx} className="path-item out-of-scope-item">
                    <span className="path-icon">🚫</span>
                    <span className="path-text">{path}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RootContextInspector;

