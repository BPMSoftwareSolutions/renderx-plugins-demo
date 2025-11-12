import React, { useState, useEffect, useMemo } from 'react';

export interface TimelineEvent {
  time: number;
  duration: number;
  name: string;
  type: 'init' | 'ui' | 'data' | 'render' | 'interaction' | 'create' | 'gap' | 'blocked' | 'plugin' | 'sequence' | 'topic';
  color: string;
  details?: Record<string, any>;
  sourceTimestamp?: number;
  pins?: Array<{ offset: number; label?: string; type?: string; color?: string; sourceTimestamp?: number }>; 
}

export interface TimelineData {
  events: TimelineEvent[];
  totalDuration: number;
  sessionStart?: string;
  sessionEnd?: string;
}

interface Props { data: TimelineData; title?: string; subtitle?: string; onEventClick?: (e: TimelineEvent) => void; }

export function TimelineFlowVisualization({ data, title = 'Telemetry Timeline', subtitle = '', onEventClick }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);
  const { events, totalDuration } = data;

  const containerWidth = 1200;
  const basePixelsPerMs = (containerWidth - 40) / Math.max(totalDuration, 1);
  const pixelsPerMs = basePixelsPerMs * zoom;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => setCurrentTime(prev => Math.min(prev + 50, totalDuration)), 20);
    return () => clearInterval(t);
  }, [isPlaying, totalDuration]);

  const { placedEvents, layerCount } = useMemo(() => {
    const indexed = events.map((e, i) => ({ e, i }));
    indexed.sort((a, b) => (a.e.time - b.e.time) || (a.i - b.i));
    const endTimes: number[] = [];
    const placed: Array<{ e: TimelineEvent; originalIndex: number; layer: number }> = [];
    for (const { e, i } of indexed) {
      let assigned = -1;
      for (let layer = 0; layer < endTimes.length; layer++) {
        if (endTimes[layer] <= e.time) { assigned = layer; endTimes[layer] = e.time + e.duration; break; }
      }
      if (assigned === -1) { assigned = endTimes.length; endTimes.push(e.time + e.duration); }
      placed.push({ e, originalIndex: i, layer: assigned });
    }
    return { placedEvents: placed, layerCount: endTimes.length };
  }, [events]);

  return (
    <div style={{ background: '#0f172a', color: '#e2e8f0', padding: '1rem', borderRadius: 8 }}>
      <h2 style={{ margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ marginTop: 4, color: '#94a3b8' }}>{subtitle}</p>}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0' }}>
        <button onClick={() => setIsPlaying(p => !p)}>{isPlaying ? 'Pause' : 'Play'}</button>
        <input type="range" min={0} max={totalDuration} value={currentTime} onChange={e => { setCurrentTime(Number(e.target.value)); setIsPlaying(false); }} />
        <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>-</button>
        <span>{(zoom * 100).toFixed(0)}%</span>
        <button onClick={() => setZoom(z => Math.min(2, z + 0.1))}>+</button>
        <span style={{ marginLeft: 'auto', fontFamily: 'monospace' }}>{(currentTime/1000).toFixed(2)}s / {(totalDuration/1000).toFixed(2)}s</span>
      </div>

      {(() => {
        const layerHeight = 32;
        const barHeight = 22;
        const topMargin = 20;
        const bottomMargin = 30;
        const svgHeight = layerCount * layerHeight + topMargin + bottomMargin;
        return (
          <svg width="100%" height={svgHeight} style={{ minWidth: containerWidth }}>
            {placedEvents.map((p) => {
              const event = p.e;
              const x = 20 + event.time * pixelsPerMs;
              const width = Math.max(event.duration * pixelsPerMs, 2);
              const y = topMargin + p.layer * layerHeight;
              const isActive = currentTime >= event.time && currentTime <= event.time + event.duration;
              return (
                <g key={`${p.originalIndex}-${p.layer}`} onMouseEnter={() => setHoveredEvent(p.originalIndex)} onMouseLeave={() => setHoveredEvent(null)} onClick={() => onEventClick?.(event)}>
                  <rect x={x} y={y} width={width} height={barHeight} fill={event.color} opacity={hoveredEvent === p.originalIndex ? 1 : 0.75} rx={4} />
                  {/* pins */}
                  {event.pins?.map((pin, idx) => {
                    const pinX = x + pin.offset * pixelsPerMs;
                    return (
                      <g key={`pin-${idx}`}>
                        <path d={`M ${pinX} ${y - 4} L ${pinX - 4} ${y + 4} L ${pinX + 4} ${y + 4} Z`} fill={pin.color || '#f59e0b'} stroke="#1e293b" strokeWidth={1} />
                        {zoom > 0.9 && (
                          <text x={pinX} y={y - 8} textAnchor="middle" fontSize={9} fill="#e2e8f0">{pin.label}</text>
                        )}
                      </g>
                    );
                  })}
                  {width > 60 && (
                    <text x={x + width / 2} y={y + barHeight - 6} textAnchor="middle" fontSize={11} fill="#fff" fontWeight="bold">{event.name.split(' ')[0]}</text>
                  )}
                  {hoveredEvent === p.originalIndex && (
                    <g>
                      <rect x={x} y={Math.max(0, y - 30)} width={140} height={25} fill="#1e293b" stroke="#475569" rx={4} />
                      <text x={x + 70} y={Math.max(12, y - 10)} textAnchor="middle" fontSize={12} fill="#e2e8f0" fontWeight="bold">{event.name} - {event.duration}ms{event.pins ? ` • ${event.pins.length} beats` : ''}</text>
                    </g>
                  )}
                  {isActive && (
                    <circle cx={20 + currentTime * pixelsPerMs} cy={y + barHeight/2} r={4} fill="#06b6d4" />
                  )}
                </g>
              );
            })}
            <line x1={20 + currentTime * pixelsPerMs} y1={0} x2={20 + currentTime * pixelsPerMs} y2={svgHeight} stroke="#06b6d4" strokeWidth={1} opacity={0.5} />
          </svg>
        );
      })()}
    </div>
  );
}
