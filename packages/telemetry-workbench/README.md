# Telemetry Workbench

Standalone telemetry analysis UI extracted from the main application. Provides:

## Features

- Timeline view with compact layering, heatmap, and event list (pins supported for sequence beats)
- Interaction Flow tab: aligns interactions, renders, and blocking gaps on a unified scale
- Sequence Beats tab: visualizes sequence spans and per-beat markers
- Filtering strategies & smart presets (category, search, performance, time window)
- Raw log or analyzer JSON upload (auto-detect)
- CSV export (includes absolute timestamps when available and beat counts)
- Diagnostics JSON export snapshot
- Stats summary (events, gaps, gap time, longest gap, active time)

## Usage

1. Upload a console log (`.log` / `.txt`) or analyzer JSON via the toolbar.
2. Apply presets or custom filter strategies to refine events.
3. Switch tabs (timeline / interactions / beats) to analyze different aspects.
4. Export CSV or diagnostics JSON from the toolbar buttons.

## Data Model

`TimelineEvent` includes:

```
{
	time: number; // ms offset from session start
	duration: number; // ms
	name: string;
	type: 'init' | 'ui' | 'data' | 'render' | 'interaction' | 'create' | 'gap' | 'blocked' | 'plugin' | 'sequence' | 'topic';
	color?: string;
	sourceTimestamp?: number; // epoch ms absolute timestamp if known
	pins?: Array<{ offset: number; label?: string; type?: string; color?: string; sourceTimestamp?: number }>;
}
```

Pins represent beat markers within sequence spans.

## Interaction Flow View

Focuses on how user interactions trigger renders and where gaps/blocking occur. Bars are normalized horizontally by session duration.

## Sequence Beats View

Shows each sequence's span and beat markers (triangles) with labels. Useful for orchestration timing analysis.

## Filtering Strategies

- All: no filtering
- Category: restrict by event types (plugins, sequences, topics, gaps, etc.)
- Search: substring or regex match on event name
- Time Window: isolate events within a ms range (e.g. `0-5000`)
- Performance: find long-running operations by duration thresholds

Smart presets apply common investigative filters (critical path, plugin health, etc.).

## Export Parity

CSV includes: time_ms, duration_ms, name, type, abs_start, abs_end, pins_count. Absolute times use `sourceTimestamp` when present, otherwise derive from `sessionStart + time`.

## Development

The workbench uses React + TypeScript + Vite. Build:

```powershell
npm run build
```

Run dev (root workspace):

```powershell
npm run dev
```

## Next Steps / Ideas

- Add playhead synchronization between tabs
- Enhanced beat labeling (phase names)
- Performance overlay on Interaction Flow

## License

See root project LICENSE.

# Telemetry Workbench (@renderx-plugins/telemetry-workbench)

Standalone playground for telemetry timeline & beat pin exploration without coupling to the main host application.

## Features
- Upload analyzer JSON → renders timeline with sequence events & gap blocks
- Upload raw log file → builds timestamp frames and derives provisional events
- Beat pins (per sequence timestamp) rendered as small triangular markers
- Hover tooltips show duration + beat count
- Simple zoom & playback controls

## Dev
```powershell
npm run telemetry:dev
```
(or navigate into the package and run `npm run dev`).

## Data Model
- `TimelineEvent` includes optional `pins[]` for beat annotations
- Frames builder groups raw log lines by ISO timestamp (primary key)

## Roadmap
- Rich classification of frame events (movement, beat started/completed, DataBaton states)
- Pin legend & filtering
- Absolute vs relative time axis toggle
- Export of enriched diagnostics with beats materialized

## Integration
Later this package can be mounted inside the main diagnostics panel or used in CI to validate sequencing.
