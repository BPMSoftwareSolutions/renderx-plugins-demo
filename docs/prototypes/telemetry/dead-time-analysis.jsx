import React, { useState } from 'react';
import { AlertTriangle, Clock, Zap, TrendingDown, Code2, AlertCircle } from 'lucide-react';

export default function DeadTimeAnalysis() {
  const [expandedSection, setExpandedSection] = useState('overview');

  const findings = {
    dropDelay: {
      title: "Library Component Drop → Canvas Create",
      duration: "2.383 seconds",
      timeline: [
        { time: "0ms", event: "Drop handler fires", color: "blue" },
        { time: "14ms", event: "Drop handler completes", color: "green" },
        { time: "2383ms", event: "❌ DEAD TIME - Nothing logged", color: "red" },
        { time: "2383ms", event: "Canvas Create finally starts", color: "blue" },
      ],
      issues: [
        {
          title: "React Rendering & Reconciliation",
          evidence: "Stack trace shows heavy React render cycles occurring between 38.066Z and 40.449Z",
          components: [
            "App.tsx rendering",
            "LayoutEngine component reconciliation",
            "SlotContainer updates",
            "Multiple render passes detected"
          ],
          impact: "The main thread is blocked by synchronous React re-renders",
        },
        {
          title: "Event Handler Execution",
          evidence: "DataBaton shows 'publishCreateRequested' handler not invoked until 42.861Z (4.8 seconds later)",
          details: "The drop event has multiple callbacks (8 rehydrated) but the create signal is delayed",
          impact: "Async operations or event queuing delays are preventing the create sequence from triggering",
        },
        {
          title: "Missing Telemetry Spans",
          evidence: "2.3 second gap with no log output between Drop completion and Canvas Create start",
          details: "This gap suggests background processing that's not instrumented with beats/movements",
          impact: "You can't see what's actually happening - likely blocking operations on the main thread",
        },
      ],
    },
    themeToggleDelay: {
      title: "Header Theme Toggle Delay",
      duration: "Similar pattern observed",
      issue: "You mentioned theme toggle also had the same delay pattern",
      evidence: {
        toggleStart: "2025-11-10T21:56:42.891Z",
        toggleEnd: "2025-11-10T21:56:42.901Z",
        toggleDuration: "10ms",
      },
      note: "The toggle itself is fast (10ms), but if there's a cascade effect that also creates components, it would hit the same React rendering bottleneck",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <h1 className="text-4xl font-bold">Dead Time Analysis</h1>
          </div>
          <p className="text-slate-400">What's actually happening during the 2+ second delays</p>
        </div>

        {/* Key Finding */}
        <div className="bg-red-900/20 border-2 border-red-500/50 rounded-lg p-6 mb-8 backdrop-blur">
          <div className="flex gap-3 mb-3">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-red-300 mb-2">Root Cause Found</h2>
              <p className="text-red-100 mb-3">
                Your system is experiencing <strong>synchronous React rendering blocking</strong> on the main thread. When the drop handler completes, React begins a heavy re-render cycle that locks the main thread for ~2.3 seconds before the next operation can proceed.
              </p>
              <p className="text-red-200 text-sm">
                This is a classic React reconciliation + DOM manipulation performance issue occurring without instrumentation.
              </p>
            </div>
          </div>
        </div>

        {/* Drop Delay Details */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6 backdrop-blur">
          <button
            onClick={() => setExpandedSection(expandedSection === 'drop' ? 'overview' : 'drop')}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-red-400" />
                <div>
                  <h3 className="text-lg font-semibold">Drop Handler to Canvas Creation</h3>
                  <p className="text-sm text-slate-400">38.066Z → 40.449Z</p>
                </div>
              </div>
              <div className="bg-red-500/20 text-red-300 px-3 py-1 rounded font-mono text-sm">
                2.383s dead time
              </div>
            </div>
          </button>

          {expandedSection === 'drop' && (
            <div className="mt-6 space-y-6 border-t border-slate-700 pt-6">
              {/* Timeline Visualization */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-300">Timeline</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-20 font-mono text-xs text-slate-400">0ms</div>
                    <div className="flex-1">
                      <div className="bg-blue-600/30 rounded px-3 py-2 border border-blue-500/50">
                        <p className="font-mono text-sm">Drop event fires</p>
                        <p className="text-xs text-slate-400 mt-1">2025-11-10T21:56:38.054Z</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-20 font-mono text-xs text-slate-400">+14ms</div>
                    <div className="flex-1">
                      <div className="bg-green-600/30 rounded px-3 py-2 border border-green-500/50">
                        <p className="font-mono text-sm">Drop handler finishes</p>
                        <p className="text-xs text-slate-400 mt-1">2025-11-10T21:56:38.066Z</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-20 font-mono text-xs text-slate-400">+14-2397ms</div>
                    <div className="flex-1">
                      <div className="bg-red-600/30 rounded px-3 py-2 border border-red-500/50">
                        <p className="font-mono text-sm">❌ NO LOGS - BLOCKING OPERATION</p>
                        <p className="text-xs text-slate-400 mt-1">2025-11-10T21:56:38.066Z → 21:56:40.449Z</p>
                        <p className="text-xs text-red-200 mt-2">React rendering, DOM manipulation, layout recalc</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-20 font-mono text-xs text-slate-400">+2383ms</div>
                    <div className="flex-1">
                      <div className="bg-blue-600/30 rounded px-3 py-2 border border-blue-500/50">
                        <p className="font-mono text-sm">Canvas Create starts</p>
                        <p className="text-xs text-slate-400 mt-1">2025-11-10T21:56:40.449Z</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evidence */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-300">Evidence from Logs</h4>

                <div className="bg-slate-900/50 rounded p-4 border border-slate-600">
                  <p className="text-xs font-mono text-slate-400 mb-2">Drop Handler Completes:</p>
                  <p className="font-mono text-xs text-slate-300">
                    2025-11-10T21:56:38.066Z ✅ SequenceExecutor: Sequence "Library Component Drop" completed in 14ms
                  </p>
                </div>

                <div className="bg-slate-900/50 rounded p-4 border border-slate-600">
                  <p className="text-xs font-mono text-slate-400 mb-2">React Stack During Gap (from console):</p>
                  <pre className="font-mono text-xs text-slate-300 overflow-auto max-h-40">
{`<App>
  <LayoutEngine>
    <SlotContainer>
performUnitOfWork @ react-dom_client.js
workLoopSync @ react-dom_client.js
renderRootSync @ react-dom_client.js`}
                  </pre>
                  <p className="text-xs text-slate-400 mt-2">
                    Heavy React reconciliation on main thread during this gap
                  </p>
                </div>

                <div className="bg-slate-900/50 rounded p-4 border border-slate-600">
                  <p className="text-xs font-mono text-slate-400 mb-2">Canvas Create Finally Starts:</p>
                  <p className="font-mono text-xs text-slate-300">
                    2025-11-10T21:56:40.449Z 🎼 PluginInterfaceFacade.play(): CanvasComponentPlugin → canvas-component-create-symphony
                  </p>
                </div>
              </div>

              {/* Root Causes */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-300">Why This Happens</h4>

                <div className="space-y-3">
                  <div className="bg-amber-900/20 rounded p-4 border border-amber-600/30">
                    <div className="flex gap-2 mb-2">
                      <Code2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <h5 className="font-semibold text-amber-300">1. Synchronous React Rendering</h5>
                    </div>
                    <p className="text-sm text-amber-100 ml-6">
                      After drop completes, React state updates cascade through App → LayoutEngine → SlotContainer. These render synchronously via <code className="bg-black/50 px-2 py-1 rounded text-xs">renderRootSync</code>, blocking the event loop.
                    </p>
                  </div>

                  <div className="bg-amber-900/20 rounded p-4 border border-amber-600/30">
                    <div className="flex gap-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <h5 className="font-semibold text-amber-300">2. No Instrumentation of Render Phase</h5>
                    </div>
                    <p className="text-sm text-amber-100 ml-6">
                      Your telemetry has no beats/movements tracking React re-renders. The 2.3 second gap is invisible to your system because it's not instrumented with performance markers.
                    </p>
                  </div>

                  <div className="bg-amber-900/20 rounded p-4 border border-amber-600/30">
                    <div className="flex gap-2 mb-2">
                      <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <h5 className="font-semibold text-amber-300">3. Event Queue Starvation</h5>
                    </div>
                    <p className="text-sm text-amber-100 ml-6">
                      While React renders, other scheduled operations (like triggering canvas:component:create) wait in the event queue. They can't execute until the render completes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6 backdrop-blur">
          <button
            onClick={() => setExpandedSection(expandedSection === 'theme' ? 'overview' : 'theme')}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <div>
                  <h3 className="text-lg font-semibold">Theme Toggle Pattern</h3>
                  <p className="text-sm text-slate-400">42.891Z → 42.901Z</p>
                </div>
              </div>
              <div className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded font-mono text-sm">
                10ms (but cascades)
              </div>
            </div>
          </button>

          {expandedSection === 'theme' && (
            <div className="mt-6 space-y-4 border-t border-slate-700 pt-6">
              <p className="text-slate-300">
                The theme toggle itself is fast (10ms), but if it triggers a component re-render that also creates canvas elements, it hits the same React rendering bottleneck you see with the drop operation.
              </p>
              <div className="bg-slate-900/50 rounded p-4 border border-slate-600">
                <p className="text-xs font-mono text-slate-400 mb-3">Log Output:</p>
                <pre className="font-mono text-xs text-slate-300 overflow-auto">
{`2025-11-10T21:56:42.891Z Theme Toggle starts
2025-11-10T21:56:42.901Z ✅ SequenceExecutor: Sequence "Header UI Theme Toggle" completed in 10ms
              
Theme switches instantly, but any downstream UI updates
hit the same rendering wall as the drop operation.`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6 mb-6 backdrop-blur">
          <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            How to Fix This
          </h3>

          <div className="space-y-4">
            <div className="bg-blue-950/50 rounded p-4 border border-blue-700/30">
              <h4 className="font-semibold text-blue-200 mb-2">1. Instrument React Rendering</h4>
              <p className="text-blue-100 text-sm mb-3">
                Add telemetry markers inside React component renders to track where time is actually spent.
              </p>
              <pre className="bg-black/50 rounded p-3 font-mono text-xs text-slate-300 overflow-auto">
{`// In your App/LayoutEngine components
useEffect(() => {
  const startRender = performance.now();
  return () => {
    const duration = performance.now() - startRender;
    if (duration > 50) {
      console.warn(\`⚠️ Slow render: \${duration}ms\`);
      // Emit a beat/movement marker
      eventBus.emit('ui:render:slow', { duration });
    }
  };
});`}
              </pre>
            </div>

            <div className="bg-blue-950/50 rounded p-4 border border-blue-700/30">
              <h4 className="font-semibold text-blue-200 mb-2">2. Use React Concurrent Features</h4>
              <p className="text-blue-100 text-sm mb-3">
                Switch from synchronous render to useDeferredValue or startTransition to keep UI responsive.
              </p>
              <pre className="bg-black/50 rounded p-3 font-mono text-xs text-slate-300 overflow-auto">
{`// Defer expensive state updates
const deferredDropData = useDeferredValue(dropData);

// Or use startTransition
startTransition(() => {
  setCanvasComponent(newComponent);
});`}
              </pre>
            </div>

            <div className="bg-blue-950/50 rounded p-4 border border-blue-700/30">
              <h4 className="font-semibold text-blue-200 mb-2">3. Break Up Long Renders into Beats</h4>
              <p className="text-blue-100 text-sm mb-3">
                Instead of one massive React update, split it into multiple symphony beats:
              </p>
              <pre className="bg-black/50 rounded p-3 font-mono text-xs text-slate-300 overflow-auto">
{`"movements": [
  {
    "name": "Resolve Template",
    "beats": [
      { "event": "canvas:component:resolve-template" }
    ]
  },
  {
    "name": "React Render Pass 1",
    "beats": [
      { "event": "ui:render:layout-pass" }
    ]
  },
  {
    "name": "React Render Pass 2",  
    "beats": [
      { "event": "ui:render:reconciliation" }
    ]
  }
]`}
              </pre>
            </div>

            <div className="bg-blue-950/50 rounded p-4 border border-blue-700/30">
              <h4 className="font-semibold text-blue-200 mb-2">4. Profile with React DevTools Profiler</h4>
              <p className="text-blue-100 text-sm">
                Use the React DevTools Profiler to identify exactly which components are taking the 2.3 seconds. Look for components with:
              </p>
              <ul className="text-blue-100 text-sm list-disc list-inside mt-2 space-y-1">
                <li>Rendering without memoization</li>
                <li>Expensive computations in render body</li>
                <li>Large component trees being recreated</li>
              </ul>
            </div>

            <div className="bg-blue-950/50 rounded p-4 border border-blue-700/30">
              <h4 className="font-semibold text-blue-200 mb-2">5. Verify LibraryComponentPlugin Reliability</h4>
              <p className="text-blue-100 text-sm">
                You have a 50% failure rate on LibraryComponentPlugin mounts. This could be compounding the rendering issue by triggering error recovery rendering cycles.
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Summary</h3>
          <div className="space-y-2 text-slate-300">
            <p>
              <strong>What's happening:</strong> After drop completes, React enters a heavy rendering phase that blocks the main thread for 2.3 seconds. During this time, no telemetry events are logged because the system is completely blocked.
            </p>
            <p>
              <strong>Why it's invisible:</strong> Your beats/movements only track the orchestration, not the React reconciliation layer below. You need instrumentation at the React level.
            </p>
            <p>
              <strong>How to fix it:</strong> Instrument React renders, use concurrent features, break up large updates into smaller beats, and identify the specific components causing the slowdown.
            </p>
            <p>
              <strong>Same pattern on theme toggle:</strong> The toggle itself is fast, but if it cascades into component re-renders, it hits the same rendering bottleneck.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
