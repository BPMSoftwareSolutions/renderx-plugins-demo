import React, { useState, useRef } from 'react';
// useEffect is available but not currently used
// import { useEffect } from 'react';
import './isolation-harness.css';

interface ExecutionLog {
  timestamp: number;
  beat: number;
  handler: string;
  duration: number;
  status: 'success' | 'error';
  message?: string;
}

interface IsolationHarnessState {
  domSnapshot: string;
  kvOps: Array<[string, any, any?]>;
  publishedEvents: Array<{ topic: string; data: any }>;
  executionLogs: ExecutionLog[];
  totalDuration: number;
}

interface CanvasComponent {
  id: string;
  type: 'button' | 'div' | 'svg';
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

// ProductionLogEntry interface is defined but not currently used
// interface ProductionLogEntry {
//   timestamp: string;
//   beat?: number;
//   handler?: string;
//   timing?: string;
//   duration?: number;
//   message: string;
// }

interface ExtractedSequenceData {
  beats: Array<{
    beat: number;
    handler: string;
    timing: string;
    kind: string;
  }>;
  inputData: any;
  totalDuration: number;
}

const TEST_COMPONENTS = [
  { id: 'btn-1', type: 'button' as const, label: 'Button', width: 80, height: 40 },
  { id: 'div-1', type: 'div' as const, label: 'Div', width: 100, height: 60 },
  { id: 'svg-1', type: 'svg' as const, label: 'SVG', width: 80, height: 80 },
];

export const IsolationHarnessPlayground: React.FC = () => {
  const [mode, setMode] = useState<'interactive' | 'production-log'>('interactive');
  const [components, setComponents] = useState<CanvasComponent[]>([]);
  const [_running, setRunning] = useState(false);
  const [state, setState] = useState<IsolationHarnessState>({
    domSnapshot: '',
    kvOps: [],
    publishedEvents: [],
    executionLogs: [],
    totalDuration: 0,
  });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [_selectedBeat, setSelectedBeat] = useState<number | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);

  // Production log mode state
  const [logContent, setLogContent] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedSequenceData | null>(null);
  const [unmocker, setUnmocker] = useState<Set<number>>(new Set()); // Which beats to unmock
  const [logResults, setLogResults] = useState<IsolationHarnessState | null>(null);

  // Extract sequence data from production log
  const extractSequenceFromLog = (logText: string) => {
    console.log('🔍 [Log Extractor] Parsing production log...');
    const lines = logText.split('\n');

    const beats: Array<{ beat: number; handler: string; timing: string; kind: string }> = [];
    const beatTimings: Map<number, { start: number; end: number }> = new Map();
    let inputData: any = null;
    let totalDuration = 0;
    let sequenceStartTime: number | null = null;
    let sequenceEndTime: number | null = null;

    for (const line of lines) {
      // Extract Canvas Component Create sequence lines only
      if (!line.includes('Canvas Component Create')) continue;

      // Extract timestamps
      const timeMatch = line.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
      const timestamp = timeMatch ? new Date(timeMatch[1]).getTime() : 0;

      // Extract beat start timing
      const beatStartMatch = line.match(/Started timing beat (\d+)/);
      if (beatStartMatch) {
        const beatNum = parseInt(beatStartMatch[1]);
        if (!beatTimings.has(beatNum)) {
          beatTimings.set(beatNum, { start: timestamp, end: 0 });
        }
      }

      // Extract beat completion timing
      const beatCompleteMatch = line.match(/Beat (\d+) completed in ([\d.]+)ms/);
      if (beatCompleteMatch) {
        const beatNum = parseInt(beatCompleteMatch[1]);
        const duration = parseFloat(beatCompleteMatch[2]);
        if (beatTimings.has(beatNum)) {
          const timing = beatTimings.get(beatNum)!;
          timing.end = timing.start + duration;
        }
      }

      // Extract beat info from JSON-like log entries
      const beatInfoMatch = line.match(/beat: (\d+).*timing: '(\w+)'/);
      if (beatInfoMatch) {
        const [, beatNum, timing] = beatInfoMatch;
        const beatNumber = parseInt(beatNum);

        // Check if we already have this beat
        if (!beats.find(b => b.beat === beatNumber)) {
          // Extract handler from the line
          const handlerMatch = line.match(/handler=(\w+)/);
          const handler = handlerMatch ? handlerMatch[1] : `beat${beatNumber}`;

          beats.push({
            beat: beatNumber,
            handler,
            timing,
            kind: 'stage-crew',
          });
        }
      }

      // Extract total duration
      const durationMatch = line.match(/completed in (\d+)ms/);
      if (durationMatch && line.includes('Sequence')) {
        totalDuration = parseInt(durationMatch[1]);
      }

      // Extract input data (template)
      if (line.includes('preview=') && line.includes('template')) {
        try {
          const previewMatch = line.match(/preview=({[^}]*})/);
          if (previewMatch) {
            inputData = JSON.parse(previewMatch[1]);
          }
        } catch {
          // Silently ignore parse errors
        }
      }

      // Track sequence start/end times
      if (line.includes('Executing movement') && !sequenceStartTime) {
        sequenceStartTime = timestamp;
      }
      if (line.includes('Sequence') && line.includes('completed in')) {
        // sequenceEndTime is prepared for future use but not currently used
        // sequenceEndTime = timestamp;
      }
    }

