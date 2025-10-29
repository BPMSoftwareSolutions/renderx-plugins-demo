CANVAS: "School Bus Route — EventRouter Story"   [width: 1920, height: auto, bg: #ffffff]

┌───────────────────────────────────────────────────────────────────────────────┐
│ HEADER (fixed)                                                                │
│ [Title] Tiny Pub/Sub Bus — School Route Story                                 │
│ [Tabs]  All Scenes | Scene 1 | Scene 2 | Scene 3 | Scene 4 | Scene 5 | Scene 6│
│ [Legend] bus = publish, stops = subscribers, hub = conductor, lights = perf   │
└───────────────────────────────────────────────────────────────────────────────┘

SCENE 1  (x:0, y:160,  w:1920, h:1080)  file: scene01_depot_bus.svg
┌───────────────────────────────────────────────────────────────────────────────┐
│ SKY                                                                          │
│   ☁   ☁                                                                       │
│                                                                               │
│ DEPOT (publisher origin)             ROAD (→)                                 │
│  ┌─────┐                                                                    → │
│  │🚪   │   BUS (publish)                                                     → │
│  └─────┘   ┌─────────────gold bus────────────┐                                │
│            ● wheels   ◻ windows   ◉ headlight                                │
│                                                                               │
│ verge/grass ████████████████████████████████████████████████████████████████  │
│                                                                               │
│ [Caption] “Bus leaves depot → publish(topic, payload)”                        │
└───────────────────────────────────────────────────────────────────────────────┘
Z-ORDER: bg sky (0) → ground/verge (1) → road (2) → depot (3) → bus (4) → labels (5)

SCENE 2  (x:0, y:1320, w:1920, h:1080)  file: scene02_manifest_light.svg
┌───────────────────────────────────────────────────────────────────────────────┐
│ SKY with clouds                                                               │
│                                                                               │
│ ROAD  ───────────────────────────────────────────────────────────────────→    │
│               TRAFFIC LIGHT (debounce = YELLOW)                               │
│               ┌─🔴─┐                                                           │
│               │-🟡-│   BILLBOARD (Manifest JSON)   STREET SIGN (Logs ▶ …)      │
│ BUS →         └─🟢─┘   ┌───────────────board───────────────┐   ┌───────────┐   │
│                        │ topic, routes, perf.debounceMs    │   │ Logs ▶ … │   │
│                        └────────────────────────────────────┘   └───────────┘   │
│ guardrails ───────────────────────────────────────────────────────────────────  │
│                                                                               │
│ [Caption] “Manifest plans route; yellow light settles bursts (debounce)”      │
└───────────────────────────────────────────────────────────────────────────────┘
Z-ORDER: bg (0) → road/rails (1) → light/billboard/sign (2) → bus (3) → labels (4)

SCENE 3  (x:0, y:2480, w:1920, h:1080)  file: scene03_first_stop_replay.svg
┌───────────────────────────────────────────────────────────────────────────────┐
│ SKY                                                                            │
│                                                                                │
│ ROAD  ────────────────────────────── BUS STOP (subscribers) ─────────────→     │
│                            ┌─────────shelter──────────┐                         │
│                            │  bench A: LIVE SUB       │  kiosk: REPLAY CACHE    │
│                            │  bench B: LATE SUB       │  [📦 last payload]      │
│                            └──────────────────────────┘                         │
│ BUS ──▶  pulls in                                                                  │
│                                                                                │
│ Arrows:   live publish → bench A (direct)                                       │
│           replay cache → bench B (immediate catch-up)                           │
│                                                                                │
│ [Caption] “First stop: live & late subscribers; Replay Cache hydrates latecomers”│
└───────────────────────────────────────────────────────────────────────────────┘
Z-ORDER: bg (0) → road (1) → stop/shelter/kiosk (2) → bus (3) → arrows/labels (4)

SCENE 4  (x:0, y:3640, w:1920, h:1080)  file: scene04_transfer_hub_conductor.svg
┌───────────────────────────────────────────────────────────────────────────────┐
│ SKY                                                                            │
│                                                                                │
│ ROAD ──────────────── TRANSFER HUB (Conductor) ────────────────→               │
│                     ┌──────── round hub/station ────────┐                      │
│   side routes  ───▶ │  🎼 baton icon   “conductor.play” │ ▶──── branch A       │
│   split off        │  queue/board of sequences          │ ▶──── branch B       │
│                    └────────────────────────────────────┘ ▶──── branch C       │
│ BUS enters hub; some “kids” switch buses (routes trigger plugin sequences)     │
│                                                                                │
│ [Caption] “Special hub: topics route into sequences via Conductor (plugins)”   │
└───────────────────────────────────────────────────────────────────────────────┘
Z-ORDER: bg (0) → road (1) → hub (2) → branching roads (3) → bus/transfer icons (4)

SCENE 5  (x:0, y:4800, w:1920, h:1080)  file: scene05_rules_boundaries_signs.svg
┌───────────────────────────────────────────────────────────────────────────────┐
│ SKY                                                                            │
│                                                                                │
│ ROAD with boundaries                                                           │
│  guardrails ═══════════════════════════════════════════════════════════════     │
│  signs:  [⚠ Loop Prevention]  [🧪 Handler Isolation]  [🔀 Feature Flags ON/OFF] │
│  lane markings:   THROTTLE  (evenly spaced ticks)                               │
│                   DEBOUNCE (funnel icon + single pulse)                         │
│ bus cruises under rules; lights ahead show green/amber/red as needed            │
│                                                                                │
│ [Caption] “Street rules: enforced boundaries, flags, throttle & debounce lanes”│
└───────────────────────────────────────────────────────────────────────────────┘
Z-ORDER: bg (0) → road/rails (1) → signage/lane glyphs (2) → bus (3) → labels (4)

SCENE 6  (x:0, y:5960, w:1920, h:1080)  file: scene06_school_state.svg
┌───────────────────────────────────────────────────────────────────────────────┐
│ SKY  + small celebratory bunting                                               │
│                                                                                │
│ FINAL SCHOOL (Application State)                                               │
│       🏫 building with flag  [“UI Updated”]                                     │
│       kids disembark (delivered events)                                        │
│                                                                                │
│ ROAD terminus ────────────────────────── BUS parks                             │
│                                                                                │
│ [Caption] “Destination reached: application state updated (successful delivery)”│
└───────────────────────────────────────────────────────────────────────────────┘
Z-ORDER: bg (0) → school/grounds (1) → bus/characters (2) → labels (3)
