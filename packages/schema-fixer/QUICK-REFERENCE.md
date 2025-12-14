# Schema Fixer - Quick Reference Card

## Installation & Setup

```bash
# Already included in workspace
npm install

# Add npm scripts to root package.json (already done):
# - schema:analyze
# - schema:fix:preview  
# - schema:fix
```

## Most Common Commands

### Analyze Current State
```bash
npm run schema:analyze
# ? .generated/schema-analysis.json
```

### Preview Changes
```bash
npm run schema:fix:preview
# ? .generated/schema-migration-preview.json
```

### Apply Migrations
```bash
npm run schema:fix
# ? .generated/schema-migration-results.json
```

## CLI Syntax

```bash
# Analyze
schema-fixer analyze [--root <dir>] [--schema <path>] [--report <file>]

# Fix (migrate)
schema-fixer fix [--root <dir>] [--schema <path>] [--autofix] [--dry-run] [--report <file>]

# Help
schema-fixer --help
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `docs/schemas/musical-sequence.schema.json` | The schema being used |
| `.generated/schema-analysis.json` | Analysis results |
| `.generated/schema-migration-preview.json` | Preview of changes |
| `.generated/schema-migration-results.json` | Migration results |

## Interpreting Results

### Analysis Report
```json
{
  "summary": {
    "failureCount": 5,  // ? Files needing fixes
    "byVersion": {      // ? Current version distribution
      "3": 40,          // All compliant
      "2": 5,           // Need migration
      "1": 0
    }
  }
}
```

### Migration Report
```json
{
  "summary": {
    "processed": 5,     // ? Files attempted
    "successful": 5,    // ? Successful
    "failed": 0         // ? Failures
  }
}
```

## Programmatic API

### Quick Integration
```typescript
import { SchemaMigrator } from '@renderx-plugins/schema-fixer';

const migrator = new SchemaMigrator('./root', './schema.json');
await migrator.initialize();
const results = await migrator.migrateDirectory();
```

### Types Available
```typescript
import {
  MusicalSequence,          // Strict type
  PartialMusicalSequence,   // For incomplete objects
  SchemaMigrator,           // Migration class
  SchemaAnalyzer,           // Analysis class
  SchemaValidator,          // Validation class
  ValidationResult,         // Validation output
  MigrationResult,          // Migration output
  AnalysisReport           // Analysis output
} from '@renderx-plugins/schema-fixer';
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Files not detected | Check if they have `movements` array |
| Permission denied | `chmod 644 <file>` before migration |
| Invalid JSON | Fix JSON syntax before migration |
| Validation errors | Check `.generated/` report for details |

## CI/CD Integration

### GitHub Actions
```yaml
- run: npm run schema:analyze
- run: npm run schema:fix
- run: git add -A && git commit -m "chore: update schemas"
```

### Pre-commit Hook
```bash
#!/bin/bash
npm run schema:analyze
# Check report and fail if violations
```

## What Gets Migrated

**v1 ? v2**
- Normalizes `userStory` (string ? object)
- Structures `acceptanceCriteria` (array of objects)

**v2 ? v3**
- Ensures `event` field
- Ensures `testFile` field
- Validates structure

## Output Files

All results go to `.generated/`:
- `schema-analysis.json` - Analysis report
- `schema-migration-preview.json` - Preview report
- `schema-migration-results.json` - Migration report

## Reverting Changes

All migrations create `.bak` backups:
```bash
for file in $(find . -name "*.bak"); do
  mv "$file" "${file%.bak}"
done
```

## Key Concepts

- **Schema Version**: Stored in `metadata.version`
- **MusicalSequence**: JSON file with `movements` array
- **Migration**: Transforms file structure through versions
- **Validation**: Ensures file matches schema
- **Default Filling**: Adds required fields with TODOs

## Options Explained

| Option | Effect |
|--------|--------|
| `--root <dir>` | Where to scan (default: cwd) |
| `--schema <path>` | Schema file location |
| `--dry-run` | Preview without changes |
| `--autofix` | Actually apply migrations |
| `--report <file>` | Save results to file |

## Common Workflows

### Full Migration
```bash
npm run schema:analyze          # Check status
npm run schema:fix:preview      # Preview changes
npm run schema:fix              # Apply all
git add -A && git commit -m "chore: schema migration"
```

### Partial Migration
```bash
npx schema-fixer fix --root packages/orchestration --autofix
npx schema-fixer fix --root packages/ographx --autofix
# Each directory separately
```

### Validation Only
```bash
npm run schema:analyze
# Check .generated/schema-analysis.json
# No files are modified
```

## Performance Tips

- Use `--dry-run` first to see scope
- Process large directories in batches
- Use specific `--root` paths to limit scope
- Result reports are JSON for easy parsing

## Documentation

- **README.md** - User guide
- **ARCHITECTURE.md** - Technical details
- **INTEGRATION.md** - Deployment guide
- **SUMMARY.md** - Feature overview
- **PROJECT-STRUCTURE.md** - File layout

## Getting Help

```bash
schema-fixer --help
```

Check the detailed documentation in package:
```bash
cd packages/schema-fixer
cat README.md
cat ARCHITECTURE.md
cat INTEGRATION.md
```

## Next Steps

1. `npm run schema:analyze` - Understand current state
2. `npm run schema:fix:preview` - See what will change
3. `npm run schema:fix` - Apply migrations
4. Review `.generated/` reports
5. Commit changes
6. Integrate into CI/CD

## Version Support

- **v1**: Initial format (string userStory, etc.)
- **v2**: Normalized structures
- **v3**: Full compliance (current target)

Files are automatically migrated through all versions.

---

**Quick Start**: `npm run schema:analyze` ? `npm run schema:fix`
