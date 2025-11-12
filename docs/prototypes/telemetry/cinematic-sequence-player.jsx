import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Volume2, VolumeX, Maximize2 } from 'lucide-react';

export default function CinematicSequencePlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [events, setEvents] = useState([]);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAudio, setShowAudio] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const canvasRef = useRef(null);
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

  // Audio cue on event activation
  useEffect(() => {
    if (!showAudio || !isPlaying) return;
    
    const activeEvents = events.filter(e => 
      currentTime >= e.time && currentTime < e.time + 10
    );
    
    if (activeEvents.length > 0) {
      // Play a subtle beep for event start
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
    }
  }, [currentTime, events, showAudio, isPlaying]);

  // Get event appearance
  const getEventColor = (type) => {
    const colors = {
      'init': '#6366f1',
      'ui': '#f59e0b',
      'data': '#8b5cf6',
      'render': '#10b981',
      'interaction': '#3b82f6',
      'create': '#06b6d4',
      'blocked': '#ef4444',
    };
    return colors[type] || '#64748b';
  };

  // Get events active at current time
  const activeEvents = useMemo(() => {
    return events.filter(e => currentTime >= e.time && currentTime <= e.endTime);
  }, [events, currentTime]);

  // Calculate event progress (0-1)
  const getEventProgress = (event) => {
    if (currentTime < event.time) return 0;
    if (currentTime > event.endTime) return 1;
    return (currentTime - event.time) / event.duration;
  };

  // Smooth easing function for animations
  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

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
            <h1 className="text-4xl font-bold mb-2">Cinematic Sequence Player</h1>
            <p className="text-slate-400">
              {events.length} events • {activeEvents.length} active • {(currentTime / 1000).toFixed(2)}s / {(totalDuration / 1000).toFixed(2)}s
            </p>
          </div>
        )}

        {/* Compact Controls */}
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

          {/* Speed Control */}
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

          {/* Audio Toggle */}
          <button
            onClick={() => setShowAudio(!showAudio)}
            className={`p-2 rounded transition-colors ${
              showAudio ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-700/50'
            }`}
            title={showAudio ? 'Audio on' : 'Audio off'}
          >
            {showAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors ml-auto"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Time Display */}
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

        {/* Main Timeline Visualization */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur mb-6 overflow-x-auto">
          <svg
            width={containerWidth * zoom}
            height={400}
            style={{ minWidth: containerWidth }}
            className="relative"
          >
            {/* Background grid */}
            <defs>
              <pattern id="cinematic-grid" width="200" height="400" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="400" stroke="#334155" strokeWidth="0.5" opacity="0.1" />
              </pattern>
              
              {/* Gradient definitions for event bars */}
              {['init', 'ui', 'data', 'interaction', 'blocked', 'create'].map(type => (
                <linearGradient key={`grad-${type}`} id={`gradient-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={getEventColor(type)} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={getEventColor(type)} stopOpacity="0.4" />
                </linearGradient>
              ))}
            </defs>

            <rect width={containerWidth * zoom} height={400} fill="url(#cinematic-grid)" />

            {/* Time Markers */}
            {[0, 5, 10, 15, 20, 25].map(t => {
              const x = 40 + t * 1000 * pixelsPerMs * zoom;
              if (x > containerWidth * zoom) return null;
              return (
                <g key={`marker-${t}`}>
                  <line x1={x} y1="0" x2={x} y2="380" stroke="#334155" strokeWidth="1" strokeDasharray="2,4" opacity="0.2" />
                  <text x={x} y="395" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="bold">
                    {t}s
                  </text>
                </g>
              );
            })}

            {/* Event Bars - Multiple Layers */}
            {events.map((event, idx) => {
              const x = 40 + event.time * pixelsPerMs * zoom;
              const width = Math.max(event.duration * pixelsPerMs * zoom, 3);
              const y = 40 + (idx % 6) * 55;
              const isActive = currentTime >= event.time && currentTime <= event.endTime;
              const progress = getEventProgress(event);
              const eased = easeInOutCubic(progress);

              return (
                <g key={event.id} onClick={() => setSelectedEvent(event)}>
                  {/* Event Shadow */}
                  {isActive && (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height="40"
                      fill={getEventColor(event.type)}
                      opacity={0.2}
                      rx="4"
                      style={{
                        filter: 'blur(8px)',
                      }}
                    />
                  )}

                  {/* Main Event Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height="40"
                    fill={`url(#gradient-${event.type})`}
                    opacity={isActive ? 1 : 0.6}
                    rx="4"
                    style={{
                      filter: isActive ? `drop-shadow(0 0 12px ${getEventColor(event.type)})` : 'drop-shadow(0 0 2px rgba(0,0,0,0.5))',
                      cursor: 'pointer',
                      transition: 'opacity 0.1s ease-out',
                    }}
                  />

                  {/* Progress Indicator for Active Events */}
                  {isActive && (
                    <rect
                      x={x}
                      y={y}
                      width={width * eased}
                      height="40"
                      fill={getEventColor(event.type)}
                      opacity="0.3"
                      rx="4"
                      style={{
                        pointerEvents: 'none',
                      }}
                    />
                  )}

                  {/* Event Label */}
                  {width > 50 && (
                    <text
                      x={x + width / 2}
                      y={y + 25}
                      textAnchor="middle"
                      fontSize="11"
                      fill="white"
                      fontWeight="bold"
                      pointerEvents="none"
                      style={{
                        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                        opacity: isActive ? 1 : 0.8,
                      }}
                    >
                      {event.name.split(' ')[0]}
                    </text>
                  )}

                  {/* Duration Display on Hover */}
                  {hoveredEvent === event.id && (
                    <g>
                      <rect
                        x={Math.max(5, x - 40)}
                        y={y - 25}
                        width="80"
                        height="22"
                        fill="#1e293b"
                        stroke="#475569"
                        rx="3"
                        opacity="0.95"
                      />
                      <text
                        x={Math.max(45, x)}
                        y={y - 8}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#e2e8f0"
                        fontWeight="bold"
                      >
                        {event.duration}ms
                      </text>
                    </g>
                  )}

                  {/* Selection Border */}
                  {selectedEvent?.id === event.id && (
                    <rect
                      x={x - 2}
                      y={y - 2}
                      width={width + 4}
                      height="44"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      rx="4"
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
              y2="380"
              stroke="#06b6d4"
              strokeWidth="3"
              opacity="0.9"
              style={{ pointerEvents: 'none' }}
            />

            {/* Playhead Tip */}
            <circle
              cx={40 + currentTime * pixelsPerMs * zoom}
              cy="15"
              r="5"
              fill="#06b6d4"
              style={{ pointerEvents: 'none' }}
            />
          </svg>
        </div>

        {/* Active Events Display */}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-400 uppercase mb-1">Type</p>
                <p className="font-mono text-sm capitalize">{selectedEvent.type}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase mb-1">Duration</p>
                <p className="font-mono text-sm">{selectedEvent.duration}ms</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase mb-1">Start Time</p>
                <p className="font-mono text-sm">{(selectedEvent.time / 1000).toFixed(3)}s</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase mb-1">Topic</p>
                <p className="font-mono text-sm truncate">{selectedEvent.details?.topic || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
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
