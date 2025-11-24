# Shape Diff Enforcement

The shape diff check (`scripts/shape-diff-check.js`) ensures intentional telemetry shape evolution.

## Modes

| Env Var | Behavior |
| ------- | -------- |
| (unset) / any value except `0` | Fail (exit 1) on unannotated hash changes. |
| `SHAPE_DIFF_ENFORCE=0` | Warn only, allow local exploratory development. |

## Workflow

1. Run tests; if failure due to unannotated diff, inspect output listing feature and hashes.
2. Annotate change:
   ```powershell
   node scripts/shape-diff-check.js --annotate feature=<feature> reason="Intentional evolution"
   ```
3. Re-run tests; diff passes once annotation present.

## Gated Evolution Tests

Some specs include optional evolution scenarios gated by `ENABLE_HASH_EVOLUTION_TEST=1` to explicitly produce a hash change for practicing the annotation cycle.

## Future Enhancements

- Allow-list file for pending evolutions.
- Rich diff output (field-level comparison).
- CI comment summarizing new evolutions per PR.
