# Orchestration Domains Structural Diff Specification

## Purpose
Defines the canonical format for detecting and reporting structural changes between the previous baseline of `orchestration-domains.json` and the newly generated version to enforce anti-drift governance.

## Diff JSON Output: `.generated/orchestration-domains-diff.json`

Root shape:
```jsonc
{
  "generatedAt": "ISO timestamp",
  "baselineExists": true,
  "previousGeneratedAt": "ISO timestamp | null",
  "summary": {
    "domainsTotalBefore": 59,
    "domainsTotalAfter": 60,
    "added": 1,
    "removed": 0,
    "changed": 1,
    "unchanged": 58
  },
  "addedDomains": ["orchestration-audit-system"],
  "removedDomains": [],
  "changedDomains": ["orchestration-audit-session"],
  "domainChanges": {
    "orchestration-audit-system": {
      "status": "added",
      "after": {"movements": 8, "beats": 24, "tempo": 108, "key": "G", "timeSignature": "4/4", "category": "orchestration"}
    },
    "orchestration-audit-session": {
      "status": "changed",
      "before": {"movements": 8, "beats": 25, "tempo": 120, "key": "C", "timeSignature": "4/4"},
      "after": {"movements": 8, "beats": 25, "tempo": 120, "key": "C", "timeSignature": "4/4"},
      "diff": {"beatsDelta": 0, "movementsDelta": 0, "metadataChanged": false}
    }
  }
}
```

Notes:
- `status` ∈ {"added","removed","changed","unchanged"}.
- A domain is `changed` if any of: movement count, beat count, tempo, key, timeSignature differ.
- `metadataChanged` boolean collapses tempo/key/timeSignature differences.
- Unchanged domains MAY be omitted from `domainChanges` for brevity.

## Markdown Summary: `.generated/ORCHESTRATION_DOMAINS_DIFF.md`
Sections:
1. Header with timestamp.
2. Summary table.
3. Added domains table.
4. Removed domains table (omit if empty).
5. Changed domains table listing deltas.
6. Governance actions (e.g., lock new domain, regenerate docs).

## Baseline File
Location: `.generated/baselines/orchestration-domains.prev.json`
- Written AFTER diff generation (post comparison) to become next baseline.
- Contains full previous `orchestration-domains.json` snapshot.

## Evolution Integration
1. Run registry generator.
2. Run diff generator.
3. If `added > 0 or changed > 0`: append human-readable entry to `orchestration-evolution-changelog.md`.
4. Regenerate docs/diagrams.
5. Recompute canonical hashes (excluding integrity blocks) for drift status.

## Error Handling
- If baseline missing: treat all domains as `added` and set `domainsTotalBefore = 0`.
- If current file unreadable: abort with non-zero exit code.
- If JSON parse fails: include `error` field in diff JSON and skip markdown generation.

## Future Extensions
- Include per-beat structural deltas.
- Add semantic change detection (description or purpose changes).
- Compute impact score based on domain category and change magnitude.

---
Generated specification. This document itself should be stable and updated only when schema evolves.
