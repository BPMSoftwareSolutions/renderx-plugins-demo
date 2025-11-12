import React, { useState, useMemo } from 'react';
import { TimelineFlowVisualization, type TimelineData, type TimelineEvent } from './TimelineFlowVisualization';
import { analyzerToTimelineData } from './TimelineDataAdapter';
import { buildFramesFromRawLog } from './frames/frames-builder';
// NOTE: The full telemetry modules (OperationFilter, LogAnalyzer, telemetry.css)
// are being ported from the main app into this workbench. Until those files
// are copied, guard imports with temporary local shims (will be replaced).
// After migration, remove the fallback implementations below.
import './telemetry/telemetry.css';
import { OperationFilterPanel, applyEventFilter, type OperationFilter } from './telemetry/OperationFilter';
import { loadAndParseFile } from './telemetry/LogAnalyzer';

export function App() {
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [framesInfo, setFramesInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  // Raw analyzer retained for future tabs (interaction flow, beats detail)
  const [_rawAnalyzer, setRawAnalyzer] = useState<any>(null);
  const [filter, setFilter] = useState<OperationFilter>({ strategyId: 'all', query: '' });
  const filteredEvents = timeline ? applyEventFilter(timeline.events, filter) : [];
  const [activeTab, setActiveTab] = useState<'timeline' | 'interactions' | 'beats'>('timeline');
  const [selectedInteraction, setSelectedInteraction] = useState<TimelineEvent | null>(null);
  // Stats derived from timeline events (added from TelemetryPage parity)
  const stats = useMemo(() => {
    if (!timeline) return null;
    const gapEvents = timeline.events.filter(e => e.type === 'gap');
    const totalGapTime = gapEvents.reduce((s,e)=>s+e.duration,0);
    const longestGap = gapEvents.reduce((m,e)=>Math.max(m,e.duration),0);
    const activeTime = timeline.events.filter(e => e.type !== 'gap').reduce((s,e)=>s+e.duration,0);
    return { totalEvents: timeline.events.length, gapCount: gapEvents.length, totalGapTime, longestGap, activeTime };
  }, [timeline]);

  const handleAnalyzerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const analyzerOutput = await loadAndParseFile(file);
      setRawAnalyzer(analyzerOutput);
      const data = analyzerToTimelineData(analyzerOutput);
      setTimeline(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || String(err));
    }
  };

  const handleRawLogUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const text = String(ev.target?.result);
        const frames = buildFramesFromRawLog(text);
        setFramesInfo(frames.summary);
        // Optionally derive a tiny timeline from frames (first pass)
        if (!timeline && frames.frames.length) {
          const firstTs = frames.frames[0].epochMs;
          const events: TimelineEvent[] = frames.frames.flatMap((f: any) => f.events.map((ev: any) => ({
            time: f.epochMs - firstTs,
            duration: 1,
            name: ev.type === 'other' ? ev.raw.slice(0, 30) : ev.type,
            type: 'data',
            color: '#14b8a6',
            sourceTimestamp: f.epochMs,
            details: { raw: ev.raw }
          })));
          const lastFrame = frames.frames[frames.frames.length - 1];
          setTimeline({
            events,
            totalDuration: (lastFrame ? lastFrame.epochMs - firstTs : 0) || 0,
            sessionStart: frames.summary.firstTs || undefined,
            sessionEnd: frames.summary.lastTs || undefined,
          });
        }
        setError(null);
      } catch (err: any) {
        setError(err.message || String(err));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '1rem', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <h1 style={{ margin: '0 0 1rem 0', fontSize: '1.75rem' }}>Telemetry Workbench</h1>
      <p style={{ margin: '0 0 1rem 0', color: '#94a3b8' }}>Standalone environment for timeline + beat pin exploration</p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <label style={{ background: '#1e293b', padding: '0.75rem 1rem', borderRadius: 8, cursor: 'pointer' }}>
          Load Analyzer JSON
          <input type="file" accept="application/json" style={{ display: 'none' }} onChange={handleAnalyzerUpload} />
        </label>
        <label style={{ background: '#1e293b', padding: '0.75rem 1rem', borderRadius: 8, cursor: 'pointer' }}>
          Load Raw Log (.log)
          <input type="file" accept="text/plain,.log" style={{ display: 'none' }} onChange={handleRawLogUpload} />
        </label>
        {framesInfo && (
          <div style={{ background: '#0d2538', padding: '0.75rem 1rem', borderRadius: 8 }}>
            <strong>Frames:</strong> {framesInfo.totalFrames} | Events: {framesInfo.totalEvents}
          </div>
        )}
        {stats && (
          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
            <div style={{ background:'#0d2538', padding:'0.5rem 0.75rem', borderRadius:6, fontSize:'0.7rem' }}>Events: {stats.totalEvents}</div>
            <div style={{ background:'#0d2538', padding:'0.5rem 0.75rem', borderRadius:6, fontSize:'0.7rem' }}>Gaps: {stats.gapCount}</div>
            <div style={{ background:'#0d2538', padding:'0.5rem 0.75rem', borderRadius:6, fontSize:'0.7rem' }}>Gap Time: {(stats.totalGapTime/1000).toFixed(2)}s</div>
            <div style={{ background:'#0d2538', padding:'0.5rem 0.75rem', borderRadius:6, fontSize:'0.7rem' }}>Longest Gap: {(stats.longestGap/1000).toFixed(2)}s</div>
            <div style={{ background:'#0d2538', padding:'0.5rem 0.75rem', borderRadius:6, fontSize:'0.7rem' }}>Active: {(stats.activeTime/1000).toFixed(2)}s</div>
          </div>
        )}
        {timeline && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
            {['timeline','interactions','beats'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} style={{ padding: '0.5rem 0.75rem', background: activeTab===tab?'#06b6d4':'#334155', color:'#fff', border:'none', borderRadius:4, cursor:'pointer', fontSize:'0.75rem' }}>{tab}</button>
            ))}
            <button onClick={() => exportCsv()} style={{ padding:'0.5rem 0.75rem', background:'#475569', color:'#fff', border:'none', borderRadius:4, cursor:'pointer', fontSize:'0.75rem' }}>CSV</button>
            <button onClick={() => exportDiagnostics()} style={{ padding:'0.5rem 0.75rem', background:'#475569', color:'#fff', border:'none', borderRadius:4, cursor:'pointer', fontSize:'0.75rem' }}>Diag JSON</button>
          </div>
        )}
      </div>

      {error && <div style={{ color: '#f87171', marginBottom: '1rem' }}>{error}</div>}

      {!timeline && <div style={{ opacity: 0.7, fontStyle: 'italic' }}>Upload an analyzer JSON or raw log to begin...</div>}
      {timeline && activeTab === 'timeline' && (
        <>
          <OperationFilterPanel events={timeline.events} onFilterChange={setFilter} onPressetSelect={() => {}} />
          <TimelineFlowVisualization
            data={{ ...timeline, events: filteredEvents }}
            title="Telemetry Timeline"
            subtitle={`${filteredEvents.length} events filtered of ${timeline.events.length}`}
          />
        </>
      )}
      {timeline && activeTab === 'interactions' && (
        <InteractionFlowView
          events={timeline.events}
          onSelect={e => setSelectedInteraction(e)}
          selected={selectedInteraction}
        />
      )}
      {timeline && activeTab === 'beats' && (
        <SequenceBeatsView events={timeline.events} />
      )}
    </div>
  );
}

