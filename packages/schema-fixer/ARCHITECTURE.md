# Schema Fixer Package Architecture

## Overview

The `schema-fixer` package is a composable, production-ready tool for discovering, analyzing, and migrating JSON files conforming to the `musical-sequence.schema.json` schema. It's built as an npm workspace package with both CLI and programmatic API surfaces.

## Architecture

```
packages/schema-fixer/
??? src/
?   ??? index.ts              # Public API exports
?   ??? types.ts              # Shared type definitions
?   ??? cli.ts                # CLI entry point (#!/usr/bin/env node)
?   ??? lib/
?       ??? schema-validator.ts        # AJV-based validation
?       ??? schema-analyzer.ts         # File discovery & analysis
?       ??? schema-migrator.ts         # Main migration engine
?       ??? migration-framework.ts     # Migration step chain
?       ??? default-filler.ts          # Required field filling
??? tsconfig.json             # TypeScript configuration
??? package.json              # npm metadata
??? README.md                 # User documentation
```

## Core Components

### 1. SchemaValidator
**Purpose**: Validate JSON files against the schema using AJV

```typescript
class SchemaValidator {
  async validateFile(filePath: string): Promise<ValidationResult>
  async validateJson(json: any): Promise<ValidationResult>
}
```

- Uses AJV for fast, compiled schema validation
- Detects version from `metadata.version` field
- Provides detailed error reporting with paths and messages
- Heuristic detection of MusicalSequence files

### 2. SchemaAnalyzer
**Purpose**: Discover and analyze multiple JSON files

```typescript
class SchemaAnalyzer {
  async analyzeDirectory(
    includePatterns?: string[],
    excludePatterns?: string[]
  ): Promise<AnalysisReport>
}
```

- Glob-based file discovery with include/exclude patterns
- Concurrent validation of discovered files
- Version distribution aggregation
- Missing field detection
- Comprehensive report generation

### 3. SchemaMigrator
**Purpose**: Orchestrate migration of JSON files

```typescript
class SchemaMigrator {
  async migrateFile(filePath: string, targetVersion?: string): Promise<MigrationResult>
  async migrateDirectory(...): Promise<MigrationResult[]>
}
```

- Orchestrates: validate ? migrate ? fill defaults ? validate
- Per-file backup creation
- Dry-run support
- Tracks which fields were added
- Maintains detailed migration logs

### 4. MigrationFramework
**Purpose**: Chain migration steps between versions

```typescript
class MigrationFramework {
  registerStep(step: MigrationStep): void
  async migrateToVersion(doc: any, from: string, to: string): Promise<MigrationResult>
}
```

- Supports arbitrary migration chains
- Default migrations: v1?v2?v3
- Error propagation and recovery
- Extensible for future schema versions

**Default Migrations**:
- **v1 ? v2**: Normalizes `userStory` structure, shapes `acceptanceCriteria`
- **v2 ? v3**: Ensures `event`, `testFile`, structured AC arrays

### 5. DefaultFiller
**Purpose**: Fill missing required fields with sensible defaults

```typescript
class DefaultFiller {
  static fillDefaults(doc: MusicalSequence, version: string): MusicalSequence
}
```

- Recursively walks document tree
- Creates nested objects as needed
- Provides context-specific TODO placeholders
- Preserves existing values
- Ensures proper shape for all levels (root, movements, beats)

## Type System

### Full vs. Partial Types

The package exports both strict and partial types:

```typescript
// Strict types - all required fields
interface MusicalSequence {
  domainId: string;
  id: string;
  name: string;
  userStory: UserStory;
  movements: SequenceMovement[];
}

// Partial types - for incomplete objects
interface PartialMusicalSequence {
  domainId?: string;
  id?: string;
  name?: string;
  userStory?: Partial<UserStory>;
  movements?: PartialSequenceMovement[];
}
```

This allows:
- Validation against strict schema
- Safe handling of incomplete objects during migration
- Better type safety in tests

## Data Flow

### Analysis Flow

```
Directory
  ?
Glob pattern matching
  ?
Read & parse JSON files
  ?
Per-file validation
  ?
Version detection
  ?
Aggregate analysis
  ?
Generate report
```

### Migration Flow

```
Input JSON
  ?
Version detection
  ?
Migration chain (v1?v2?v3)
  ?
Default field filling
  ?
Final validation
  ?
Backup creation (optional)
  ?
File writing
  ?
Result reporting
```

