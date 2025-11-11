import React, { useState, useEffect } from 'react';
import TimelineFlowVisualization, { TimelineEvent, TimelineData } from './TimelineFlowVisualization';
import { analyzerToTimelineData, createSampleTimelineData, AnalyzerOutput } from './TimelineDataAdapter';
import { loadAndParseFile } from './LogAnalyzer';
import { OperationFilterPanel, applyEventFilter, OperationFilter } from './OperationFilter';
import './telemetry.css';
interface TelemetryPageProps {
  /**
   * Optional pre-loaded analyzer data
   */
  analyzerData?: AnalyzerOutput;
  /**
   * Optional sample data for demo purposes
   */
  useSampleData?: boolean;
}

/**
 * TelemetryPage - Standalone page for displaying session telemetry visualization
 * Can be used as a diagnostics tab or standalone page
 */
export const TelemetryPage: React.FC<TelemetryPageProps> = ({
  analyzerData,
  useSampleData = false,
}) => {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store intermediate data for inspection
  const [rawLogData, setRawLogData] = useState<AnalyzerOutput | null>(null);
  
  // Filtering state
  const [currentFilter, setCurrentFilter] = useState<OperationFilter>({ strategyId: 'all', query: '' });
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);

  // Initialize with provided data or sample data
  useEffect(() => {
    if (analyzerData) {
      try {
        const converted = analyzerToTimelineData(analyzerData);
        setTimelineData(converted);
        setRawLogData(analyzerData);
        setError(null);
      } catch (err) {
        setError(`Failed to convert analyzer data: ${err}`);
      }
    } else if (useSampleData) {
      setTimelineData(createSampleTimelineData());
      setError(null);
    }
  }, [analyzerData, useSampleData]);

  // Update filtered events when timeline data or filter changes
  useEffect(() => {
    if (timelineData) {
      const filtered = applyEventFilter(timelineData.events, currentFilter);
      setFilteredEvents(filtered);
    }
  }, [timelineData, currentFilter]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Automatically detect and parse raw logs or JSON
      const analyzerOutput = await loadAndParseFile(file);
      const timeline = analyzerToTimelineData(analyzerOutput);
      setTimelineData(timeline);
      setRawLogData(analyzerOutput);
    } catch (err) {
      setError(`Failed to load file: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUseSampleData = () => {
    setTimelineData(createSampleTimelineData());
    setRawLogData(null);
    setError(null);
  };

  const exportDiagnostics = () => {
    if (!timelineData) return;

    const diagnostics = {
      stage1_rawLog: rawLogData || 'sample-data',
      stage2_analyzerJson: rawLogData || { source: 'sample' },
      stage3_timelineData: timelineData,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(diagnostics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telemetry-diagnostics-${Date.now()}.json`;
    a.click();
  };

  if (!timelineData) {
    return (
      <div className="telemetry-container">
        <div className="telemetry-content" style={{ padding: '2rem' }}>
          <div className="max-w-2xl" style={{ margin: '0 auto' }}>
            <div style={{ textAlign: 'center', paddingTop: '3rem', paddingBottom: '3rem' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Telemetry Visualization</h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Upload your console log to automatically analyze and visualize session timeline</p>

            {error && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(244, 67, 54, 0.1)', border: '1px solid rgba(244, 67, 54, 0.3)', borderRadius: '0.5rem', color: '#ef5350' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* File Upload Section */}
              <div style={{ backgroundColor: '#252526', border: '1px solid #333', borderRadius: '0.5rem', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Upload Console Log or JSON</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '8rem', border: '2px dashed #444', borderRadius: '0.5rem', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '1.75rem' }}>
                      <svg style={{ width: '2rem', height: '2rem', color: '#888', marginBottom: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p style={{ fontSize: '0.875rem', color: '#888' }}>
                        Click to upload or drag and drop
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#666' }}>Raw console logs or analyzer JSON files</p>
                    </div>
                    <input
                      type="file"
                      accept=".json,.log,.txt"
                      onChange={handleFileUpload}
                      disabled={loading}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              {/* Sample Data Section */}
              <div style={{ backgroundColor: '#252526', border: '1px solid #333', borderRadius: '0.5rem', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Or Use Sample Data</h2>
                <button
                  onClick={handleUseSampleData}
                  disabled={loading}
                  style={{ width: '100%', padding: '0.75rem 1.5rem', backgroundColor: '#2196f3', color: 'white', borderRadius: '0.375rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
                  onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#1976d2')}
                  onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = '#2196f3')}
                >
                  {loading ? 'Loading...' : 'Load Sample Session'}
                </button>
                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                  Loads 28.35-second demo session with performance gaps
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="telemetry-container">
      <div className="telemetry-content">
        {/* Diagnostics Toolbar */}
        <div style={{ padding: '1rem 2rem', backgroundColor: '#1e1e1e', borderBottom: '1px solid #333', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.875rem', color: '#888' }}>
            {rawLogData && (
              <span>
                📊 Log: {rawLogData.totalLines} lines | {rawLogData.earliest} → {rawLogData.latest}
              </span>
            )}
          </div>
          <button
            onClick={exportDiagnostics}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#333', color: '#888', border: '1px solid #555', borderRadius: '0.375rem', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#444';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#333';
              e.currentTarget.style.color = '#888';
            }}
          >
            📥 Export Diagnostics (JSON)
          </button>
        </div>

        {/* Filtering Panel */}
        <div style={{ padding: '1.5rem 2rem', backgroundColor: '#1a1a1b', borderBottom: '1px solid #333' }}>
          <OperationFilterPanel
            events={timelineData.events}
            onFilterChange={(filter) => setCurrentFilter(filter)}
            onPressetSelect={() => {
              // Preset selected, filter will be applied via onFilterChange
            }}
          />
          <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '1rem' }}>
            Showing {filteredEvents.length} of {timelineData.events.length} events
          </div>
        </div>

        <TimelineFlowVisualization
          data={{
            ...timelineData,
            events: filteredEvents,
          }}
          title="RenderX Session Telemetry"
          subtitle={`${filteredEvents.length} events across ${(timelineData.totalDuration / 1000).toFixed(2)} seconds`}
          onEventClick={(event) => {
            console.log('Clicked event:', event);
          }}
        />
      </div>
    </div>
  );
};

export default TelemetryPage;
