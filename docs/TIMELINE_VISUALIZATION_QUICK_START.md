# Timeline Visualization - Quick Start Guide

## Installation & Import

```typescript
import { TimelineFlowVisualization, TelemetryPage } from '@ui/telemetry';
import { analyzerToTimelineData } from '@ui/telemetry';
```

## Usage Examples

### 1. Quick Start with Sample Data

```tsx
import { TelemetryPage } from '@ui/telemetry';

export function App() {
  return <TelemetryPage useSampleData={true} />;
}
```

### 2. Load from File Upload

```tsx
import { TelemetryPage } from '@ui/telemetry';

export function AnalysisPage() {
  return <TelemetryPage />;
}
```

The user can upload analyzer JSON files directly via drag-and-drop or file picker.

### 3. Use with Real Analyzer Output

```tsx
import { TimelineFlowVisualization, analyzerToTimelineData } from '@ui/telemetry';

export async function SessionAnalysis() {
  // Fetch or load analyzer JSON
  const analyzerData = await fetch('/outputs/log-analysis.json').then(r => r.json());
  
  // Convert to timeline format
  const timelineData = analyzerToTimelineData(analyzerData);
  
  // Render visualization
  return (
    <TimelineFlowVisualization
      data={timelineData}
      title="Session Performance Analysis"
      subtitle="Click events to see details"
      onEventClick={(event) => console.log('Clicked:', event.name)}
    />
  );
}
```

### 4. Integrate into Diagnostics Panel

Add to `src/ui/diagnostics/DiagnosticsPanel.tsx`:

```tsx
import { TelemetryPage } from '../telemetry';

// In selectedNodeType union:
type = 'overview' | 'plugins' | 'topics' | 'telemetry'

// In tab rendering:
{selectedNodeType === 'telemetry' && (
  <TelemetryPage analyzerData={conductorIntrospection} />
)}

// In toolbar tabs:
<button onClick={() => setSelectedNodeType('telemetry')}>
  📊 Telemetry
</button>
```

## Component API

### TimelineFlowVisualization

```typescript
interface TimelineFlowVisualizationProps {
  // Required: Timeline data to visualize
  data: TimelineData;
  
  // Optional: Callback when event is clicked
  onEventClick?: (event: TimelineEvent) => void;
  
  // Optional: Display title (default: "RenderX Session Timeline")
  title?: string;
  
  // Optional: Display subtitle
  subtitle?: string;
}

interface TimelineData {
  events: TimelineEvent[];
  totalDuration: number;
  sessionStart?: string;
  sessionEnd?: string;
}

interface TimelineEvent {
  time: number;
  duration: number;
  name: string;
  type: 'init' | 'ui' | 'data' | 'render' | 'interaction' | 'create' | 'gap' | 'blocked' | 'plugin' | 'sequence' | 'topic';
  color: string;
  details?: Record<string, any>;
}
```

### TelemetryPage

```typescript
interface TelemetryPageProps {
  // Optional: Pre-loaded analyzer data
  analyzerData?: AnalyzerOutput;
  
  // Optional: Use sample data for demo (default: false)
  useSampleData?: boolean;
}
```

### Data Adapter Functions

```typescript
// Convert analyzer JSON to timeline format
analyzerToTimelineData(analyzerData: AnalyzerOutput): TimelineData

// Load JSON file asynchronously
loadAnalyzerFile(file: File): Promise<TimelineData>

// Create sample/demo timeline data
createSampleTimelineData(): TimelineData
```

## Features

### Waterfall Timeline
- Chronological event visualization
- Color-coded by event type
- Hover for full event details
- Click for custom handling
- Current time indicator during playback

### Execution Heatmap
- 500ms bucket aggregation
- Color intensity (blue → red)
- Shows execution concentration
- Identifies bottleneck periods

### Event Details List
- 2-column grid layout
- Scrollable with hover effects
- Filterable by type
- Shows timestamp, duration, metadata
- Click to trigger onEventClick callback

### Statistics & Insights
- Total events count
- Gap count and total gap time
- Active efficiency percentage
- Automated anomaly detection
- Performance recommendations

### Controls
- **Play/Pause**: Animate timeline playback
- **Reset**: Return to start
- **Timeline Scrubber**: Jump to specific time
- **Zoom**: 0.5x - 2.0x magnification
- **Export CSV**: Download data for analysis

## Performance Gaps Explained

The visualization identifies two types of gaps:

### Normal Gaps (Red)
- Time periods with no logged events
- Can be user idle time or legitimate delays
- Duration: 1s - 5s

### React Blocking (Bright Red)
- Synchronous React rendering blocking main thread
- No async yield points during reconciliation
- Duration: > 5s
- **Root Cause**: React component updates prevent all logging

### Real Example
From slow-timing-between-timestamps.log:
- **9.77-second gap** at 21:56:25-21:56:35 = React rendering canvas component
- **2.84-second gap** = React updating library after drag-drop
- **2.38-second gap** = React reconciling theme toggle

## Tips & Tricks

### 1. Identify Performance Bottlenecks
Look for red/bright-red areas in the heatmap or large gaps in the waterfall.

### 2. Analyze Event Sequences
Use the waterfall tab to see exact timing and order of operations.

### 3. Export for Reports
Click "Export CSV" to download timeline data for presentations or reports.

### 4. Real-Time Playback
Use Play/Pause to watch events unfold in slow motion, revealing hidden sequences.

### 5. Zoom for Details
When gaps appear small, zoom in 2x to see fine-grained timing differences.

## Troubleshooting

### No Events Showing
- Check analyzer JSON has `performance.gaps` array
- Verify `pluginMounts.byPlugin` contains data
- Try `useSampleData={true}` first

### All Events Appear as Gaps
- This is correct if analyzer found no plugins/sequences
- Use sample data to verify visualization is working

### Performance is Slow
- This is normal with 100+ events (Vite build should help)
- Try zooming to specific time range
- Consider exporting and analyzing offline

## Testing

Run the adapter validation:
```bash
node scripts/test-timeline-adapter.js
```

Expected output shows event count, type distribution, and gap analysis.

## Next Steps

1. **Add to Diagnostics**: Integrate TelemetryPage as new tab
2. **Route Page**: Create dedicated `/telemetry` route
3. **Async Loading**: Load analyzer output in background
4. **Comparison Mode**: View two sessions side-by-side
5. **Alerting**: Highlight sessions exceeding thresholds

---

For detailed technical information, see: `docs/TIMELINE_VISUALIZATION_IMPLEMENTATION.md`