## Configuration

### CLI Configuration

```bash
schema-fixer [analyze|fix] [options]

Options:
  --root <dir>        Working directory (default: cwd)
  --schema <path>     Schema path (default: docs/schemas/musical-sequence.schema.json)
  --report <path>     Save report to file
  --dry-run           Preview without modifying
  --autofix           Actually perform fixes (required for 'fix' command)
```

### Programmatic Configuration

```typescript
interface FixerConfig {
  root: string;
  schemaPath: string;
  targetVersion: string;
  autofix?: boolean;
  dryRun?: boolean;
  reportPath?: string;
  includePatterns?: string[];
  excludePatterns?: string[];
}
```

## Integration Points

### Build System Integration

Add to root `package.json`:

```json
{
  "scripts": {
    "schema:analyze": "schema-fixer analyze --root . --report .generated/schema-analysis.json",
    "schema:fix:preview": "schema-fixer fix --root . --dry-run --report .generated/preview.json",
    "schema:fix": "schema-fixer fix --root . --autofix --report .generated/results.json"
  },
  "dependencies": {
    "@renderx-plugins/schema-fixer": "*"
  }
}
```

### GitHub Actions Workflow

```yaml
- name: Analyze schema compliance
  run: npm run schema:analyze

- name: Migrate to latest schema
  run: npm run schema:fix
  
- name: Commit changes
  run: git add -A && git commit -m "chore: migrate JSON files to latest schema version"
```

## Error Handling

### Validation Errors
- File not found ? Clear error message
- Invalid JSON ? Parse error with location
- Schema mismatch ? Detailed AJV error paths
- Non-sequence files ? Graceful skip

### Migration Errors
- Version incompatibility ? Detailed error message
- Data loss risk ? Warning in results
- Write failures ? Rollback with .bak recovery

### Recovery Strategies
- Automatic backup creation (`*.bak` files)
- Dry-run preview before actual changes
- Partial success tracking (some files migrate even if others fail)
- Detailed error logs for debugging

## Performance Characteristics

- **Schema Compilation**: Once per instance (~100ms)
- **File Discovery**: Glob-based (~500ms per 1000 files)
- **Validation**: AJV compiled validators (~1ms per file)
- **Migration**: String operations (~5-10ms per file)
- **Parallelization**: Directory operations process files sequentially

For large codebases (10,000+ files), consider:
- Using include patterns to limit scope
- Running in multiple passes on different directories
- Checking dry-run results before full migration

## Testing

```bash
cd packages/schema-fixer

# Unit tests
npm test

# Build
npm run build

# Clean
npm run clean
```

Tests cover:
- DefaultFiller field generation
- MigrationFramework step chaining
- EdgeCase handling (empty arrays, missing fields)
- Type safety with partial types

## Extension Points

### Adding New Migration Steps

```typescript
const framework = new MigrationFramework();

framework.registerStep({
  fromVersion: '3',
  toVersion: '4',
  description: '3 -> 4: Add new field X',
  migrate: (doc) => {
    return {
      ...doc,
      newField: 'default-value'
    };
  }
});
```

### Custom Validation

```typescript
const validator = new SchemaValidator('./custom-schema.json');
await validator.initialize();

const result = await validator.validateFile('./myfile.json');
```

### Custom File Discovery

```typescript
const analyzer = new SchemaAnalyzer('./root', './schema.json');
await analyzer.initialize();

const report = await analyzer.analyzeDirectory(
  ['**/*.json'],                           // Include patterns
  ['**/node_modules/**', '**/dist/**']    // Exclude patterns
);
```

## Dependencies

- **ajv** (^8.12.0): JSON Schema validation
- **fast-glob** (^3.3.2): File discovery
- **typescript** (dev): Type definitions
- **vitest** (dev): Testing framework

## Future Enhancements

Potential improvements:
1. **Parallel Processing**: Process files concurrently
2. **Streaming API**: Handle large directories with iterators
3. **Custom Formatters**: JSON, CSV, HTML report formats
4. **Watch Mode**: Continuous monitoring of changes
5. **Interactive Mode**: Terminal UI for conflict resolution
6. **Rollback Support**: Undo previous migrations
7. **Schema Versioning**: Support multiple schemas simultaneously
8. **Metrics**: Report performance stats and migration impact

## License

MIT