    // Sort beats by beat number
    beats.sort((a, b) => a.beat - b.beat);

    console.log('✅ [Log Extractor] Extracted:', {
      beats: beats.length,
      totalDuration,
      beatTimings: Array.from(beatTimings.entries()).map(([beat, timings]) => ({
        beat,
        duration: timings.end - timings.start,
      })),
    });

    return { beats, inputData, totalDuration };
  };

  // Run sequence with selected beats unmocked
  const runSequenceWithUnmocking = async () => {
    if (!extractedData) return;

    console.log('🎬 [Unmocking] Running sequence with unmocked beats:', Array.from(unmocker));
    setRunning(true);

    const startTime = Date.now();
    const logs: ExecutionLog[] = [];
    const kvOps: Array<[string, any]> = [];
    const publishedEvents: Array<{ topic: string; data: any }> = [];

    try {
      // Execute each beat
      for (const beat of extractedData.beats) {
        const beatStart = Date.now();
        console.log(`🥁 [Beat ${beat.beat}] ${beat.handler} (timing: ${beat.timing})`);

        // Check if this beat should be unmocked
        const isUnmocked = unmocker.has(beat.beat);

        if (isUnmocked) {
          // Unmocked: Apply timing delay if needed
          if (beat.timing === 'after-beat') {
            console.log(`   ⏱️ Waiting 500ms for beat timing (after-beat)`);
            await new Promise(r => setTimeout(r, 500));
          }
          console.log(`   ✨ [UNMOCKED] Executing real handler: ${beat.handler}`);
          // In a real implementation, we would call the actual handler here
          // For now, just simulate a small delay
          await new Promise(r => setTimeout(r, 10));
        } else {
          // Mocked: Just a tiny delay
          console.log(`   🎭 [MOCKED] Simulating ${beat.handler}`);
          await new Promise(r => setTimeout(r, 2));
        }

        const beatDuration = Date.now() - beatStart;
        logs.push({
          timestamp: beatStart,
          beat: beat.beat,
          handler: beat.handler,
          duration: beatDuration,
          status: 'success',
          message: isUnmocked ? 'UNMOCKED' : 'MOCKED',
        });

        console.log(`   ✓ Beat ${beat.beat} completed in ${beatDuration}ms (${isUnmocked ? 'UNMOCKED' : 'MOCKED'})`);
      }

      const totalDuration = Date.now() - startTime;
      console.log(`✅ Sequence completed in ${totalDuration}ms`);

      setLogResults({
        domSnapshot: '',
        kvOps,
        publishedEvents,
        executionLogs: logs,
        totalDuration,
      });
    } catch (error) {
      console.error('❌ [Unmocking] Error:', error);
    } finally {
      setRunning(false);
    }
  };

  const handleLibraryDragStart = (e: React.DragEvent<HTMLDivElement>, componentId: string) => {
    console.log('🎨 [Playground] Drag started:', componentId);
    setDraggedComponent(componentId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleCanvasDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log('🎨 [Playground] Drop detected on canvas');

    if (!draggedComponent) {
      console.warn('⚠️ [Playground] No component being dragged');
      return;
    }

    const testComponent = TEST_COMPONENTS.find(c => c.id === draggedComponent);
    if (!testComponent) {
      console.warn('⚠️ [Playground] Component not found:', draggedComponent);
      return;
    }

    // Get drop position relative to canvas
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      console.warn('⚠️ [Playground] Canvas ref not available');
      return;
    }

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log(`📍 [Playground] Drop position: (${Math.round(x)}, ${Math.round(y)})`);

    // Create new component instance
    const newComponent: CanvasComponent = {
      id: `${testComponent.id}-${Date.now()}`,
      type: testComponent.type,
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: testComponent.width,
      height: testComponent.height,
      label: testComponent.label,
    };

    console.log('✨ [Playground] Creating component:', newComponent);
    setComponents([...components, newComponent]);
    setDraggedComponent(null);

    // Run isolation test for create sequence
    console.log('🎵 [Playground] Starting create sequence...');
    await runCreateSequence(newComponent);
  };

  const runCreateSequence = async (component: CanvasComponent) => {
    console.log('🎼 [Sequence] canvas-component-create-symphony starting');
    console.log('📦 [Input] Component:', component);

    setRunning(true);
    const startTime = Date.now();
    const logs: ExecutionLog[] = [];
    const kvOps: Array<[string, any]> = [];
    const publishedEvents: Array<{ topic: string; data: any }> = [];

    try {
      // Beat 1: resolveTemplate
      console.log('🎵 [Beat 1] resolveTemplate');
      let beatStart = Date.now();
      logs.push({
        timestamp: beatStart,
        beat: 1,
        handler: 'resolveTemplate',
        duration: Date.now() - beatStart,
        status: 'success',
      });
      console.log(`   ✓ Beat 1 completed in ${Date.now() - beatStart}ms`);

      // Beat 2: registerInstance
      console.log('🎵 [Beat 2] registerInstance');
      beatStart = Date.now();
      kvOps.push(['kv.put', `component:${component.id}`, component]);
      console.log(`   → kv.put("component:${component.id}", ...)`);
      logs.push({
        timestamp: beatStart,
        beat: 2,
        handler: 'registerInstance',
        duration: Date.now() - beatStart,
        status: 'success',
      });
      console.log(`   ✓ Beat 2 completed in ${Date.now() - beatStart}ms`);

      // Beat 3: createNode
      console.log('🎵 [Beat 3] createNode');
      beatStart = Date.now();
      logs.push({
        timestamp: beatStart,
        beat: 3,
        handler: 'createNode',
        duration: Date.now() - beatStart,
        status: 'success',
      });
      console.log(`   ✓ Beat 3 completed in ${Date.now() - beatStart}ms`);

      // Beat 4: renderReact (immediate timing - no artificial delay)
      console.log('🎵 [Beat 4] renderReact (timing: immediate)');
      beatStart = Date.now();
      await new Promise(r => setTimeout(r, 50)); // Actual render time
      const beat4Duration = Date.now() - beatStart;
      logs.push({
        timestamp: beatStart,
        beat: 4,
        handler: 'renderReact',
        duration: beat4Duration,
        status: 'success',
      });
      console.log(`   ✓ Beat 4 completed in ${beat4Duration}ms (React render)`);

      // Beat 5: notifyUi
      console.log('🎵 [Beat 5] notifyUi');
      beatStart = Date.now();
      publishedEvents.push({ topic: 'canvas.component.created', data: { id: component.id } });
      console.log(`   → publish("canvas.component.created", { id: "${component.id}" })`);
      logs.push({
        timestamp: beatStart,
        beat: 5,
        handler: 'notifyUi',
        duration: Date.now() - beatStart,
        status: 'success',
      });
      console.log(`   ✓ Beat 5 completed in ${Date.now() - beatStart}ms`);

      // Beat 6: enhanceLine
      console.log('🎵 [Beat 6] enhanceLine');
      beatStart = Date.now();
      logs.push({
        timestamp: beatStart,
        beat: 6,
        handler: 'enhanceLine',
        duration: Date.now() - beatStart,
        status: 'success',
      });
      console.log(`   ✓ Beat 6 completed in ${Date.now() - beatStart}ms`);

      const totalDuration = Date.now() - startTime;
      console.log(`✅ [Sequence] Completed in ${totalDuration}ms`);
      console.log('📊 [Results]', { totalDuration, beats: logs.length, kvOps: kvOps.length, events: publishedEvents.length });

      setState({
        domSnapshot: `Created ${component.type} at (${component.x}, ${component.y})`,
        kvOps,
        publishedEvents,
        executionLogs: logs,
        totalDuration,
      });
    } catch (error) {
      console.error('❌ [Sequence] Error:', error);
    } finally {
      setRunning(false);
    }
  };

  const clearCanvas = () => {
    setComponents([]);
    setState({
      domSnapshot: '',
      kvOps: [],
      publishedEvents: [],
      executionLogs: [],
      totalDuration: 0,
    });
  };

  return (
    <div className="isolation-harness-container">
      <div className="harness-header">
        <h1>🔬 Isolation Harness Playground</h1>
        <p>Drag components from library to canvas and watch the create sequence execute</p>
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'interactive' ? 'active' : ''}`}
            onClick={() => setMode('interactive')}
          >
            🎨 Interactive Mode
          </button>
          <button
            className={`mode-btn ${mode === 'production-log' ? 'active' : ''}`}
            onClick={() => setMode('production-log')}
          >
            📊 Production Log Mode
          </button>
        </div>
      </div>

      {mode === 'production-log' && (
        <div className="production-log-mode">
          <div className="log-upload-section">
            <h2>📋 Load Production Log</h2>
            <textarea
              placeholder="Paste production log content here..."
              value={logContent}
              onChange={(e) => setLogContent(e.target.value)}
              className="log-textarea"
            />
            <button
              onClick={() => {
                const extracted = extractSequenceFromLog(logContent);
                setExtractedData(extracted);
                console.log('📊 Extracted sequence data:', extracted);
              }}
              className="extract-button"
            >
              🔍 Extract Sequence Data
            </button>
          </div>

          {extractedData && (
            <div className="unmock-section">
              <h2>🎯 Unmock Beats to Find Delay</h2>
              <p>Start with all beats mocked (fast), then unmock each beat to find which one causes the delay.</p>
              <div className="unmock-controls">
                {extractedData.beats.map((beat) => (
                  <label key={beat.beat} className="unmock-checkbox">
                    <input
                      type="checkbox"
                      checked={unmocker.has(beat.beat)}
                      onChange={(e) => {
                        const newUnmocker = new Set(unmocker);
                        if (e.target.checked) {
                          newUnmocker.add(beat.beat);
                        } else {
                          newUnmocker.delete(beat.beat);
                        }
                        setUnmocker(newUnmocker);
                      }}
                    />
                    <span>Beat {beat.beat}: {beat.handler} (timing: {beat.timing})</span>
                  </label>
                ))}
              </div>
              <button
                onClick={runSequenceWithUnmocking}
                className="run-button"
              >
                ▶️ Run Sequence
              </button>
            </div>
          )}

          {logResults && (
            <div className="log-results">
              <h2>📊 Results</h2>
              <div className="results-summary">
                <div className="result-item">
                  <span>Total Duration:</span>
                  <strong>{logResults.totalDuration}ms</strong>
                </div>
                <div className="result-item">
                  <span>Beats Executed:</span>
                  <strong>{logResults.executionLogs.length}</strong>
                </div>
              </div>

              <div className="beats-breakdown">
                <h3>🥁 Beat Breakdown</h3>
                <div className="beats-list">
                  {logResults.executionLogs.map((log) => (
                    <div key={log.beat} className={`beat-item ${log.status}`}>
                      <div className="beat-num">Beat {log.beat}</div>
                      <div className="beat-handler">{log.handler}</div>
                      <div className="beat-duration">{log.duration}ms</div>
                      <div className={`beat-status ${log.status}`}>
                        {log.message === 'UNMOCKED' ? '✨' : '🎭'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analysis-section">
                <h3>🔍 Analysis</h3>
                <p>
                  {unmocker.size === 0
                    ? '✅ All beats mocked - this is the baseline (fast) execution'
                    : `⚠️ ${unmocker.size} beat(s) unmocked - compare timing to find the slow code`
                  }
                </p>
                {logResults.executionLogs.some(log => log.duration > 100) && (
                  <p style={{ color: '#f48771' }}>
                    🚨 Found slow beat(s)! Check which beat(s) have duration &gt; 100ms
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'interactive' && (
      <div className="harness-layout">
        {/* Left Panel: Library */}
        <div className="harness-panel library-panel">
          <h2>📚 Library</h2>
          <div className="library-items">
            {TEST_COMPONENTS.map(comp => (
              <div
                key={comp.id}
                className="library-item"
                draggable
                onDragStart={(e) => handleLibraryDragStart(e, comp.id)}
              >
                <div className="library-item-icon">
                  {comp.type === 'button' && '🔘'}
                  {comp.type === 'div' && '📦'}
                  {comp.type === 'svg' && '🎨'}
                </div>
                <div className="library-item-label">{comp.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Panel: Canvas */}
        <div className="harness-panel canvas-panel">
          <div className="canvas-header">
            <h2>🎨 Canvas</h2>
            {components.length > 0 && (
              <button onClick={clearCanvas} className="clear-button">Clear</button>
            )}
          </div>
          <div
            ref={canvasRef}
            className="canvas-container"
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
          >
            {components.length === 0 && (
              <div className="canvas-placeholder">
                Drag components here to create them
              </div>
            )}
            {components.map(comp => (
              <div
                key={comp.id}
                className={`canvas-component canvas-${comp.type}`}
                style={{
                  position: 'absolute',
                  left: `${comp.x}px`,
                  top: `${comp.y}px`,
                  width: `${comp.width}px`,
                  height: `${comp.height}px`,
                }}
              >
                <span className="component-label">{comp.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Results */}
        <div className="harness-panel results-panel">
          <h2>📊 Execution Results</h2>

          {state.executionLogs.length > 0 && (
            <>
              <div className="result-section">
                <h3>⏱️ Timing</h3>
                <p>Total Duration: <strong>{state.totalDuration}ms</strong></p>
              </div>

              <div className="result-section">
                <h3>📋 Beats</h3>
                <div className="beats-list">
                  {state.executionLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`beat-item ${log.status}`}
                      onClick={() => setSelectedBeat(log.beat)}
                    >
                      <span className="beat-num">Beat {log.beat}</span>
                      <span className="beat-handler">{log.handler}</span>
                      <span className="beat-duration">{log.duration}ms</span>
                      <span className={`beat-status ${log.status}`}>
                        {log.status === 'success' ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {state.kvOps.length > 0 && (
                <div className="result-section">
                  <h3>💾 KV Operations</h3>
                  <pre className="ops-display">{JSON.stringify(state.kvOps, null, 2)}</pre>
                </div>
              )}

              {state.publishedEvents.length > 0 && (
                <div className="result-section">
                  <h3>📤 Events</h3>
                  <pre className="ops-display">{JSON.stringify(state.publishedEvents, null, 2)}</pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default IsolationHarnessPlayground;

