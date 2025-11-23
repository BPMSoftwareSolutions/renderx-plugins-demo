# Telemetry Map Guide

The `telemetry-map.svg` visualizes feature telemetry health:

| Visual Attribute | Meaning |
|------------------|---------|
| Node size | Number of persisted runs (up to +10 radius) |
| Fill color | Budget status (`within` = green, `breach` = red, `unknown` = gray) |
| Label text | `feature runs:<n> breaches:<m> status:<state>` |

## Regeneration

After running the Business BDD specs:

```powershell
node scripts/generate-telemetry-map.js
```

Result written to `telemetry-map.svg`. Embed in docs or demo UI:

```html
<img src="telemetry-map.svg" alt="Telemetry Map" />
```

## Roadmap Enhancements

Planned future iterations:

1. Correlation edges connecting composite chain members.
2. Hover tooltip: last 3 hash diffs, breach streak length, coverageId.
3. Inline legend & timestamp footer.
4. Budget heat gradient (yellow pre-breach).
5. Domain mutation glyphs (icons per domain category).

## Troubleshooting

| Symptom | Likely Cause | Remedy |
|---------|--------------|--------|
| SVG shows "No telemetry" | Missing `.generated/telemetry/index.json` | Run tests to populate telemetry. |
| All nodes gray `unknown` | Budgets not evaluated | Ensure `shape.budgets.json` exists & evaluator integrated. |
| Breach count 0 despite high beats | Threshold too high | Lower `beatsMax` for that feature & re-run tests. |

---
Auto-generated map script: `scripts/generate-telemetry-map.js`.
