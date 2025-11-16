import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

export default function SessionTimelineVisualization() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [hoveredEvent, setHoveredEvent] = useState(null);

  // Session data - all events with timestamps
  const events = [
    { time: 0, duration: 3073, name: 'System Init', type: 'init', color: '#6366f1' },
    { time: 3073, duration: 144, name: 'Header UI Theme Get', type: 'ui', color: '#f59e0b' },
    { time: 3217, duration: 78, name: 'Library Load', type: 'data', color: '#8b5cf6' },
    { time: 3295, duration: 379, name: 'Control Panel UI Init', type: 'ui', color: '#ec4899' },
    { time: 3674, duration: 2626, name: 'Gap (user idle)', type: 'gap', color: '#dc2626' },
    { time: 6300, duration: 61, name: 'Library Load', type: 'data', color: '#8b5cf6' },
    { time: 6361, duration: 92, name: 'Control Panel UI Render', type: 'render', color: '#10b981' },
    { time: 6453, duration: 9771, name: 'Gap (no activity)', type: 'gap', color: '#dc2626' },
    { time: 16224, duration: 10, name: 'Library Component Drag', type: 'interaction', color: '#3b82f6' },
    { time: 16234, duration: 2843, name: 'Gap (user release)', type: 'gap', color: '#dc2626' },
    { time: 19077, duration: 14, name: 'Library Component Drop', type: 'interaction', color: '#3b82f6' },
    { time: 19091, duration: 2383, name: '⚠️ React Render Block', type: 'blocked', color: '#ef4444' },
    { time: 21474, duration: 58, name: 'Canvas Component Create', type: 'create', color: '#06b6d4' },
    { time: 21532, duration: 2359, name: 'Gap', type: 'gap', color: '#dc2626' },
    { time: 23891, duration: 10, name: 'Header UI Theme Toggle', type: 'ui', color: '#f59e0b' },
    { time: 23901, duration: 3985, name: 'Gap', type: 'gap', color: '#dc2626' },
    { time: 27886, duration: 14, name: 'Header UI Theme Toggle 2', type: 'ui', color: '#f59e0b' },
  ];

  const totalDuration = 28353;
  const containerWidth = 1200;
  const pixelsPerMs = (containerWidth - 40) / totalDuration;

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

  const getEventColor = (type) => {
    const colors = {
      'init': '#6366f1',
      'ui': '#f59e0b',
      'data': '#8b5cf6',
      'render': '#10b981',
      'interaction': '#3b82f6',
      'create': '#06b6d4',
      'gap': '#dc2626',
      'blocked': '#ef4444',
    };
    return colors[type] || '#64748b';
  };

  // Create heatmap data
  const heatmapBuckets = [];
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
    
    heatmapBuckets.push({ time: i, intensity: Math.min(intensity, 1), hasBlocked });
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">RenderX Session Timeline</h1>
          <p className="text-slate-400">Complete flow of events throughout 28.35-second session</p>
        </div>

        {/* Controls */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-8 flex items-center gap-4 flex-wrap">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded font-semibold transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          
          <button
            onClick={() => { setCurrentTime(0); setIsPlaying(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          <div className="flex-1 min-w-48">
            <input
              type="range"
              min="0"
              max={totalDuration}
              value={currentTime}
              onChange={(e) => {
                setCurrentTime(Number(e.target.value));
                setIsPlaying(false);
              }}
              className="w-full h-2 bg-slate-600 rounded cursor-pointer appearance-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2 bg-slate-700 hover:bg-slate-600 rounded">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 bg-slate-700 hover:bg-slate-600 rounded">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="text-right">
            <p className="text-lg font-mono font-bold text-cyan-400">{(currentTime / 1000).toFixed(2)}s</p>
            <p className="text-xs text-slate-400">/ {(totalDuration / 1000).toFixed(2)}s</p>
          </div>
        </div>

        {/* Main Timeline */}
        <div className="space-y-8">
          {/* Waterfall Timeline */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur overflow-x-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-cyan-500"></div>
              Operation Waterfall Timeline
            </h2>

            <svg width="100%" height={60 * events.length + 40} style={{ minWidth: containerWidth }}>
              {/* Timeline background */}
              <defs>
                <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="60 * events.length" stroke="#334155" strokeWidth="0.5" />
                  <text x="5" y="-3" fontSize="12" fill="#64748b">{`${(100 / pixelsPerMs).toFixed(1)}s`}</text>
                </pattern>
              </defs>

              {/* Time markers */}
              {[0, 5, 10, 15, 20, 25, 28].map(t => (
                <g key={t}>
                  <line
                    x1={20 + t * 1000 * pixelsPerMs}
                    y1="0"
                    x2={20 + t * 1000 * pixelsPerMs}
                    y2={60 * events.length + 20}
                    stroke="#334155"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                  <text
                    x={20 + t * 1000 * pixelsPerMs}
                    y={60 * events.length + 35}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#94a3b8"
                  >
                    {t}s
                  </text>
                </g>
              ))}

              {/* Events */}
              {events.map((event, idx) => {
                const x = 20 + event.time * pixelsPerMs;
                const width = event.duration * pixelsPerMs;
                const y = 20 + idx * 60;
                const isActive = currentTime >= event.time && currentTime <= event.time + event.duration;

                return (
                  <g key={idx} onMouseEnter={() => setHoveredEvent(idx)} onMouseLeave={() => setHoveredEvent(null)}>
                    {/* Event bar */}
                    <rect
                      x={x}
                      y={y}
                      width={Math.max(width, 2)}
                      height="40"
                      fill={getEventColor(event.type)}
                      opacity={hoveredEvent === idx ? 1 : 0.7}
                      rx="4"
                      className="transition-opacity cursor-pointer"
                      style={{
                        filter: isActive ? 'drop-shadow(0 0 8px currentColor)' : 'none',
                        animation: isActive ? 'pulse 1s infinite' : 'none'
                      }}
                    />

                    {/* Event label */}
                    {width > 60 && (
                      <text
                        x={x + width / 2}
                        y={y + 25}
                        textAnchor="middle"
                        fontSize="11"
                        fill="white"
                        fontWeight="bold"
                        pointerEvents="none"
                      >
                        {event.name.split(' ')[0]}
                      </text>
                    )}

                    {/* Duration label on hover */}
                    {hoveredEvent === idx && (
                      <g>
                        <rect
                          x={x}
                          y={y - 30}
                          width="120"
                          height="25"
                          fill="#1e293b"
                          stroke="#475569"
                          rx="4"
                        />
                        <text
                          x={x + 60}
                          y={y - 10}
                          textAnchor="middle"
                          fontSize="12"
                          fill="#e2e8f0"
                          fontWeight="bold"
                        >
                          {event.name} - {event.duration}ms
                        </text>
                      </g>
                    )}

                    {/* Current time indicator */}
                    {isActive && (
                      <circle
                        cx={20 + currentTime * pixelsPerMs}
                        cy={y + 20}
                        r="5"
                        fill="#06b6d4"
                        style={{ pointerEvents: 'none' }}
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Heatmap */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500"></div>
              Execution Intensity Heatmap
            </h2>

            <div className="space-y-2">
              <div className="flex gap-2 text-xs text-slate-400">
                <span>Low</span>
                <div className="flex-1 h-6 bg-gradient-to-r from-slate-700 via-blue-600 to-red-600 rounded"></div>
                <span>High</span>
              </div>

              <svg width="100%" height="80" style={{ minWidth: containerWidth }}>
                {/* Heatmap background */}
                {heatmapBuckets.map((bucket, idx) => {
                  const x = 20 + bucket.time * pixelsPerMs;
                  const width = Math.max(500 * pixelsPerMs, 1);
                  // Color scale for heatmap intensity
                  // const colors = {
                  //   0: '#334155',
                  //   0.2: '#3b82f6',
                  //   0.4: '#0ea5e9',
                  //   0.6: '#06b6d4',
                  //   0.8: '#f59e0b',
                  //   1: '#ef4444'
                  // };
                  
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
                🔴 Red = React blocking (2.3s visible at 19.1s mark)
              </div>
            </div>
          </div>

          {/* Event List */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-400"></div>
              Event Details
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {events.map((event, idx) => {
                const isActive = currentTime >= event.time && currentTime <= event.time + event.duration;
                
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded border transition-all ${
                      isActive
                        ? 'bg-slate-700 border-cyan-500 ring-2 ring-cyan-500/50'
                        : hoveredEvent === idx
                        ? 'bg-slate-700 border-slate-600'
                        : 'bg-slate-900/50 border-slate-700'
                    }`}
                    onMouseEnter={() => setHoveredEvent(idx)}
                    onMouseLeave={() => setHoveredEvent(null)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                        style={{ backgroundColor: getEventColor(event.type) }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{event.name}</p>
                        <div className="flex gap-4 text-xs text-slate-400 mt-1">
                          <span>@{(event.time / 1000).toFixed(2)}s</span>
                          <span>{event.duration}ms</span>
                          <span className="capitalize bg-slate-800 px-2 py-0.5 rounded">{event.type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-600/30 rounded-lg p-6 backdrop-blur">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              Key Insights from Timeline
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded p-4 border border-slate-700">
                <p className="text-red-300 font-semibold mb-2">🔴 React Block (19.1s)</p>
                <p className="text-sm text-slate-300">2.383 second gap after drop handler. React synchronous rendering blocks main thread completely.</p>
              </div>

              <div className="bg-slate-800/50 rounded p-4 border border-slate-700">
                <p className="text-orange-300 font-semibold mb-2">🟠 User Idle (6.45s)</p>
                <p className="text-sm text-slate-300">9.771 second gap where user is thinking/positioning. System is ready, waiting for next action.</p>
              </div>

              <div className="bg-slate-800/50 rounded p-4 border border-slate-700">
                <p className="text-cyan-300 font-semibold mb-2">🔵 Active Execution (0.86s)</p>
                <p className="text-sm text-slate-300">Only 3% utilization. Rest is blocked/idle. Main thread starvation throughout session.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-slate-500">
          <p>Visualization shows 28.35-second session with all 17 events and gaps</p>
          <p>Play animation to see flow of events in real-time | Hover over bars for details</p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid #0ea5e9;
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid #0ea5e9;
        }
      `}</style>
    </div>
  );
}
