# SVG Assets Review (Scenes + Primitives)

Summary of key assets and integration readiness.

- Integrated scenes present
  - integrated_scene_3.svg: Subscribers (NEW/REPLAY) with bus layer moving horizontally at translateY=125
  - integrated_scene_4.svg: Transfer Hub (CONDUCTOR (HUB)) with route branches
  - integrated_scene_5.svg: Destination (SCHOOL) with DELIVERED label
  - integrated_scene_6.svg: Boundaries and guard rails (added)
  - integrated_scene_7.svg: Route Map overview (added)
- Primitives/components
  - Traffic light: animated lights cycling red/yellow/green
  - Road/guard rails: perspective road + corrugated rail geometry
  - Depot: building, fuel, wash bay
  - People-at-stop: available in canvas SVG snippet; can be embedded into scenes if needed
- Consistency
  - ViewBox targets converge on 1200x400 for scenes 4–7; scene 3 uses 1000x400 (acceptable for composition)
  - Bus geometry and animation are consistent (EVENT BUS label; -400→1200/1400 over 18–20s)
- Gaps/notes
  - If stricter consistency is desired, unify all scene viewBoxes at 1200x400.
  - Consider extracting shared bus SVG into a symbol/defs to reduce duplication if later pipelined.

