# Schema Fixer

A comprehensive tool to discover, analyze, and automatically migrate JSON files conforming to the `musical-sequence.schema.json` schema to the latest version.

## Features

- ?? **Discovery**: Recursively find all JSON files in a directory tree
- ?? **Analysis**: Detect schema versions and identify files needing migration
- ?? **Reporting**: Generate detailed reports of schema compliance and versions in use
- ?? **Migration**: Automatically migrate files through schema versions (v1 ? v2 ? v3)
- ? **Validation**: Validate migrated files against the latest schema
- ?? **Default Filling**: Automatically fill in required fields with sensible defaults
- ?? **Safety**: Create backups and support dry-run mode before making changes

## Installation

As part of the renderx-plugins-demo workspace, this package is available via the workspace configuration.

```bash
npm install
```

## Usage

### As a CLI Tool

```bash
# Analyze files for schema compliance
schema-fixer analyze --root ./packages --report analysis.json

# Show what would be migrated (dry-run)
schema-fixer fix --root ./packages --dry-run

# Migrate all files to latest version
schema-fixer fix --root ./packages --autofix --report migration-results.json
```

### As a Library

```typescript
import { SchemaMigrator, SchemaAnalyzer } from '@renderx-plugins/schema-fixer';

// Analyze directory
const analyzer = new SchemaAnalyzer('./packages', './docs/schemas/musical-sequence.schema.json');
await analyzer.initialize();
const report = await analyzer.analyzeDirectory();

// Migrate files
const migrator = new SchemaMigrator('./packages', './docs/schemas/musical-sequence.schema.json');
await migrator.initialize();
const results = await migrator.migrateDirectory(undefined, undefined, { backup: true });
```

## CLI Commands

### `analyze` (default)

Scan JSON files and report on schema compliance.

**Options:**
- `--root <dir>` - Working directory (default: current directory)
- `--schema <path>` - Path to schema file (default: docs/schemas/musical-sequence.schema.json)
- `--report <path>` - Save analysis report to JSON file

**Example:**
```bash
schema-fixer analyze --root . --report ./reports/schema-analysis.json
```

### `fix`

Migrate JSON files to the latest schema version.

**Options:**
- `--root <dir>` - Working directory
- `--schema <path>` - Path to schema file
- `--report <path>` - Save migration report to JSON file
- `--dry-run` - Show what would be done without making changes
- `--autofix` - Perform actual migrations (creates backups)

**Example:**
```bash
# Preview migrations
schema-fixer fix --root . --dry-run --report preview.json

# Perform migrations
schema-fixer fix --root . --autofix --report results.json
```

## Migration Process

The tool performs a multi-step migration process:

1. **Version Detection**: Identifies current schema version from `metadata.version` or by validation
2. **Migration Steps**: Applies registered migration functions (v1?v2, v2?v3, etc.)
3. **Default Filling**: Fills in required fields with TODO placeholders or sensible defaults
4. **Validation**: Validates the result against the latest schema
5. **Persistence**: Writes back the migrated file with optional backup

### Migration Steps

#### v1 ? v2
- Normalizes `userStory` structure (converts strings to objects)
- Structures `acceptanceCriteria` into Given/When/Then/And format
- Ensures proper object shapes at all levels

#### v2 ? v3
- Ensures `event` field is present on each beat
- Ensures `testFile` field is present on each beat
- Structures `acceptanceCriteria` as array of objects

## Report Format

### Analysis Report
```json
{
  "summary": {
    "totalFiles": 150,
    "totalScanned": 45,
    "totalSkipped": 105,
    "byVersion": {
      "1": 20,
      "2": 15,
      "3": 10,
      "unknown": 0
    },
    "failureCount": 5
  },
  "files": [
    {
      "filePath": "/absolute/path/file.json",
      "relativePath": "packages/orchestration/file.json",
      "detectedVersion": "1",
      "targetVersion": "3",
      "valid": false,
      "errors": [
        {
          "path": ".movements[0].beats[0]",
          "message": "must have required property 'testFile'"
        }
      ],
      "requiresMigration": true,
      "missingFields": ["testFile"]
    }
  ],
  "generatedAt": "2024-01-20T10:30:00Z"
}
```

### Migration Report
```json
{
  "command": "fix",
  "dryRun": false,
  "summary": {
    "processed": 45,
    "successful": 42,
    "failed": 3
  },
  "results": [
    {
      "filePath": "/absolute/path/file.json",
      "relativePath": "packages/orchestration/file.json",
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
  ],
  "generatedAt": "2024-01-20T10:30:00Z"
}
```

## API

### SchemaMigrator

```typescript
class SchemaMigrator {
  constructor(root: string, schemaPath: string)
  async initialize(): Promise<void>
  async migrateFile(
    filePath: string,
    targetVersion?: string,
    options?: { dryRun?: boolean; backup?: boolean }
  ): Promise<MigrationResult>
  async migrateDirectory(
    includePatterns?: string[],
    excludePatterns?: string[],
    options?: { dryRun?: boolean; backup?: boolean }
  ): Promise<MigrationResult[]>
}
```

### SchemaAnalyzer

```typescript
class SchemaAnalyzer {
  constructor(root: string, schemaPath: string)
  async initialize(): Promise<void>
  async analyzeDirectory(
    includePatterns?: string[],
    excludePatterns?: string[]
  ): Promise<AnalysisReport>
}
```

### SchemaValidator

```typescript
class SchemaValidator {
  constructor(schemaPath: string)
  async initialize(): Promise<void>
  async validateFile(filePath: string): Promise<ValidationResult>
  async validateJson(json: any): Promise<ValidationResult>
}
```

## Integration with Build System

Add to your npm scripts in the root `package.json`:

```json
{
  "scripts": {
    "schema:analyze": "schema-fixer analyze --root . --report .generated/schema-analysis.json",
    "schema:fix": "schema-fixer fix --root . --autofix --report .generated/schema-migration.json",
    "schema:fix:preview": "schema-fixer fix --root . --dry-run --report .generated/schema-migration-preview.json"
  }
}
```

Then run migrations as part of your build:

```bash
npm run schema:analyze
npm run schema:fix:preview  # Review changes
npm run schema:fix          # Apply migrations
```

## Development

```bash
# Build
npm run build

# Test
npm test

# Clean
npm run clean
```

## How It Works

The schema-fixer uses a composition of specialized components:

1. **SchemaValidator** (AJV-based)
   - Compiles JSON Schema into fast validators
   - Detects schema version by validation
   - Reports detailed validation errors

2. **MigrationFramework**
   - Chains migration steps together
   - Supports arbitrary schema versions
   - Handles error propagation

3. **DefaultFiller**
   - Recursively traverses document tree
   - Fills missing required fields
   - Provides sensible defaults (TODO placeholders for strings)

4. **SchemaMigrator**
   - Orchestrates validation + migration + validation
   - Manages file I/O and backups
   - Tracks which fields were added

5. **SchemaAnalyzer**
   - Glob-based file discovery
   - Concurrent validation
   - Aggregated reporting

## License

MIT
