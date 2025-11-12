import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Download } from 'lucide-react';
import './telemetry.css';

export interface TimelineEvent {
  time: number;
  duration: number;
  name: string;
  type: 'init' | 'ui' | 'data' | 'render' | 'interaction' | 'create' | 'gap' | 'blocked' | 'plugin' | 'sequence' | 'topic';
  color: string;
  details?: Record<string, any>;
  /** Absolute source timestamp in epoch milliseconds, if available */
  sourceTimestamp?: number;
  /** Optional beat/annotation pins within this event, offsets in ms from event start */
  pins?: Array<{
    offset: number; // ms offset from event.time
    label?: string;
    type?: string;
    color?: string;
    sourceTimestamp?: number; // absolute if known
  }>;
}

export interface TimelineData {
  events: TimelineEvent[];
  totalDuration: number;
  sessionStart?: string;
  sessionEnd?: string;
}

interface TimelineFlowVisualizationProps {
  data: TimelineData;
  onEventClick?: (event: TimelineEvent) => void;
  title?: string;
  subtitle?: string;
}

export default function TimelineFlowVisualization({
  data,
  onEventClick,
  title = 'RenderX Session Timeline',
  subtitle = 'Complete flow of events throughout session',
}: TimelineFlowVisualizationProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<'waterfall' | 'heatmap' | 'list'>('waterfall');

  const { events, totalDuration } = data;
  const containerWidth = 1200;
  const basePixelsPerMs = (containerWidth - 40) / totalDuration;
  const pixelsPerMs = basePixelsPerMs * zoom;

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= totalDuration) {
          setIsPlaying(false);
          return totalDuration;
        }
        return prev + 50;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  const getEventColor = (type: TimelineEvent['type']) => {
    const colors: Record<TimelineEvent['type'], string> = {
      init: '#6366f1',
      ui: '#f59e0b',
      data: '#8b5cf6',
      render: '#10b981',
      interaction: '#3b82f6',
      create: '#06b6d4',
      plugin: '#a855f7',
      sequence: '#f43f5e',
      topic: '#14b8a6',
      gap: '#dc2626',
      blocked: '#ef4444',
    };
    return colors[type] || '#64748b';
  };

  // Create heatmap data
  const heatmapBuckets = useMemo(() => {
    const buckets = [];
    for (let i = 0; i < totalDuration; i += 500) {
      let intensity = 0;
      let hasBlocked = false;

      events.forEach(event => {
        if (event.type === 'gap') return;
        if (event.type === 'blocked') hasBlocked = true;

        const eventStart = event.time;
        const eventEnd = event.time + event.duration;
        const bucketStart = i;
        const bucketEnd = i + 500;

        if (eventStart < bucketEnd && eventEnd > bucketStart) {
          const overlap = Math.min(bucketEnd, eventEnd) - Math.max(bucketStart, eventStart);
          intensity += overlap / 500;
        }
      });

      buckets.push({ time: i, intensity: Math.min(intensity, 1), hasBlocked });
    }
    return buckets;
  }, [events, totalDuration]);

  const statistics = useMemo(() => {
    const stats = {
      totalEvents: events.length,
      gapCount: events.filter(e => e.type === 'gap').length,
      totalGapTime: events.filter(e => e.type === 'gap').reduce((sum, e) => sum + e.duration, 0),
      totalActiveTime: events.filter(e => e.type !== 'gap').reduce((sum, e) => sum + e.duration, 0),
      longestGap: Math.max(...events.filter(e => e.type === 'gap').map(e => e.duration), 0),
    };
    return stats;
  }, [events]);

  // Build a compact layered layout: minimal vertical rows, only when events overlap
  const { placedEvents, layerCount } = useMemo(() => {
    // Sort events by start time (stable by original index)
    const indexed = events.map((e, i) => ({ e, i }));
    indexed.sort((a, b) => (a.e.time - b.e.time) || (a.i - b.i));

    // For quick lookup of original indices (used for hover/list consistency)
    const endTimes: number[] = []; // per layer last end time
    const placed: Array<{ e: TimelineEvent; originalIndex: number; layer: number }> = [];

    for (const { e, i } of indexed) {
      // Find first layer where this event does not overlap (end <= start)
      let assigned = -1;
      for (let layer = 0; layer < endTimes.length; layer++) {
        if (endTimes[layer] <= e.time) {
          assigned = layer;
          endTimes[layer] = e.time + e.duration;
          break;
        }
      }
      if (assigned === -1) {
        assigned = endTimes.length;
        endTimes.push(e.time + e.duration);
      }
      placed.push({ e, originalIndex: i, layer: assigned });
    }

    return { placedEvents: placed, layerCount: endTimes.length };
  }, [events]);

  const handleExport = () => {
    const csvContent = [
      ['Time (ms)', 'Duration (ms)', 'Name', 'Type', 'Start', 'End'],
      ...events.map(e => [
        e.time,
        e.duration,
        e.name,
        e.type,
        e.sourceTimestamp
          ? new Date(e.sourceTimestamp).toISOString()
          : new Date(data.sessionStart ? new Date(data.sessionStart).getTime() + e.time : e.time).toISOString(),
        e.sourceTimestamp
          ? new Date(e.sourceTimestamp + e.duration).toISOString()
          : new Date(data.sessionStart ? new Date(data.sessionStart).getTime() + e.time + e.duration : e.time + e.duration).toISOString(),
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeline-export-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="telemetry-visualization">
      <div className="telemetry-visualization-content">
        <div className="telemetry-visualization-wrapper">
          {/* Header */}
          <h1>{title}</h1>
          <p style={{ margin: '0 0 2rem 0' }}>{subtitle}</p>

          {/* Statistics Cards */}
          <div className="telemetry-stats-grid">
            <div className="telemetry-stat-card">
              <div className="telemetry-stat-card-label">Total Events</div>
              <div className="telemetry-stat-card-value">{statistics.totalEvents}</div>
            </div>
            <div className="telemetry-stat-card">
              <div className="telemetry-stat-card-label">Gap Count</div>
              <div className="telemetry-stat-card-value" style={{ color: '#ef4444' }}>{statistics.gapCount}</div>
            </div>
            <div className="telemetry-stat-card">
              <div className="telemetry-stat-card-label">Total Gap Time</div>
              <div className="telemetry-stat-card-value" style={{ color: '#f97316' }}>{(statistics.totalGapTime / 1000).toFixed(2)}s</div>
            </div>
            <div className="telemetry-stat-card">
              <div className="telemetry-stat-card-label">Active Time</div>
              <div className="telemetry-stat-card-value" style={{ color: '#10b981' }}>{(statistics.totalActiveTime / 1000).toFixed(2)}s</div>
            </div>
          </div>

          {/* Controls */}
          <div className="telemetry-controls">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="telemetry-button"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>

            <button
              onClick={() => {
                setCurrentTime(0);
                setIsPlaying(false);
              }}
              className="telemetry-button telemetry-button-secondary"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>

            <input
              type="range"
              min="0"
              max={totalDuration}
              value={currentTime}
              onChange={(e) => {
                setCurrentTime(Number(e.target.value));
                setIsPlaying(false);
              }}
              className="telemetry-timeline-scrubber"
              style={{ flex: 1, minWidth: '200px' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                className="telemetry-button telemetry-button-secondary"
                style={{ padding: '0.5rem' }}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="telemetry-zoom-display">{(zoom * 100).toFixed(0)}%</span>
              <button
                onClick={() => setZoom(z => Math.min(2, z + 0.1))}
                className="telemetry-button telemetry-button-secondary"
                style={{ padding: '0.5rem' }}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleExport}
              className="telemetry-button telemetry-button-secondary"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>

            <div className="telemetry-time-display">
              <p className="telemetry-time-display-large">{(currentTime / 1000).toFixed(2)}s</p>
              <p className="telemetry-time-display-small">/ {(totalDuration / 1000).toFixed(2)}s</p>
            </div>
          </div>

        {/* Tab Navigation */}
        <div className="telemetry-tabs">
          {(['waterfall', 'heatmap', 'list'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`telemetry-tab ${selectedTab === tab ? 'active' : ''}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Waterfall Timeline */}
          {selectedTab === 'waterfall' && (
            <div className="telemetry-timeline-section">
              <h2 className="telemetry-timeline-title">
                <div className="telemetry-timeline-title-icon"></div>
                Compact Timeline (minimal layering)
              </h2>

              {(() => {
                const layerHeight = 32; // px per layer
                const barHeight = 22;   // px bar height
                const topMargin = 20;
                const bottomMargin = 40;
                const svgHeight = layerCount * layerHeight + topMargin + bottomMargin;
                return (
                  <svg width="100%" height={svgHeight} style={{ minWidth: containerWidth }} className="telemetry-waterfall-svg">
                {/* Timeline background */}
                <defs>
                  <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2={`${svgHeight}`} stroke="#334155" strokeWidth="0.5" />
                  </pattern>
                </defs>

                {/* Time markers */}
                {Array.from({ length: Math.ceil(totalDuration / 5000) + 1 }).map((_, idx) => {
                  const t = idx * 5;
                  return (
                    <g key={t}>
                      <line
                        x1={20 + t * 1000 * pixelsPerMs}
                        y1="0"
                        x2={20 + t * 1000 * pixelsPerMs}
                        y2={svgHeight - 20}
                        stroke="#334155"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                      />
                      <text
                        x={20 + t * 1000 * pixelsPerMs}
                        y={svgHeight - 5}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#94a3b8"
                      >
                        {t}s
                      </text>
                    </g>
                  );
                })}

                {/* Events placed with minimal layering (with optional beat pins) */}
                {placedEvents.map((p) => {
                  const event = p.e;
                  const x = 20 + event.time * pixelsPerMs;
                  const width = Math.max(event.duration * pixelsPerMs, 2);
                  const y = topMargin + p.layer * layerHeight;
                  const isActive = currentTime >= event.time && currentTime <= event.time + event.duration;

                  return (
                    <g
                      key={`${p.originalIndex}-${p.layer}`}
                      onMouseEnter={() => setHoveredEvent(p.originalIndex)}
                      onMouseLeave={() => setHoveredEvent(null)}
                      onClick={() => onEventClick?.(event)}
                      style={{ cursor: onEventClick ? 'pointer' : 'default' }}
                    >
                      {/* Event bar */}
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={barHeight}
                        fill={event.color || getEventColor(event.type)}
                        opacity={hoveredEvent === p.originalIndex ? 1 : 0.7}
                        rx="4"
                        className="transition-opacity"
                        style={{
                          filter: isActive ? 'drop-shadow(0 0 8px currentColor)' : 'none',
                        }}
                      />

                      {/* Beat pins */}
                      {event.pins && event.pins.map((pin, idx) => {
                        const pinX = x + pin.offset * pixelsPerMs;
                        return (
                          <g key={`pin-${idx}`} className="telemetry-beat-pin">
                            <path
                              d={`M ${pinX} ${y - 4} L ${pinX - 4} ${y + 4} L ${pinX + 4} ${y + 4} Z`}
                              fill={pin.color || '#f59e0b'}
                              stroke="#1e293b"
                              strokeWidth="1"
                              opacity={hoveredEvent === p.originalIndex ? 1 : 0.85}
                            />
                            {zoom > 0.9 && (
                              <text
                                x={pinX}
                                y={y - 8}
                                textAnchor="middle"
                                fontSize="9"
                                fill="#e2e8f0"
                                style={{ pointerEvents: 'none' }}
                              >
                                {pin.label}
                              </text>
                            )}
                          </g>
                        );
                      })}

                      {/* Event label */}
                      {width > 60 && (
                        <text
                          x={x + width / 2}
                          y={y + barHeight - 6}
                          textAnchor="middle"
                          fontSize="11"
                          fill="white"
                          fontWeight="bold"
                          pointerEvents="none"
                        >
                          {event.name.split(' ')[0]}
                        </text>
                      )}

                      {/* Hover detail (includes beats count if present) */}
                      {hoveredEvent === p.originalIndex && (
                        <g>
                          <rect
                            x={x}
                            y={Math.max(0, y - 30)}
                            width="120"
                            height="25"
                            fill="#1e293b"
                            stroke="#475569"
                            rx="4"
                          />
                          <text
                            x={x + 60}
                            y={Math.max(12, y - 10)}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#e2e8f0"
                            fontWeight="bold"
                          >
                            {event.name} - {event.duration}ms{event.pins ? ` • ${event.pins.length} beats` : ''}
                          </text>
                        </g>
                      )}

                      {/* Current time indicator */}
                      {isActive && (
                        <circle
                          cx={20 + currentTime * pixelsPerMs}
                          cy={y + barHeight / 2}
                          r="5"
                          fill="#06b6d4"
                          style={{ pointerEvents: 'none' }}
                        />
                      )}
                    </g>
                  );
                })}
                  {/* Current time guideline across the compact timeline */}
                  <line
                    x1={20 + currentTime * pixelsPerMs}
                    y1={0}
                    x2={20 + currentTime * pixelsPerMs}
                    y2={svgHeight}
                    stroke="#06b6d4"
                    strokeWidth="1"
                    opacity={0.5}
                    style={{ pointerEvents: 'none' }}
                  />
                </svg>
                );
              })()}
            </div>
          )}

          {/* Heatmap */}
          {selectedTab === 'heatmap' && (
            <div className="telemetry-timeline-section">
              <h2 className="telemetry-timeline-title">
                <div className="telemetry-timeline-title-icon" style={{ backgroundColor: '#f97316' }}></div>
                Execution Intensity Heatmap
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="telemetry-heatmap-gradient">
                  <span>Low</span>
                  <div className="telemetry-heatmap-gradient-bar"></div>
                  <span>High</span>
                </div>

                <svg width="100%" height="80" style={{ minWidth: containerWidth }} className="telemetry-waterfall-svg">
                  {/* Heatmap background */}
                  {heatmapBuckets.map((bucket, idx) => {
                    const x = 20 + bucket.time * pixelsPerMs;
                    const width = Math.max(500 * pixelsPerMs, 1);

                    let color = '#334155';
                    if (bucket.hasBlocked) color = '#ef4444';
                    else if (bucket.intensity > 0.8) color = '#ef4444';
                    else if (bucket.intensity > 0.6) color = '#f59e0b';
                    else if (bucket.intensity > 0.4) color = '#06b6d4';
                    else if (bucket.intensity > 0.2) color = '#3b82f6';
                    else if (bucket.intensity > 0) color = '#0ea5e9';

                    return (
                      <rect
                        key={idx}
                        x={x}
                        y="20"
                        width={width}
                        height="40"
                        fill={color}
                        opacity="0.8"
                      />
                    );
                  })}

                  {/* Current time indicator */}
                  <line
                    x1={20 + currentTime * pixelsPerMs}
                    y1="0"
                    x2={20 + currentTime * pixelsPerMs}
                    y2="80"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    style={{ pointerEvents: 'none' }}
                  />
                </svg>

                <div className="text-xs text-slate-400 mt-2">
                  🔴 Red = High execution intensity or React blocking
                </div>
              </div>
            </div>
          )}

          {/* Event List */}
          {selectedTab === 'list' && (
            <div className="telemetry-timeline-section">
              <h2 className="telemetry-timeline-title">
                <div className="telemetry-timeline-title-icon" style={{ backgroundColor: '#94a3b8' }}></div>
                Event Details
              </h2>

              <div className="telemetry-event-list-grid">
                {events.map((event, idx) => {
                  const isActive = currentTime >= event.time && currentTime <= event.time + event.duration;

                  return (
                    <div
                      key={idx}
                      className={`telemetry-event-item ${isActive ? 'active' : hoveredEvent === idx ? '' : ''}`}
                      style={hoveredEvent === idx ? { backgroundColor: 'rgba(30, 41, 59, 0.8)', borderColor: '#475569' } : {}}
                      onMouseEnter={() => setHoveredEvent(idx)}
                      onMouseLeave={() => setHoveredEvent(null)}
                      onClick={() => onEventClick?.(event)}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div
                          className="telemetry-event-marker"
                          style={{ backgroundColor: event.color || getEventColor(event.type) }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="telemetry-event-name">{event.name}</div>
                          <div className="telemetry-event-meta">
                            <span>@{(event.time / 1000).toFixed(2)}s</span>
                            <span>{event.duration}ms</span>
                            <span className="telemetry-event-meta-tag">{event.type}</span>
                          </div>
                          {event.details && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
                              {Object.entries(event.details).map(([k, v]) => (
                                <div key={k}>
                                  <span style={{ color: '#94a3b8' }}>{k}:</span> {String(v)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Key Insights */}
          <div className="telemetry-insights-section">
            <h2 className="telemetry-insights-title">
              <div className="telemetry-timeline-title-icon" style={{ backgroundColor: '#ef4444' }}></div>
              Key Insights from Timeline
            </h2>

            <div className="telemetry-insights-grid">
              <div className="telemetry-insight-card">
                <div className="telemetry-insight-label" style={{ color: '#ef4444' }}>🔴 React Blocking</div>
                <p className="telemetry-insight-text">
                  {statistics.longestGap > 0
                    ? `Longest gap: ${(statistics.longestGap / 1000).toFixed(2)}s. React rendering blocks main thread completely.`
                    : 'No blocking detected.'}
                </p>
              </div>

              <div className="telemetry-insight-card">
                <div className="telemetry-insight-label" style={{ color: '#f97316' }}>🟠 Total Idle Time</div>
                <p className="telemetry-insight-text">
                  {(statistics.totalGapTime / 1000).toFixed(2)}s across {statistics.gapCount} gaps. System waiting for next action.
                </p>
              </div>

              <div className="telemetry-insight-card">
                <div className="telemetry-insight-label" style={{ color: '#22d3ee' }}>🔵 Execution Efficiency</div>
                <p className="telemetry-insight-text">
                  {((statistics.totalActiveTime / totalDuration) * 100).toFixed(1)}% utilization.
                  Main thread {statistics.totalGapTime > statistics.totalActiveTime ? 'heavily' : 'moderately'} starved.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="telemetry-footer">
          <p>Visualization shows {(totalDuration / 1000).toFixed(2)}-second session with all {events.length} events and gaps</p>
          <p>Play animation to see flow of events in real-time | Hover over bars for details | Click events for interaction</p>
        </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
      </div>
      </div>
    </div>
  );
}
