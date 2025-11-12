# Telemetry Filter Audit Report

Generated: 2025-11-11 23:59:44Z UTC  
Source: `telemetry-diagnostics-1762904455548-with-abs.json`


## Global Summary

- Total events: **338**
- Types: blocked, create, data, gap, interaction, render, sequence, ui
- Type counts: {'render': 12, 'data': 122, 'create': 104, 'ui': 14, 'sequence': 72, 'interaction': 6, 'gap': 7, 'blocked': 1}
- Total duration (sum of durations): 32,087 ms
- Gap time: 17,063 ms  |  Blocked time: 9,771 ms

## Strategy Checks

- all: count=338 typeCounts={'render': 12, 'data': 122, 'create': 104, 'ui': 14, 'sequence': 72, 'interaction': 6, 'gap': 7, 'blocked': 1}
- category: count=338 typeCounts={'render': 12, 'data': 122, 'create': 104, 'ui': 14, 'sequence': 72, 'interaction': 6, 'gap': 7, 'blocked': 1}
- search: count=7 typeCounts={'ui': 7}
- timewindow: count=332 typeCounts={'render': 12, 'data': 122, 'create': 104, 'ui': 14, 'sequence': 72, 'interaction': 6, 'gap': 2}
- performance: count=8 typeCounts={'gap': 7, 'blocked': 1}

## Smart Presets

- critical-path: count=8 typeCounts={'gap': 7, 'blocked': 1}
- plugin-health: count=0 typeCounts={}
- user-interactions: count=20 typeCounts={'ui': 14, 'interaction': 6}
- render-operations: count=13 typeCounts={'render': 12, 'blocked': 1}
- initialization: count=328 typeCounts={'render': 12, 'data': 119, 'create': 104, 'ui': 14, 'sequence': 72, 'interaction': 6, 'gap': 1}
- dead-time: count=8 typeCounts={'gap': 7, 'blocked': 1}

## Consistency Checks

- dead-time preset count=8 vs gap+blocked raw count=8
- critical-path below-threshold events: 0 (should be 0)

## Drill-down Details

### Interactions & UI (chronological)

- t=  265ms dur=   1ms [################################] ui :: Header UI Theme Toggle | abs=2025-11-10T21:56:17.197000Z
- t=  265ms dur=   1ms [################################] ui :: Header UI Theme Toggle | abs=2025-11-10T21:56:17.197000Z
- t=  265ms dur=   1ms [################################] ui :: Header UI Theme Toggle | abs=2025-11-10T21:56:17.197000Z
- t=  266ms dur=   1ms [################################] ui :: Header UI Theme Get | abs=2025-11-10T21:56:17.198000Z
- t=  266ms dur=   1ms [################################] ui :: Header UI Theme Get | abs=2025-11-10T21:56:17.198000Z
- t=  266ms dur=   1ms [################################] ui :: Header Sequence | abs=2025-11-10T21:56:17.198000Z
- t=  266ms dur=   1ms [################################] ui :: Header UI Theme Get | abs=2025-11-10T21:56:17.198000Z
- t=  266ms dur=   1ms [################################] ui :: Theme Manager | abs=2025-11-10T21:56:17.198000Z
- t=  458ms dur=   1ms [################################] ui :: Control Panel UI Init (Batched) | abs=2025-11-10T21:56:17.390000Z
- t=  458ms dur=   1ms [################################] ui :: Control Panel UI Init (Batched) | abs=2025-11-10T21:56:17.390000Z
- t=  461ms dur=   1ms [################################] ui :: Control Panel UI Init | abs=2025-11-10T21:56:17.393000Z
- t=  461ms dur=   1ms [################################] ui :: Control Panel UI Init | abs=2025-11-10T21:56:17.393000Z
- t=  462ms dur=   1ms [################################] ui :: Control Panel Field Change | abs=2025-11-10T21:56:17.394000Z
- t=  462ms dur=   1ms [################################] ui :: Control Panel Field Change | abs=2025-11-10T21:56:17.394000Z
- t=  489ms dur=   1ms [################################] interaction :: Library Component Drag | abs=2025-11-10T21:56:17.421000Z
- t=  489ms dur=   1ms [################################] interaction :: Library Component Drag | abs=2025-11-10T21:56:17.421000Z
- t=  490ms dur=   1ms [################################] interaction :: Library Component Drop | abs=2025-11-10T21:56:17.422000Z
- t=  490ms dur=   1ms [################################] interaction :: Library Component Drop | abs=2025-11-10T21:56:17.422000Z
- t=  491ms dur=   1ms [################################] interaction :: Library Container Drop | abs=2025-11-10T21:56:17.423000Z
- t=  491ms dur=   1ms [################################] interaction :: Library Container Drop | abs=2025-11-10T21:56:17.423000Z

### Critical Path (gap + blocked)

- dur= 9771ms [########################################] blocked at t=8496ms name=⚠️ React Block (9.77s)
- dur= 2842ms [###########                             ] gap at t=18277ms name=Gap (2.84s)
- dur= 2575ms [##########                              ] gap at t=491ms name=Gap (2.58s)
- dur= 2539ms [##########                              ] gap at t=3765ms name=Gap (2.54s)
- dur= 2383ms [#########                               ] gap at t=21134ms name=Gap (2.38s)
- dur= 2369ms [#########                               ] gap at t=25969ms name=Gap (2.37s)
- dur= 2354ms [#########                               ] gap at t=23575ms name=Gap (2.35s)
- dur= 2001ms [########                                ] gap at t=6402ms name=Gap (2.00s)

### Top Sequences (by count then duration)

- Sequence count=72 totalDur=72ms [############################]

### Search Strategy Sample (pattern: 'Header')

- Header UI Theme Toggle dur=1ms [########################] type=ui
- Header UI Theme Toggle dur=1ms [########################] type=ui
- Header UI Theme Toggle dur=1ms [########################] type=ui
- Header UI Theme Get dur=1ms [########################] type=ui
- Header UI Theme Get dur=1ms [########################] type=ui
- Header Sequence dur=1ms [########################] type=ui
- Header UI Theme Get dur=1ms [########################] type=ui
