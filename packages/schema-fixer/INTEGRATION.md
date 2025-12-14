# Schema Fixer Integration Guide

## Quick Start

### 1. Install Dependencies

The package is already part of the workspace. Install root dependencies:

```bash
npm install
```

This installs schema-fixer and all dependencies.

### 2. Run Analysis

Scan your JSON files for schema compliance:

```bash
npm run schema:analyze
```

This generates a report in `.generated/schema-analysis.json` showing:
- Total files found and analyzed
- Version distribution
- Files with validation errors
- Missing required fields

### 3. Preview Migrations

See what would be changed without modifying files:

```bash
npm run schema:fix:preview
```

Review the preview report in `.generated/schema-migration-preview.json`.

### 4. Apply Migrations

Migrate all files to the latest schema version:

```bash
npm run schema:fix
```

This:
- Migrates files through versions (v1 ? v2 ? v3)
- Fills missing required fields
- Creates `.bak` backups
- Generates results report
- Validates all changes

## Usage Patterns

### Analyze a Specific Directory

```bash
npx schema-fixer analyze --root ./packages/orchestration --report ./analysis.json
```

### Dry-Run Before Production Migration

```bash
npx schema-fixer fix --root ./packages/orchestration --dry-run --report ./preview.json

# Review preview.json
# Then apply:
npx schema-fixer fix --root ./packages/orchestration --autofix --report ./results.json
```

### CI/CD Integration

#### GitHub Actions

```yaml
name: Schema Compliance Check

on: [pull_request, push]

jobs:
  schema-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      
      # Analyze current state
      - run: npm run schema:analyze
      
      # Store analysis as artifact
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: schema-analysis
          path: .generated/schema-analysis.json
      
      # Fail if validation errors found
      - run: |
          FAILURES=$(jq '.summary.failureCount' .generated/schema-analysis.json)
          if [ $FAILURES -gt 0 ]; then
            echo "? Found $FAILURES files with schema violations"
            exit 1
          fi
```

#### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

npx schema-fixer analyze --root . --report /tmp/schema-check.json

FAILURES=$(jq '.summary.failureCount' /tmp/schema-check.json)
if [ $FAILURES -gt 0 ]; then
    echo "??  Schema violations detected. Fix with: npm run schema:fix"
    exit 1
fi
```

#### Build Pipeline

Add to your build script:

```bash
#!/bin/bash
set -e

echo "?? Analyzing schema compliance..."
npm run schema:analyze

echo "?? Migrating JSON files..."
npm run schema:fix

echo "? Schema migration complete"
```

## Interpreting Results

### Analysis Report

```json
{
  "summary": {
    "totalFiles": 150,           // Total JSON files found
    "totalScanned": 45,          // Files matching MusicalSequence pattern
    "totalSkipped": 105,         // Files that are not sequences
    "byVersion": {
      "1": 20,                   // v1 files
      "2": 15,                   // v2 files
      "3": 10,                   // v3 files (compliant)
      "unknown": 0               // Unversioned files
    },
    "failureCount": 5            // Files with validation errors
  }
}
```

**Interpretation**:
- All files in `byVersion` should be at version 3
- Any files in v1 or v2 need migration
- `failureCount > 0` means there are structural issues

### Migration Report

```json
{
  "summary": {
    "processed": 45,       // Files attempted
    "successful": 42,      // Successful migrations
    "failed": 3            // Failed migrations
  },
  "results": [
    {
      "success": true,
      "fromVersion": "1",
      "toVersion": "3",
      "migrationsApplied": [
        "1 -> 2: Normalize userStory and acceptanceCriteria structure",
        "2 -> 3: Ensure testFile, event, and structured acceptance criteria"
      ],
      "fieldsAdded": [
        "metadata.version",
        "movements[0].beats[0].testFile"
      ]
    }
  ]
}
```

**Key Metrics**:
- **Success Rate**: `successful / processed`
- **Fields Added**: Indicates structural changes
- **Migrations Applied**: Shows migration path taken

## Common Issues & Solutions

### Issue: "Does not appear to be a MusicalSequence file"

**Cause**: File doesn't have `movements` array or required top-level fields

**Solution**: Either:
1. Update file to match schema structure
2. Move to a different directory or location
3. Use more specific include patterns

### Issue: Required field errors after migration

**Cause**: Migration couldn't auto-fill a required field

**Solution**: 
1. Check the migration result for `errors`
2. Fields are filled with "TODO: ..." - update manually
3. Run migration again after fixes

### Issue: Files not being detected

**Cause**: 
1. File doesn't end in `.json`
2. File is in excluded directory
3. File doesn't look like MusicalSequence

**Solution**:
```bash
# Use include patterns to be explicit
npx schema-fixer analyze --root . --report results.json
# Then check which files were detected
```

### Issue: Permission denied when writing files

**Cause**: File permissions restrict writing

**Solution**:
```bash
# Check file permissions
ls -la your-file.json

# Make writable
chmod 644 your-file.json

# Re-run migration
npm run schema:fix
```

## Advanced Scenarios

### Migration with Custom Include Patterns

```bash
npx schema-fixer fix --root packages/orchestration \
  --include '**/*.json' \
  --exclude '**/test/**' \
  --autofix
