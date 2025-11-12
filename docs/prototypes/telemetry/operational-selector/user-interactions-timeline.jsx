import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, GitBranch, Zap, Clock, AlertCircle } from 'lucide-react';

export default function UserInteractionsTimeline() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedInteraction, setSelectedInteraction] = useState(null);
  const [highlightedBeat, setHighlightedBeat] = useState(null);

  // Real user interaction data - drag/drop sequence
  const userInteractions = [
    {
      id: 'drag-start',
      name: 'Drag Start',
      type: 'interaction',
      startTime: 16224,
      duration: 10,
      description: 'User clicks & holds library component',
      icon: '👆',
      beats: [
        { time: 16224, name: 'mousedown', type: 'ui-event' },
        { time: 16226, name: 'dragstart', type: 'ui-event' },
      ],
      details: {
        component: 'LibraryComponent',
        action: 'Initial grab',
        coordinates: '{ x: 245, y: 128 }',
      }
    },
    {
      id: 'drag-hold',
      name: 'User Holding',
      type: 'idle',
      startTime: 16234,
      duration: 2843,
      description: 'User positioning component over canvas',
      icon: '⏸',
      beats: [
        { time: 16234, name: 'dragover', type: 'ui-event', count: 5 },
      ],
      details: {
        component: 'LibraryComponent',
        action: 'Drag over canvas',
        coordinates: '{ x: 312, y: 287 }',
      }
    },
    {
      id: 'drop-event',
      name: 'Drop Handler',
      type: 'interaction',
      startTime: 19077,
      duration: 14,
      description: 'User releases - sequence executes',
      icon: '🎯',
      beats: [
        { time: 19077, name: 'drop', type: 'ui-event' },
        { time: 19081, name: 'DropHandlerSequence', type: 'sequence-exec' },
        { time: 19091, name: 'sequence:complete', type: 'sequence-end' },
      ],
      details: {
        component: 'Canvas',
        action: 'Drop accepted',
        coordinates: '{ x: 312, y: 287 }',
      },
      orchestration: {
        sequenceId: '-979e3g',
        sequenceName: 'library-component-drag-symphony',
        queue: 'ExecutionQueue',
        priority: 'NORMAL',
        status: 'COMPLETED',
      }
    },
    {
      id: 'react-block',
      name: 'React Rendering',
      type: 'blocked',
      startTime: 19091,
      duration: 2383,
      description: '⚠️ Main thread blocked - reconciliation',
      icon: '⚡',
      beats: [
        { time: 19091, name: 'renderRootSync', type: 'react-phase', phase: 'render' },
        { time: 19500, name: 'reconciliation', type: 'react-phase', phase: 'reconcile' },
        { time: 20200, name: 'commitRoot', type: 'react-phase', phase: 'commit' },
        { time: 21474, name: 'renderComplete', type: 'react-phase', phase: 'end' },
      ],
      details: {
        component: 'App > LayoutEngine > SlotContainer',
        action: 'Synchronous render cycle',
        mainThread: 'BLOCKED',
        userResponsiveness: 'FROZEN',
      },
      critical: true,
    },
    {
      id: 'canvas-create',
      name: 'Canvas Create',
      type: 'create',
      startTime: 21474,
      duration: 58,
      description: 'Canvas component finally executes',
      icon: '✅',
      beats: [
        { time: 21474, name: 'CanvasComponentPlugin.play()', type: 'sequence-exec' },
        { time: 21520, name: 'canvas:component:create-symphony', type: 'sequence-exec' },
        { time: 21532, name: 'canvasComponentCreated', type: 'sequence-end' },
      ],
      details: {
        component: 'CanvasComponentPlugin',
        action: 'Component mounting',
        result: 'Button appears on screen',
      },
      userWaitTime: '5.3 seconds from drop',
    }
  ];

  const totalDuration = 28353;
  const containerWidth = 1400;
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

  // Get interaction color based on type
  const getInteractionColor = (type) => {
    const colors = {
      'interaction': '#3b82f6',
      'idle': '#94a3b8',
      'blocked': '#ef4444',
      'create': '#06b6d4',
    };
    return colors[type] || '#64748b';
  };

  // Get beat color
  const getBeatColor = (beatType) => {
    const colors = {
      'ui-event': '#f59e0b',
      'sequence-exec': '#06b6d4',
      'sequence-end': '#10b981',
      'react-phase': '#ef4444',
    };
    return colors[beatType] || '#94a3b8';
  };

  // Check if interaction is active
  const isInteractionActive = (interaction) => {
    return currentTime >= interaction.startTime && currentTime <= interaction.startTime + interaction.duration;
  };

  // Get all beats for the timeline
  const allBeats = useMemo(() => {
    const beats = [];
    userInteractions.forEach(interaction => {
      if (interaction.beats) {
        interaction.beats.forEach(beat => {
          beats.push({
            ...beat,
            interactionId: interaction.id,
            startTime: interaction.startTime,
            endTime: interaction.startTime + interaction.duration,
          });
        });
      }
    });
    return beats;
  }, []);

  // Get active beats at current time
  const activeBeats = useMemo(() => {
    return allBeats.filter(beat => beat.time <= currentTime && beat.time + 50 > currentTime);
  }, [allBeats, currentTime]);

  const interactionHeight = 60;
  const beatTrackHeight = 80;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 p-8">
      <div className="max-w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">User Interactions Timeline</h1>
          <p className="text-slate-400">
            Real-time flow: User drag → Queue orchestration → React blocking → Component creation
          </p>
        </div>

        {/* Controls */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6 backdrop-blur flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded font-semibold transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button
            onClick={() => { setCurrentTime(16200); setIsPlaying(false); }}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
          >
            Jump to Drag
          </button>

          <button
            onClick={() => { setCurrentTime(19077); setIsPlaying(false); }}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
          >
            Jump to Drop
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2 bg-slate-700 hover:bg-slate-600 rounded">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm w-10 text-center">{(zoom * 100).toFixed(0)}%</span>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 bg-slate-700 hover:bg-slate-600 rounded">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="text-right">
            <p className="text-lg font-mono font-bold text-cyan-400">{(currentTime / 1000).toFixed(2)}s</p>
          </div>
        </div>

        {/* Timeline Scrubber */}
        <div className="mb-6">
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

        {/* Main Visualization */}
        <div className="space-y-6">
          {/* Layer 1: User Interactions */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">👤</span>
              User Interactions Flow
            </h2>

            <svg
              width={containerWidth * zoom}
              height={userInteractions.length * interactionHeight + 40}
              style={{ minWidth: containerWidth }}
              className="relative"
            >
              {/* Time markers */}
              {[16, 18, 20, 22, 24, 26].map(t => {
                const x = 40 + t * 1000 * pixelsPerMs * zoom;
                if (x > containerWidth * zoom) return null;
                return (
                  <g key={`marker-${t}`}>
                    <line x1={x} y1="0" x2={x} y2={userInteractions.length * interactionHeight} stroke="#334155" strokeWidth="1" strokeDasharray="2,4" opacity="0.3" />
                    <text x={x} y={userInteractions.length * interactionHeight + 20} textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="bold">
                      {t}s
                    </text>
                  </g>
                );
              })}

              {/* Interactions */}
              {userInteractions.map((interaction, idx) => {
                const x = 40 + interaction.startTime * pixelsPerMs * zoom;
                const width = Math.max(interaction.duration * pixelsPerMs * zoom, 3);
                const y = 20 + idx * interactionHeight;
                const isActive = isInteractionActive(interaction);

                return (
                  <g key={interaction.id}>
                    {/* Background row */}
                    <rect
                      x={0}
                      y={y}
                      width={containerWidth * zoom}
                      height={interactionHeight - 4}
                      fill={isActive ? 'rgba(6, 182, 212, 0.05)' : 'transparent'}
                      rx="3"
                    />

                    {/* Main interaction bar */}
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={interactionHeight - 8}
                      fill={getInteractionColor(interaction.type)}
                      opacity={isActive ? 1 : 0.6}
                      rx="4"
                      style={{
                        filter: isActive ? `drop-shadow(0 0 12px ${getInteractionColor(interaction.type)})` : 'drop-shadow(0 0 2px rgba(0,0,0,0.5))',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedInteraction(isActive ? interaction : null)}
                    />

                    {/* Icon + Label */}
                    <g onClick={() => setSelectedInteraction(interaction)}>
                      <text
                        x={x + 8}
                        y={y + interactionHeight / 2 - 5}
                        fontSize="14"
                        pointerEvents="none"
                      >
                        {interaction.icon}
                      </text>
                      <text
                        x={x + 32}
                        y={y + interactionHeight / 2}
                        fontSize="12"
                        fontWeight="bold"
                        fill="white"
                        pointerEvents="none"
                      >
                        {interaction.name}
                      </text>
                      <text
                        x={x + 32}
                        y={y + interactionHeight / 2 + 14}
                        fontSize="9"
                        fill="#cbd5e1"
                        pointerEvents="none"
                      >
                        {interaction.duration}ms
                      </text>
                    </g>

                    {/* Critical warning */}
                    {interaction.critical && isActive && (
                      <g>
                        <rect
                          x={x + width - 24}
                          y={y + 4}
                          width="20"
                          height="20"
                          fill="#ef4444"
                          rx="2"
                        />
                        <text
                          x={x + width - 14}
                          y={y + 16}
                          fontSize="12"
                          textAnchor="middle"
                          fill="white"
                          fontWeight="bold"
                          pointerEvents="none"
                        >
                          ⚠
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Playhead */}
              <line
                x1={40 + currentTime * pixelsPerMs * zoom}
                y1="0"
                x2={40 + currentTime * pixelsPerMs * zoom}
                y2={userInteractions.length * interactionHeight}
                stroke="#06b6d4"
                strokeWidth="3"
                opacity="0.9"
                style={{ pointerEvents: 'none' }}
              />
            </svg>
          </div>

          {/* Layer 2: Sequence Orchestration Beats */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Sequence Orchestration Beats
            </h2>

            <svg
              width={containerWidth * zoom}
              height={beatTrackHeight + 40}
              style={{ minWidth: containerWidth }}
              className="relative"
            >
              {/* Background track */}
              <rect x={40} y={20} width={containerWidth * zoom - 80} height={beatTrackHeight} fill="#334155" opacity="0.1" rx="4" />

              {/* Time markers */}
              {[16, 18, 20, 22, 24, 26].map(t => {
                const x = 40 + t * 1000 * pixelsPerMs * zoom;
                if (x > containerWidth * zoom) return null;
                return (
                  <g key={`beat-marker-${t}`}>
                    <line x1={x} y1="15" x2={x} y2={beatTrackHeight + 25} stroke="#334155" strokeWidth="1" strokeDasharray="2,4" opacity="0.3" />
                  </g>
                );
              })}

              {/* Beat points */}
              {allBeats.map((beat, idx) => {
                const x = 40 + beat.time * pixelsPerMs * zoom;
                const isActive = currentTime >= beat.time && currentTime <= beat.time + 50;
                const beatY = 20 + (idx % 3) * 25;

                return (
                  <g
                    key={`beat-${idx}`}
                    onClick={() => setHighlightedBeat(isActive ? beat : null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Beat line */}
                    <line
                      x1={x}
                      y1={beatY}
                      x2={x}
                      y2={beatY + 15}
                      stroke={getBeatColor(beat.type)}
                      strokeWidth={isActive ? 3 : 2}
                      opacity={isActive ? 1 : 0.6}
                    />

                    {/* Beat dot */}
                    <circle
                      cx={x}
                      cy={beatY}
                      r={isActive ? 5 : 3}
                      fill={getBeatColor(beat.type)}
                      opacity={isActive ? 1 : 0.6}
                      style={{
                        filter: isActive ? `drop-shadow(0 0 6px ${getBeatColor(beat.type)})` : 'none',
                      }}
                    />

                    {/* Beat label on hover */}
                    {isActive && (
                      <g>
                        <rect
                          x={Math.max(50, x - 50)}
                          y={beatY - 30}
                          width="100"
                          height="24"
                          fill="#1e293b"
                          stroke={getBeatColor(beat.type)}
                          strokeWidth="1"
                          rx="2"
                        />
                        <text
                          x={Math.max(100, x)}
                          y={beatY - 12}
                          textAnchor="middle"
                          fontSize="9"
                          fill="#e2e8f0"
                          fontWeight="bold"
                        >
                          {beat.name}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Playhead for beats */}
              <line
                x1={40 + currentTime * pixelsPerMs * zoom}
                y1="15"
                x2={40 + currentTime * pixelsPerMs * zoom}
                y2={beatTrackHeight + 25}
                stroke="#06b6d4"
                strokeWidth="2"
                opacity="0.7"
                style={{ pointerEvents: 'none' }}
              />
            </svg>

            {/* Beat legend */}
            <div className="grid grid-cols-4 gap-4 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-slate-300">UI Events</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="text-slate-300">Seq Execute</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-slate-300">Seq Complete</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-slate-300">React Phase</span>
              </div>
            </div>
          </div>

          {/* Layer 3: Execution Queue State */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              Execution Queue State
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Pre-Drop */}
              <div className="bg-slate-700/30 rounded p-4 border border-slate-600">
                <p className="text-sm font-bold text-slate-300 mb-2">Before Drop (16.2-19.1s)</p>
                <div className="space-y-2 text-xs">
                  <div className="bg-slate-900/50 rounded p-2">
                    <p className="text-slate-400">Queue: EMPTY</p>
                    <p className="text-slate-500">Status: Waiting for user action</p>
                  </div>
                </div>
              </div>

              {/* Drop Moment */}
              <div className="bg-blue-900/30 rounded p-4 border border-blue-600/50">
                <p className="text-sm font-bold text-blue-300 mb-2">Drop Event (19.077s)</p>
                <div className="space-y-2 text-xs">
                  <div className="bg-slate-900/50 rounded p-2 border border-blue-500/30">
                    <p className="text-blue-200 font-mono">📋 Enqueued: library-component-drag-symphony</p>
                    <p className="text-slate-400">Priority: NORMAL</p>
                    <p className="text-slate-400">ID: -979e3g</p>
                  </div>
                  <div className="bg-slate-900/50 rounded p-2 border border-blue-500/30">
                    <p className="text-blue-200 font-mono">▶ Dequeued & executing</p>
                    <p className="text-slate-400">Drop handler runs: 14ms</p>
                  </div>
                </div>
              </div>

              {/* React Block */}
              <div className="bg-red-900/30 rounded p-4 border border-red-600/50">
                <p className="text-sm font-bold text-red-300 mb-2">React Blocking (19.1-21.5s)</p>
                <div className="space-y-2 text-xs">
                  <div className="bg-red-950/50 rounded p-2 border border-red-500/30">
                    <p className="text-red-200 font-mono">⚠️ Main thread BLOCKED</p>
                    <p className="text-red-300">renderRootSync executing</p>
                    <p className="text-red-400 font-bold">2,383ms dead time</p>
                  </div>
                  <div className="bg-red-950/50 rounded p-2">
                    <p className="text-red-200">Queue waiting for release</p>
                    <p className="text-slate-400">Pending: canvas-component-create</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Interaction Details */}
          {selectedInteraction && (
            <div className="bg-slate-800/50 border-2 border-cyan-600/50 rounded-lg p-6 backdrop-blur">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <span className="text-3xl">{selectedInteraction.icon}</span>
                    {selectedInteraction.name}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">{selectedInteraction.description}</p>
                </div>
                <button
                  onClick={() => setSelectedInteraction(null)}
                  className="text-slate-400 hover:text-slate-200 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-xs text-slate-400 uppercase mb-1">Type</p>
                  <p className="font-semibold text-sm capitalize">{selectedInteraction.type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase mb-1">Duration</p>
                  <p className="font-mono text-sm">{selectedInteraction.duration}ms</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase mb-1">Start Time</p>
                  <p className="font-mono text-sm">{(selectedInteraction.startTime / 1000).toFixed(3)}s</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase mb-1">Beats</p>
                  <p className="font-semibold text-sm">{selectedInteraction.beats?.length || 0} events</p>
                </div>
              </div>

              {/* Orchestration Details */}
              {selectedInteraction.orchestration && (
                <div className="bg-blue-900/20 border border-blue-600/30 rounded p-4 mb-4">
                  <h4 className="font-bold text-blue-300 mb-3 flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Orchestration Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-400">Sequence ID</p>
                      <p className="font-mono text-blue-200">{selectedInteraction.orchestration.sequenceId}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Sequence Name</p>
                      <p className="font-mono text-blue-200">{selectedInteraction.orchestration.sequenceName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Queue</p>
                      <p className="font-mono text-blue-200">{selectedInteraction.orchestration.queue}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Priority</p>
                      <p className="font-mono text-blue-200">{selectedInteraction.orchestration.priority}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400">Status</p>
                      <p className="font-mono text-green-300">{selectedInteraction.orchestration.status}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Beat sequence */}
              {selectedInteraction.beats && (
                <div className="bg-slate-700/30 rounded p-4 mb-4">
                  <h4 className="font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Beat Sequence
                  </h4>
                  <div className="space-y-2">
                    {selectedInteraction.beats.map((beat, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getBeatColor(beat.type) }}
                        />
                        <span className="font-mono text-slate-300">{beat.time - selectedInteraction.startTime}ms</span>
                        <span className="text-slate-400">→</span>
                        <span className="font-semibold text-slate-200">{beat.name}</span>
                        {beat.count && <span className="text-xs text-slate-400">×{beat.count}</span>}
                        <span className="text-xs text-slate-500 capitalize">({beat.type.replace('-', ' ')})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Component Details */}
              <div className="bg-slate-700/30 rounded p-4">
                <h4 className="font-bold text-slate-300 mb-3">Component Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedInteraction.details).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs text-slate-400 uppercase mb-1">{key}</p>
                      <p className="font-mono text-sm text-slate-200">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical warning */}
              {selectedInteraction.critical && (
                <div className="mt-4 bg-red-900/30 border border-red-600/50 rounded p-4">
                  <p className="flex items-center gap-2 text-red-200 font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    Critical Performance Issue
                  </p>
                  <p className="text-red-100 text-sm mt-2">
                    {selectedInteraction.userWaitTime && (
                      <>User waited <strong>{selectedInteraction.userWaitTime}</strong> before UI response.</>
                    )}
                    {selectedInteraction.details.userResponsiveness && (
                      <> Main thread was {selectedInteraction.details.userResponsiveness}.</>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Key Insights */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <p className="text-blue-300 font-bold mb-2">👤 User Interactions</p>
            <p className="text-sm text-blue-100">
              Captured: Drag start, hold positioning, drop event. Each generates UI events flowing through orchestration.
            </p>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
            <p className="text-yellow-300 font-bold mb-2">🎼 Sequence Beats</p>
            <p className="text-sm text-yellow-100">
              Drop triggers library-component-drag-symphony with 8 orchestrated beats tracked in ExecutionQueue.
            </p>
          </div>

          <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
            <p className="text-red-300 font-bold mb-2">⚠️ React Blocking</p>
            <p className="text-sm text-red-100">
              After drop (19.1s), React synchronously renders for 2.3s. User sees no response for 5.3s total.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500 border-t border-slate-700 pt-6">
          <p>Click any interaction to see orchestration flow | Beats show real sequence execution points</p>
        </div>
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid #0ea5e9;
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.5);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
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