interface InteractionFlowViewProps { events: TimelineEvent[]; onSelect: (e: TimelineEvent) => void; selected: TimelineEvent | null; }
function InteractionFlowView({ events, onSelect, selected }: InteractionFlowViewProps) {
  // Derive interaction + render + gap chain timeline for a focused flow
  const interactionEvents = events.filter(e => ['interaction','ui'].includes(e.type));
  const renderEvents = events.filter(e => e.type === 'render');
  const gaps = events.filter(e => ['gap','blocked'].includes(e.type));
  const maxEnd = Math.max(...events.map(e => e.time + e.duration), 1);
  const scale = (ms: number) => (ms / maxEnd) * 100;
  return (
    <div style={{ background:'#0f172a', border:'1px solid #334155', borderRadius:8, padding:'1rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
      <h2 style={{margin:'0 0 0.5rem 0'}}>Interaction Flow</h2>
      <p style={{margin:'0 0 1rem 0', color:'#94a3b8', fontSize:'0.8rem'}}>Shows user interactions, subsequent renders, and blocking gaps aligned on a unified horizontal scale.</p>
  <div className="if-grid-cols">
        <div style={{ fontSize:'0.7rem', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em' }}>User Actions</div>
        <div style={{ position:'relative', height: interactionEvents.length ? interactionEvents.length*26 : 30 }}>
          {interactionEvents.map((e, idx) => (
            <div key={idx} onClick={()=>onSelect(e)} title={`${e.name} @${(e.time/1000).toFixed(2)}s`} style={{ position:'absolute', left: scale(e.time)+'%', top: idx*26, width: Math.max(scale(e.duration),0.35)+'%', minWidth:4, height:18, background:selected===e?'#3b82f6':'#1d4ed8', border:'1px solid #60a5fa', borderRadius:4, cursor:'pointer', boxShadow: selected===e?'0 0 0 2px rgba(59,130,246,0.5)':'none' }} />
          ))}
        </div>
        <div style={{ fontSize:'0.7rem', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em' }}>Renders</div>
        <div style={{ position:'relative', height: renderEvents.length ? renderEvents.length*18 : 20 }}>
          {renderEvents.map((e, idx) => (
            <div key={idx} title={`${e.name} (${e.duration}ms)`} style={{ position:'absolute', left: scale(e.time)+'%', top: idx*18, width: Math.max(scale(e.duration),0.25)+'%', minWidth:3, height:12, background:'#10b981', borderRadius:3, opacity:0.85 }} />
          ))}
        </div>
        <div style={{ fontSize:'0.7rem', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em' }}>Blocking</div>
        <div style={{ position:'relative', height: gaps.length? gaps.length*14 : 20 }}>
          {gaps.map((e, idx) => (
            <div key={idx} title={`${e.name} ${(e.duration/1000).toFixed(2)}s`} style={{ position:'absolute', left: scale(e.time)+'%', top: idx*14, width: Math.max(scale(e.duration),0.35)+'%', minWidth:4, height:10, background: e.type==='blocked'? '#ef4444':'#dc2626', borderRadius:2, boxShadow:'0 0 4px rgba(239,68,68,0.6)' }} />
          ))}
        </div>
        <div style={{ fontSize:'0.7rem', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em' }}>Legend</div>
        <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', fontSize:'0.65rem', color:'#94a3b8' }}>
          <span><span style={{display:'inline-block', width:12, height:12, background:'#1d4ed8', border:'1px solid #60a5fa', marginRight:4}}/>Interaction</span>
          <span><span style={{display:'inline-block', width:12, height:12, background:'#10b981', marginRight:4}}/>Render</span>
          <span><span style={{display:'inline-block', width:12, height:12, background:'#dc2626', marginRight:4}}/>Gap</span>
          <span><span style={{display:'inline-block', width:12, height:12, background:'#ef4444', marginRight:4}}/>Blocked</span>
        </div>
      </div>
      {selected && (
        <div style={{ background:'#1e293b', border:'1px solid #334155', padding:'0.75rem 1rem', borderRadius:6, fontSize:'0.75rem', display:'flex', gap:'1rem', flexWrap:'wrap' }}>
          <div style={{fontWeight:600, color:'#e2e8f0'}}>{selected.name}</div>
          <div>@ {(selected.time/1000).toFixed(3)}s</div>
          <div>{selected.duration}ms</div>
          {selected.pins?.length ? <div>{selected.pins.length} beats</div> : null}
          {selected.sourceTimestamp && <div>abs {new Date(selected.sourceTimestamp).toISOString()}</div>}
        </div>
      )}
    </div>
  );
}

interface SequenceBeatsViewProps { events: TimelineEvent[]; }
function SequenceBeatsView({ events }: SequenceBeatsViewProps) {
  const sequenceEvents = events.filter(e => e.type==='sequence');
  const maxEnd = Math.max(...sequenceEvents.map(e => e.time + e.duration), 1);
  const scale = (ms:number)=> (ms / maxEnd) * 100;
  return (
    <div style={{ background:'#0f172a', border:'1px solid #334155', borderRadius:8, padding:'1rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
      <h2 style={{margin:'0 0 0.5rem 0'}}>Sequence Orchestration Beats</h2>
      <p style={{margin:'0 0 1rem 0', color:'#94a3b8', fontSize:'0.8rem'}}>Each sequence row shows beats (triangle markers) along its execution span.</p>
  <div className="sb-grid-cols">
        {sequenceEvents.length === 0 && <div style={{ gridColumn:'1 / span 2', fontSize:'0.75rem', color:'#64748b' }}>No sequence events found.</div>}
        {sequenceEvents.map(seq => (
          <React.Fragment key={seq.name+seq.time}>
            <div style={{ fontSize:'0.7rem', color:'#e2e8f0', lineHeight:'16px' }}>
              <div style={{fontWeight:600}}>{seq.name}</div>
              <div style={{color:'#64748b'}}>{seq.duration}ms • {seq.pins?.length||0} beats</div>
            </div>
            <div style={{ position:'relative', height:40, borderBottom:'1px dashed #334155' }}>
              <div style={{ position:'absolute', left: scale(seq.time)+'%', top:12, height:16, width: Math.max(scale(seq.duration),0.5)+'%', minWidth:6, background:'#f43f5e', borderRadius:4, opacity:0.85 }} />
              {seq.pins?.map((pin,i)=> {
                const pinLeft = scale(seq.time + pin.offset);
                return (
                  <div key={i} title={pin.label} style={{ position:'absolute', left: pinLeft+'%', top:4, transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', fontSize:'0.55rem', color:'#fde68a' }}>
                    <svg width={10} height={10} style={{overflow:'visible'}}>
                      <path d="M5 0 L0 8 L10 8 Z" fill={pin.color || '#f59e0b'} stroke="#1e293b" strokeWidth={0.75} />
                    </svg>
                    {pin.label && <span style={{whiteSpace:'nowrap'}}>{pin.label}</span>}
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display:'flex', gap:'1rem', fontSize:'0.65rem', color:'#94a3b8', flexWrap:'wrap', marginTop:'0.5rem' }}>
        <span><span style={{display:'inline-block', width:12, height:12, background:'#f43f5e', marginRight:4}}/>Sequence Span</span>
        <span><span style={{display:'inline-block', width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:'8px solid #f59e0b', marginRight:4}}/>Beat</span>
      </div>
    </div>
  );
}

function exportCsv() {
  const state = (window as any).TELEMETRY_WORKBENCH_TIMELINE as TimelineData | undefined;
  if (!state) return;
  const rows = [
    ['time_ms','duration_ms','name','type','abs_start','abs_end','pins']
  ];
  const sessionStartEpoch = state.sessionStart ? Date.parse(state.sessionStart) : undefined;
  state.events.forEach(e => {
    const absStart = e.sourceTimestamp ?? (sessionStartEpoch !== undefined ? sessionStartEpoch + e.time : e.time);
    const absEnd = absStart + e.duration;
    rows.push([
      String(e.time),
      String(e.duration),
      e.name,
      e.type,
      new Date(absStart).toISOString(),
      new Date(absEnd).toISOString(),
      String(e.pins?.length || 0)
    ]);
  });
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type:'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `telemetry-${Date.now()}.csv`; a.click();
}

function exportDiagnostics() {
  const state = (window as any).TELEMETRY_WORKBENCH_TIMELINE as TimelineData | undefined;
  if (!state) return;
  const diagnostics = {
    exportedAt: new Date().toISOString(),
    totalEvents: state.events.length,
    durationMs: state.totalDuration,
    sessionStart: state.sessionStart,
    sessionEnd: state.sessionEnd,
    events: state.events
  };
  const blob = new Blob([JSON.stringify(diagnostics,null,2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `telemetry-diagnostics-${Date.now()}.json`; a.click();
}