```

### Batch Processing Multiple Directories

```bash
#!/bin/bash
for dir in packages/*/json-sequences; do
  echo "Processing $dir..."
  npx schema-fixer fix --root "$dir" --autofix --report "${dir}/migration-results.json"
done
```

### Selective Migration (Version-Specific)

```bash
# Analyze first
npm run schema:analyze

# Identify v1 files and migrate only them
# Then identify v2 files and migrate
# (Currently processes all, but can be extended)
```

## Rollback Strategy

If migrations cause issues:

```bash
#!/bin/bash
# Restore from backups

for file in $(find . -name "*.bak"); do
  original="${file%.bak}"
  echo "Restoring $original..."
  mv "$file" "$original"
done

echo "? Rollback complete"
```

## Monitoring & Compliance

### Regular Compliance Checks

Add to your CI/CD:

```bash
# Weekly schema compliance check
0 0 * * 0 npm run schema:analyze > /tmp/schema-report.txt

# Create GitHub issue if violations found
if grep -q '"failureCount": 0' /tmp/schema-report.txt; then
  echo "? All files compliant"
else
  echo "??  Schema violations detected"
  # Create issue or send alert
fi
```

### Tracking Migration Progress

```bash
# Generate trend report
cat > .generated/migration-progress.md << EOF
# Schema Migration Progress

$(date): Schema Analysis Report
- Total files: $(jq '.summary.totalFiles' .generated/schema-analysis.json)
- Compliant (v3): $(jq '.summary.byVersion."3"' .generated/schema-analysis.json)
- Compliance rate: $(echo "scale=2; $(jq '.summary.byVersion."3"' .generated/schema-analysis.json) * 100 / $(jq '.summary.totalFiles' .generated/schema-analysis.json)" | bc)%
EOF
```

## Programmatic Usage

### In Scripts

```javascript
import { SchemaMigrator, SchemaAnalyzer } from '@renderx-plugins/schema-fixer';

// Analyze
const analyzer = new SchemaAnalyzer('./root', './schema.json');
await analyzer.initialize();
const report = await analyzer.analyzeDirectory();

// Migrate
const migrator = new SchemaMigrator('./root', './schema.json');
await migrator.initialize();
const results = await migrator.migrateDirectory(undefined, undefined, { backup: true });

// Handle results
results.forEach(result => {
  if (result.success) {
    console.log(`? ${result.relativePath}`);
  } else {
    console.error(`? ${result.relativePath}: ${result.error}`);
  }
});
```

### In Tests

```typescript
import { DefaultFiller } from '@renderx-plugins/schema-fixer';

describe('My handler', () => {
  it('works with migrated sequences', () => {
    const partial = {
      id: 'test',
      name: 'Test'
      // ... incomplete data
    };
    
    const complete = DefaultFiller.fillDefaults(partial);
    // Now use complete data in test
  });
});
```

## Performance Tips

### For Large Codebases

1. **Use Include Patterns**: Limit search scope
   ```bash
   npx schema-fixer analyze --root packages \
     --include '**/json-sequences/**/*.json'
   ```

2. **Process in Batches**: Split by directory
   ```bash
   npx schema-fixer fix --root packages/orchestration --autofix
   npx schema-fixer fix --root packages/ographx --autofix
   ```

3. **Exclude Unnecessary Directories**:
   ```bash
   npx schema-fixer analyze --root . \
     --exclude '**/node_modules/**' \
     --exclude '**/dist/**' \
     --exclude '**/.git/**'
   ```

### Caching Strategy

Store reports and reuse:

```bash
# Keep previous report
cp .generated/schema-analysis.json .generated/schema-analysis.previous.json

# Analyze
npm run schema:analyze

# Compare
diff .generated/schema-analysis.previous.json .generated/schema-analysis.json
```

## Troubleshooting

### Enable Debug Logging

```bash
DEBUG=schema-fixer:* npm run schema:fix
```

### Check File Readability

```bash
# Test if a specific file can be read
node -e "
const fs = require('fs');
const file = './your-file.json';
try {
  const content = fs.readFileSync(file, 'utf8');
  const json = JSON.parse(content);
  console.log('? File is valid JSON');
  console.log('Has movements?', Array.isArray(json.movements));
} catch (e) {
  console.error('? Error:', e.message);
}
"
```

### Validate Schema Syntax

```bash
npx ajv compile -s docs/schemas/musical-sequence.schema.json
```

## Support & Issues

For issues with schema-fixer:

1. Check `.generated/schema-analysis.json` and `.generated/schema-migration-results.json`
2. Review error messages in CLI output
3. Check that schema file path is correct
4. Verify JSON file syntax is valid
5. Ensure you have write permissions for files and backups

## Next Steps

1. **Run Analysis**: `npm run schema:analyze`
2. **Review Report**: Check `.generated/schema-analysis.json`
3. **Preview Changes**: `npm run schema:fix:preview`
4. **Apply Migration**: `npm run schema:fix`
5. **Verify Results**: Check `.generated/schema-migration-results.json`
6. **Add to CI/CD**: Integrate analysis/migration into your pipeline
7. **Monitor**: Regular compliance checks going forward

For more details, see [README.md](./README.md) and [ARCHITECTURE.md](./ARCHITECTURE.md).
