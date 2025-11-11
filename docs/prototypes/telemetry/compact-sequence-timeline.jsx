import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Volume2, VolumeX, Maximize2 } from 'lucide-react';

export default function CompactSequencePlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [events, setEvents] = useState([]);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAudio, setShowAudio] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Load data
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
        }
      } catch (error) {
        console.warn('Using demo data');
        setEvents(generateDemoEvents());
      }
    };
    
    loadData();
  }, []);

  const generateDemoEvents = () => {
    return [
      { id: 0, time: 0, duration: 3073, name: 'System Init', type: 'init', color: '#6366f1', endTime: 3073, details: { topic: 'core:init' } },
      { id: 1, time: 3073, duration: 144, name: 'Header Theme', type: 'ui', color: '#f59e0b', endTime: 3217, details: { topic: 'ui:header' } },
      { id: 2, time: 3217, duration: 78, name: 'Library Load', type: 'data', color: '#8b5cf6', endTime: 3295, details: { topic: 'data:lib' } },
      { id: 3, time: 3295, duration: 379, name: 'Control Panel', type: 'ui', color: '#ec4899', endTime: 3674, details: { topic: 'ui:panel' } },
      { id: 4, time: 19077, duration: 14, name: 'Drop Handler', type: 'interaction', color: '#3b82f6', endTime: 19091, details: { topic: 'drop' } },
      { id: 5, time: 19091, duration: 2383, name: 'React Render', type: 'blocked', color: '#ef4444', endTime: 21474, details: { topic: 'render' } },
      { id: 6, time: 21474, duration: 58, name: 'Canvas Create', type: 'create', color: '#06b6d4', endTime: 21532, details: { topic: 'create' } },
    ];
  };

  const totalDuration = events.length > 0 ? Math.max(...events.map(e => e.endTime)) : 28353;
  const containerWidth = 1600;
  const pixelsPerMs = (containerWidth - 80) / totalDuration;
  const eventHeight = 32;

  // Smart layering: assign layer based on overlaps
  const layeredEvents = useMemo(() => {
    const layers = [];
    
    events.forEach(event => {
      let assignedLayer = 0;
      
      // Check which layers this event would overlap with
      for (let layer = 0; layer < layers.length; layer++) {
        const layerEvents = layers[layer];
        const overlaps = layerEvents.some(existing => 
          !(event.endTime <= existing.time || event.time >= existing.endTime)
        );
        
        if (!overlaps) {
          assignedLayer = layer;
          break;
        } else {
          assignedLayer = layer + 1;
        }
      }
      
      // Ensure layer exists
      if (!layers[assignedLayer]) {
        layers[assignedLayer] = [];
      }
      
      layers[assignedLayer].push({ ...event, layer: assignedLayer });
    });
    
    return layers.flat();
  }, [events]);

  const maxLayers = useMemo(() => {
    return Math.max(...layeredEvents.map(e => e.layer), 0) + 1;
  }, [layeredEvents]);

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

  // Audio cue
  useEffect(() => {
    if (!showAudio || !isPlaying) return;
    
    const activeEvents = events.filter(e => 
      currentTime >= e.time && currentTime < e.time + 10
    );
    
    if (activeEvents.length > 0) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.value = activeEvents[0].type === 'blocked' ? 300 : 800;
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      } catch (e) {
        // Silence audio errors
      }
    }
  }, [currentTime, events, showAudio, isPlaying]);

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

  // Get active events
  const activeEvents = useMemo(() => {
    return events.filter(e => currentTime >= e.time && currentTime <= e.endTime);
  }, [events, currentTime]);

  // Get event progress
  const getEventProgress = (event) => {
    if (currentTime < event.time) return 0;
    if (currentTime > event.endTime) return 1;
    return (currentTime - event.time) / event.duration;
  };

  // Easing function
  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const svgHeight = maxLayers * eventHeight + 60;

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 transition-all ${
        fullscreen ? 'p-4' : 'p-8'
      }`}
    >
      <div className={`${fullscreen ? 'max-w-full' : 'max-w-7xl'} mx-auto`}>
        {/* Header */}
        {!fullscreen && (
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">Sequence Timeline</h1>
            <p className="text-slate-400">
              {events.length} events • {activeEvents.length} active • {(currentTime / 1000).toFixed(2)}s / {(totalDuration / 1000).toFixed(2)}s
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 mb-4 backdrop-blur flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={() => { setCurrentTime(0); setIsPlaying(false); }}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed */}
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>

          {/* Zoom */}
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2 bg-slate-700 hover:bg-slate-600 rounded">
            <ZoomOut className="w-3 h-3" />
          </button>
          <span className="text-xs w-10 text-center">{(zoom * 100).toFixed(0)}%</span>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 bg-slate-700 hover:bg-slate-600 rounded">
            <ZoomIn className="w-3 h-3" />
          </button>

          {/* Audio */}
          <button
            onClick={() => setShowAudio(!showAudio)}
            className={`p-2 rounded transition-colors ${
              showAudio ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-700/50'
            }`}
          >
            {showAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors ml-auto"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Time */}
          <div className="text-right">
            <p className="text-sm font-mono font-bold text-cyan-400">{(currentTime / 1000).toFixed(2)}s</p>
          </div>
        </div>

        {/* Timeline Scrubber */}
        <div className="mb-4">
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

        {/* Main Timeline - Compact Linear Layout */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur mb-6 overflow-x-auto">
          <svg
            width={containerWidth * zoom}
            height={svgHeight}
            style={{ minWidth: containerWidth }}
            className="relative"
          >
            {/* Background */}
            <defs>
              <pattern id="compact-grid" width="200" height={svgHeight} patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2={svgHeight} stroke="#334155" strokeWidth="0.5" opacity="0.1" />
              </pattern>
            </defs>

            <rect width={containerWidth * zoom} height={svgHeight} fill="url(#compact-grid)" />

            {/* Time Markers */}
            {[0, 5, 10, 15, 20, 25].map(t => {
              const x = 40 + t * 1000 * pixelsPerMs * zoom;
              if (x > containerWidth * zoom) return null;
              return (
                <g key={`marker-${t}`}>
                  <line 
                    x1={x} 
                    y1="0" 
                    x2={x} 
                    y2={svgHeight - 20} 
                    stroke="#334155" 
                    strokeWidth="1" 
                    strokeDasharray="2,4" 
                    opacity="0.2" 
                  />
                  <text 
                    x={x} 
                    y={svgHeight - 5} 
                    textAnchor="middle" 
                    fontSize="10" 
                    fill="#94a3b8" 
                    fontWeight="bold"
                  >
                    {t}s
                  </text>
                </g>
              );
            })}

            {/* Events - Smart Layering */}
            {layeredEvents.map((event) => {
              const x = 40 + event.time * pixelsPerMs * zoom;
              const width = Math.max(event.duration * pixelsPerMs * zoom, 3);
              const y = 20 + event.layer * eventHeight;
              const isActive = currentTime >= event.time && currentTime <= event.endTime;
              const progress = getEventProgress(event);
              const eased = easeInOutCubic(progress);
              const isHovered = hoveredEvent === event.id;
              const isSelected = selectedEvent?.id === event.id;

              return (
                <g 
                  key={event.id} 
                  onMouseEnter={() => setHoveredEvent(event.id)}
                  onMouseLeave={() => setHoveredEvent(null)}
                  onClick={() => setSelectedEvent(isSelected ? null : event)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Shadow for active events */}
                  {isActive && (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={eventHeight - 4}
                      fill={getEventColor(event.type)}
                      opacity={0.15}
                      rx="3"
                      style={{ filter: 'blur(6px)' }}
                    />
                  )}

                  {/* Main bar */}
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={eventHeight - 4}
                    fill={getEventColor(event.type)}
                    opacity={isActive ? 1 : isHovered ? 0.8 : 0.65}
                    rx="3"
                    style={{
                      filter: isActive ? `drop-shadow(0 0 8px ${getEventColor(event.type)})` : 'drop-shadow(0 0 2px rgba(0,0,0,0.5))',
                      transition: 'opacity 0.1s ease-out',
                    }}
                  />

                  {/* Progress overlay for active events */}
                  {isActive && (
                    <rect
                      x={x}
                      y={y}
                      width={width * eased}
                      height={eventHeight - 4}
                      fill={getEventColor(event.type)}
                      opacity="0.25"
                      rx="3"
                      style={{ pointerEvents: 'none' }}
                    />
                  )}

                  {/* Label */}
                  {width > 40 && (
                    <text
                      x={x + width / 2}
                      y={y + eventHeight / 2 - 2}
                      textAnchor="middle"
                      fontSize="10"
                      fill="white"
                      fontWeight="bold"
                      pointerEvents="none"
                      style={{
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                        opacity: isActive ? 1 : 0.8,
                      }}
                    >
                      {event.name.substring(0, 20)}
                    </text>
                  )}

                  {/* Hover tooltip */}
                  {isHovered && (
                    <g>
                      <rect
                        x={Math.max(5, x - 50)}
                        y={y - 28}
                        width="100"
                        height="24"
                        fill="#1e293b"
                        stroke="#475569"
                        rx="3"
                        opacity="0.95"
                      />
                      <text
                        x={Math.max(55, x)}
                        y={y - 10}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#e2e8f0"
                        fontWeight="bold"
                      >
                        {event.name}
                      </text>
                      <text
                        x={Math.max(55, x)}
                        y={y - 1}
                        textAnchor="middle"
                        fontSize="8"
                        fill="#cbd5e1"
                      >
                        {event.duration}ms
                      </text>
                    </g>
                  )}

                  {/* Selection border */}
                  {isSelected && (
                    <rect
                      x={x - 2}
                      y={y - 2}
                      width={width + 4}
                      height={eventHeight}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      rx="3"
                      style={{ pointerEvents: 'none' }}
                    />
                  )}
                </g>
              );
            })}

            {/* Playhead */}
            <line
              x1={40 + currentTime * pixelsPerMs * zoom}
              y1="0"
              x2={40 + currentTime * pixelsPerMs * zoom}
              y2={svgHeight - 20}
              stroke="#06b6d4"
              strokeWidth="3"
              opacity="0.9"
              style={{ pointerEvents: 'none' }}
            />

            {/* Playhead tip */}
            <circle
              cx={40 + currentTime * pixelsPerMs * zoom}
              cy="12"
              r="5"
              fill="#06b6d4"
              style={{ pointerEvents: 'none' }}
            />
          </svg>
        </div>

        {/* Active Events Card */}
        {activeEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {activeEvents.map(event => {
              const progress = getEventProgress(event);
              return (
                <div
                  key={event.id}
                  className="bg-slate-800/70 border-2 rounded-lg p-3 backdrop-blur"
                  style={{
                    borderColor: getEventColor(event.type),
                    boxShadow: `0 0 12px ${getEventColor(event.type)}40`,
                  }}
                >
                  <p className="text-sm font-bold mb-2">{event.name}</p>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progress * 100}%`,
                        backgroundColor: getEventColor(event.type),
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{(progress * 100).toFixed(0)}%</span>
                    <span>{(event.duration * (1 - progress)).toFixed(0)}ms left</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Event Details */}
        {selectedEvent && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 backdrop-blur">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold">{selectedEvent.name}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400 uppercase mb-1">Type</p>
                <p className="font-mono capitalize">{selectedEvent.type}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase mb-1">Duration</p>
                <p className="font-mono">{selectedEvent.duration}ms</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase mb-1">Start</p>
                <p className="font-mono">{(selectedEvent.time / 1000).toFixed(3)}s</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase mb-1">Topic</p>
                <p className="font-mono truncate">{selectedEvent.details?.topic || 'N/A'}</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentTime(selectedEvent.time)}
              className="mt-3 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-sm font-semibold transition-colors"
            >
              Jump to Event
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-lg p-4 backdrop-blur">
          <p className="text-sm font-semibold mb-3">Event Types</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {['init', 'ui', 'data', 'render', 'interaction', 'blocked', 'create', 'movement'].map(type => (
              <div key={type} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: getEventColor(type) }}
                />
                <span className="capitalize text-slate-300">{type}</span>
              </div>
            ))}
          </div>
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
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.5);
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid #0ea5e9;
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </div>
  );
}
