import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, ChevronDown, ChevronRight, Clock, Zap, AlertCircle, Filter } from 'lucide-react';

export default function AdvancedSequencePlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [events, setEvents] = useState([]);
  const [sequences, setSequences] = useState([]);
  const [expandedSequences, setExpandedSequences] = useState(new Set());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [showStats, setShowStats] = useState(true);
  const containerRef = useRef(null);

  // Load telemetry
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/telemetry-diagnostics-1762874926512.json');
        const data = await response.json();
        
        if (data.stage3_timelineData?.events) {
          const evts = data.stage3_timelineData.events.map((e, i) => ({
            ...e,
            id: i,
            endTime: e.time + e.duration,
          }));
          setEvents(evts);
          
          // Group events into sequences
          const seqs = extractSequences(evts);
          setSequences(seqs);
        }
      } catch (error) {
        console.warn('Using demo data');
        setEvents(generateDemoEvents());
        setSequences(generateDemoSequences());
      }
    };
    
    loadData();
  }, []);

  const generateDemoEvents = () => {
    return [
      { id: 0, time: 0, duration: 3073, name: 'System Init', type: 'init', color: '#6366f1', endTime: 3073, details: { topic: 'core:init' } },
      { id: 1, time: 3073, duration: 144, name: 'Header Theme Get', type: 'ui', color: '#f59e0b', endTime: 3217, details: { topic: 'ui:header' } },
      { id: 2, time: 3217, duration: 78, name: 'Library Load', type: 'data', color: '#8b5cf6', endTime: 3295, details: { topic: 'data:lib' } },
      { id: 3, time: 3295, duration: 379, name: 'Control Panel Init', type: 'ui', color: '#ec4899', endTime: 3674, details: { topic: 'ui:panel' } },
      { id: 4, time: 19077, duration: 14, name: 'Library Drop', type: 'interaction', color: '#3b82f6', endTime: 19091, details: { topic: 'drop' } },
      { id: 5, time: 19091, duration: 2383, name: 'React Render', type: 'blocked', color: '#ef4444', endTime: 21474, details: { topic: 'render:block' } },
      { id: 6, time: 21474, duration: 58, name: 'Canvas Create', type: 'create', color: '#06b6d4', endTime: 21532, details: { topic: 'create:canvas' } },
    ];
  };

  const generateDemoSequences = () => {
    return [
      {
        id: 'seq-0',
        name: 'System Boot',
        startTime: 0,
        endTime: 3674,
        events: [0, 1, 2, 3],
        severity: 'normal',
        children: [],
      },
      {
        id: 'seq-1',
        name: 'Drop & Render',
        startTime: 19077,
        endTime: 21532,
        events: [4, 5, 6],
        severity: 'critical',
        children: [],
      },
    ];
  };

  const extractSequences = (events) => {
    const sequences = [];
    let currentSeq = null;
    
    events.forEach((event, idx) => {
      if (!currentSeq || event.time > currentSeq.endTime + 100) {
        if (currentSeq) sequences.push(currentSeq);
        currentSeq = {
          id: `seq-${sequences.length}`,
          name: `Sequence ${sequences.length + 1}`,
          startTime: event.time,
          endTime: event.endTime,
          events: [event.id],
          severity: event.type === 'blocked' ? 'critical' : 'normal',
          children: [],
        };
      } else {
        currentSeq.events.push(event.id);
        currentSeq.endTime = Math.max(currentSeq.endTime, event.endTime);
      }
    });
    
    if (currentSeq) sequences.push(currentSeq);
    return sequences;
  };

  const totalDuration = events.length > 0 ? Math.max(...events.map(e => e.endTime)) : 28353;
  const containerWidth = 1600;
  const pixelsPerMs = (containerWidth - 60) / totalDuration;

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + (20 * playbackSpeed);
        if (next >= totalDuration) {
          setIsPlaying(false);
          return totalDuration;
        }
        return next;
      });
    }, 20);
    
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration, playbackSpeed]);

  // Filter events
  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return events;
    return events.filter(e => e.type === filterType);
  }, [events, filterType]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeEvents = events.filter(e => e.time <= currentTime && e.endTime >= currentTime);
    const totalTime = filteredEvents.reduce((sum, e) => sum + e.duration, 0);
    const criticalCount = events.filter(e => e.type === 'blocked').length;
    
    return {
      activeCount: activeEvents.length,
      totalTime,
      criticalCount,
      avgDuration: events.length > 0 ? (totalTime / events.length).toFixed(1) : 0,
    };
  }, [events, filteredEvents, currentTime]);

  // Get event color
  const getEventColor = (type) => {
    const colors = {
      'init': '#6366f1',
      'ui': '#f59e0b',
      'data': '#8b5cf6',
      'render': '#10b981',
      'interaction': '#3b82f6',
      'create': '#06b6d4',
      'blocked': '#ef4444',
      'movement': '#a78bfa',
      'beat': '#06b6d4',
    };
    return colors[type] || '#64748b';
  };

  // Toggle sequence expansion
  const toggleSequence = (seqId) => {
    const newExpanded = new Set(expandedSequences);
    if (newExpanded.has(seqId)) {
      newExpanded.delete(seqId);
    } else {
      newExpanded.add(seqId);
    }
    setExpandedSequences(newExpanded);
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    const colors = {
      'critical': '#ef4444',
      'warning': '#f59e0b',
      'normal': '#10b981',
    };
    return colors[severity] || '#64748b';
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Advanced Sequence Player</h1>
          <p className="text-slate-400">
            {events.length} events in {sequences.length} sequences • Total duration: {(totalDuration / 1000).toFixed(2)}s
          </p>
        </div>

        {/* Controls Row 1 */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6 backdrop-blur">
          <div className="flex items-center gap-3 flex-wrap mb-4">
            {/* Playback */}
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

            {/* Speed */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Speed:</span>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>

            {/* Zoom */}
            <div className="flex items-center gap-2">
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2 bg-slate-700 hover:bg-slate-600 rounded">
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
              <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 bg-slate-700 hover:bg-slate-600 rounded">
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Time Display */}
            <div className="text-right ml-auto">
              <p className="text-lg font-mono font-bold text-cyan-400">{(currentTime / 1000).toFixed(2)}s</p>
              <p className="text-xs text-slate-400">/ {(totalDuration / 1000).toFixed(2)}s</p>
            </div>
          </div>

          {/* Timeline Scrubber */}
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max={totalDuration}
              value={currentTime}
              onChange={(e) => {
                setCurrentTime(Number(e.target.value));
                setIsPlaying(false);
              }}
              className="flex-1 h-2 bg-slate-600 rounded cursor-pointer appearance-none"
            />
          </div>

          {/* Filters & Options */}
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Filter:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm"
              >
                <option value="all">All Types</option>
                <option value="init">Init</option>
                <option value="ui">UI</option>
                <option value="data">Data</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-slate-300">
              <input
                type="checkbox"
                checked={showStats}
                onChange={(e) => setShowStats(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              Show Statistics
            </label>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Timeline Panel */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
              <h2 className="text-lg font-bold mb-4">Sequence Timeline</h2>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-4">
                {sequences.map((seq) => (
                  <div key={seq.id} className="space-y-1">
                    {/* Sequence Header */}
                    <button
                      onClick={() => toggleSequence(seq.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded transition-colors text-left"
                    >
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${expandedSequences.has(seq.id) ? 'rotate-90' : ''}`}
                      />
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getSeverityColor(seq.severity) }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{seq.name}</p>
                        <p className="text-xs text-slate-400">
                          {(seq.startTime / 1000).toFixed(2)}s - {(seq.endTime / 1000).toFixed(2)}s
                        </p>
                      </div>
                      <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">
                        {seq.events.length} events
                      </span>
                    </button>

                    {/* Sequence Events */}
                    {expandedSequences.has(seq.id) && (
                      <div className="ml-6 space-y-1 pb-2">
                        {seq.events.map(eventId => {
                          const event = events.find(e => e.id === eventId);
                          if (!event) return null;
                          
                          const isActive = currentTime >= event.time && currentTime <= event.endTime;
                          const isSelected = selectedEvent?.id === event.id;

                          return (
                            <button
                              key={event.id}
                              onClick={() => setSelectedEvent(isSelected ? null : event)}
                              className={`w-full flex items-center gap-2 px-3 py-1 rounded text-xs text-left transition-colors ${
                                isActive
                                  ? 'bg-cyan-600/40 text-cyan-100 border border-cyan-500/50'
                                  : isSelected
                                  ? 'bg-slate-600 text-slate-50 border border-slate-500'
                                  : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50'
                              }`}
                            >
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: getEventColor(event.type) }}
                              />
                              <span className="flex-1 truncate">{event.name}</span>
                              <span className="font-mono text-xs text-slate-400">{event.duration}ms</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            {/* Statistics */}
            {showStats && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 backdrop-blur">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Statistics
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-400">Active Events</p>
                    <p className="text-2xl font-bold text-cyan-400">{stats.activeCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Total Time</p>
                    <p className="text-lg font-mono text-slate-300">{(stats.totalTime / 1000).toFixed(2)}s</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Critical Events</p>
                    <p className="text-lg font-bold text-red-400">{stats.criticalCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Avg Duration</p>
                    <p className="text-lg font-mono text-slate-300">{stats.avgDuration}ms</p>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Event Details */}
            {selectedEvent && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 backdrop-blur">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Event Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-400 uppercase">Name</p>
                    <p className="font-semibold mt-1">{selectedEvent.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Type</p>
                      <p className="font-mono mt-1 text-xs">{selectedEvent.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Duration</p>
                      <p className="font-mono mt-1 text-xs">{selectedEvent.duration}ms</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase">Time Range</p>
                    <p className="font-mono text-xs mt-1">
                      {(selectedEvent.time / 1000).toFixed(3)}s - {(selectedEvent.endTime / 1000).toFixed(3)}s
                    </p>
                  </div>
                  {selectedEvent.details?.topic && (
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Topic</p>
                      <p className="font-mono text-xs mt-1 text-slate-300 break-words">{selectedEvent.details.topic}</p>
                    </div>
                  )}
                  <button
                    onClick={() => setCurrentTime(selectedEvent.time)}
                    className="w-full px-2 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded text-xs font-semibold transition-colors mt-3"
                  >
                    Jump to Event
                  </button>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 backdrop-blur">
              <h3 className="text-sm font-bold mb-2">Types</h3>
              <div className="space-y-1 text-xs">
                {['init', 'ui', 'data', 'blocked', 'create'].map(type => (
                  <div key={type} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getEventColor(type) }}
                    />
                    <span className="capitalize text-slate-300">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Waterfall Timeline Visualization */}
        <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur overflow-x-auto">
          <h2 className="text-lg font-bold mb-4">Event Waterfall</h2>

          <svg
            width={containerWidth * zoom}
            height={Math.max(300, filteredEvents.length * 35)}
            style={{ minWidth: containerWidth }}
          >
            {/* Time markers */}
            {[0, 5, 10, 15, 20, 25].map(t => {
              const x = 20 + t * 1000 * pixelsPerMs * zoom;
              if (x > containerWidth * zoom) return null;
              return (
                <g key={`tm-${t}`}>
                  <line x1={x} y1="0" x2={x} y2={filteredEvents.length * 35} stroke="#334155" strokeWidth="1" strokeDasharray="4,4" opacity="0.2" />
                  <text x={x} y="20" textAnchor="middle" fontSize="11" fill="#94a3b8">{t}s</text>
                </g>
              );
            })}

            {/* Events */}
            {filteredEvents.map((event, idx) => {
              const x = 20 + event.time * pixelsPerMs * zoom;
              const width = Math.max(event.duration * pixelsPerMs * zoom, 2);
              const y = 35 + idx * 35;
              const isActive = currentTime >= event.time && currentTime <= event.endTime;

              return (
                <g key={event.id} onClick={() => setSelectedEvent(event)} style={{ cursor: 'pointer' }}>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height="25"
                    fill={getEventColor(event.type)}
                    opacity={isActive ? 1 : 0.6}
                    rx="2"
                    style={{
                      filter: isActive ? 'drop-shadow(0 0 4px currentColor)' : 'none',
                    }}
                  />
                  {width > 40 && (
                    <text
                      x={x + width / 2}
                      y={y + 16}
                      textAnchor="middle"
                      fontSize="9"
                      fill="white"
                      fontWeight="bold"
                      pointerEvents="none"
                    >
                      {event.name.substring(0, 15)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Playhead */}
            <line
              x1={20 + currentTime * pixelsPerMs * zoom}
              y1="0"
              x2={20 + currentTime * pixelsPerMs * zoom}
              y2={filteredEvents.length * 35}
              stroke="#06b6d4"
              strokeWidth="2"
              style={{ pointerEvents: 'none' }}
            />
          </svg>
        </div>
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid #0ea5e9;
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid #0ea5e9;
        }
      `}</style>
    </div>
  );
}
