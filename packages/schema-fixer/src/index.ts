/**
 * Schema Fixer - Main library entry point
 * Provides APIs for discovering, analyzing, and migrating JSON files
 * conforming to the musical-sequence.schema.json schema
 */

export { SchemaMigrator } from './lib/schema-migrator';
export { SchemaAnalyzer } from './lib/schema-analyzer';
export { SchemaValidator } from './lib/schema-validator';
export { MigrationResult, AnalysisReport, ValidationReport, FixerConfig } from './types';
