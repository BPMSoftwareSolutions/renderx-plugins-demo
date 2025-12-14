#!/usr/bin/env node

/**
 * CLI for schema-fixer
 * Usage: schema-fixer --root <dir> --schema <path> [--autofix] [--dry-run] [--report <path>]
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SchemaMigrator } from './lib/schema-migrator';
import { SchemaAnalyzer } from './lib/schema-analyzer';
import { AnalysisReport, MigrationResult } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CliArgs {
  root: string;
  schema: string;
  autofix?: boolean;
  'dry-run'?: boolean;
  report?: string;
  command?: 'analyze' | 'fix';
  help?: boolean;
}

function parseArgs(): CliArgs {
  const args: CliArgs = {
    root: process.cwd(),
    schema: path.join(process.cwd(), 'docs', 'schemas', 'musical-sequence.schema.json'),
    command: 'analyze'
  };

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    const nextArg = process.argv[i + 1];

    if (arg === '--root' && nextArg) {
      args.root = nextArg;
      i++;
    } else if (arg === '--schema' && nextArg) {
      args.schema = nextArg;
      i++;
    } else if (arg === '--report' && nextArg) {
      args.report = nextArg;
      i++;
    } else if (arg === '--autofix') {
      args.autofix = true;
      args.command = 'fix';
    } else if (arg === '--dry-run') {
      args['dry-run'] = true;
    } else if (arg === '--analyze') {
      args.command = 'analyze';
    } else if (arg === '--help') {
      args.help = true;
    } else if (arg === 'analyze') {
      args.command = 'analyze';
    } else if (arg === 'fix') {
      args.command = 'fix';
    }
  }

  return args;
}

function printHelp(): void {
  console.log(`
schema-fixer - JSON Schema Migration Tool

Usage:
  schema-fixer [command] [options]

Commands:
  analyze       Analyze JSON files for schema compliance (default)
  fix           Migrate JSON files to latest schema version

Options:
  --root <dir>      Working directory (default: current directory)
  --schema <path>   Path to JSON schema (default: docs/schemas/musical-sequence.schema.json)
  --report <path>   Save analysis/migration report to file
  --autofix         Enable automatic fixing (implies 'fix' command)
  --dry-run         Show what would be done without making changes
  --help            Show this help message

Examples:
  schema-fixer analyze --root . --report analysis.json
  schema-fixer fix --root . --dry-run
  schema-fixer fix --root . --autofix --report migration-results.json
`);
}

async function analyzeCommand(args: CliArgs): Promise<void> {
  console.log('?? Analyzing JSON files for schema compliance...\n');

  const analyzer = new SchemaAnalyzer(args.root, args.schema);
  await analyzer.initialize();

  const report = await analyzer.analyzeDirectory();

  // Print summary
  console.log('?? Summary:');
  console.log(`   Total files found: ${report.summary.totalFiles}`);
  console.log(`   Scanned as MusicalSequences: ${report.summary.totalScanned}`);
  console.log(`   Skipped (not sequences): ${report.summary.totalSkipped}`);
  console.log(`   Files needing migration: ${report.summary.failureCount}`);
  console.log('\n?? Version distribution:');
  for (const [version, count] of Object.entries(report.summary.byVersion)) {
    console.log(`   Version ${version}: ${count} files`);
  }

  // Print details of problematic files
  const problemFiles = report.files.filter(f => !f.valid);
  if (problemFiles.length > 0) {
    console.log(`\n??  Files with issues (${problemFiles.length}):`);
    for (const file of problemFiles.slice(0, 10)) {
      console.log(`   ?? ${file.relativePath}`);
      console.log(`      Version: ${file.detectedVersion}`);
      if (file.missingFields?.length) {
        console.log(`      Missing: ${file.missingFields.join(', ')}`);
      }
      if (file.errors.length > 0) {
        console.log(`      Error: ${file.errors[0].message}`);
      }
    }
    if (problemFiles.length > 10) {
      console.log(`   ... and ${problemFiles.length - 10} more`);
    }
  }

  // Save report if requested
  if (args.report) {
    try {
      await fs.writeFile(args.report, JSON.stringify(report, null, 2), 'utf8');
      console.log(`\n? Report saved to ${args.report}`);
    } catch (err) {
      console.error(`Failed to save report: ${(err as Error).message}`);
    }
  }
}

async function fixCommand(args: CliArgs): Promise<void> {
  const dryRun = args['dry-run'];
  console.log(`?? Migrating JSON files to latest schema version${dryRun ? ' (DRY RUN)' : ''}...\n`);

  const migrator = new SchemaMigrator(args.root, args.schema);
  await migrator.initialize();

  const results = await migrator.migrateDirectory(undefined, undefined, {
    dryRun,
    backup: true
  });

  // Print summary
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log('? Migration Summary:');
  console.log(`   Processed: ${results.length} files`);
  console.log(`   Successful: ${successful.length}`);
  console.log(`   Failed: ${failed.length}`);

  if (dryRun) {
    console.log('\n?? This was a dry-run. No files were modified.');
  }

  // Show successful migrations
  if (successful.length > 0) {
    console.log(`\n? Successfully migrated (${successful.length}):`);
    for (const result of successful.slice(0, 5)) {
      console.log(`   ?? ${result.relativePath}`);
      if (result.fieldsAdded?.length) {
        console.log(`      Added fields: ${result.fieldsAdded.join(', ')}`);
      }
    }
    if (successful.length > 5) {
      console.log(`   ... and ${successful.length - 5} more`);
    }
  }

  // Show failures
  if (failed.length > 0) {
    console.log(`\n? Failed to migrate (${failed.length}):`);
    for (const result of failed.slice(0, 5)) {
      console.log(`   ?? ${result.relativePath}`);
      console.log(`      Error: ${result.error}`);
    }
    if (failed.length > 5) {
      console.log(`   ... and ${failed.length - 5} more`);
    }
  }

  // Save report if requested
  if (args.report) {
    try {
      const report = {
        command: 'fix',
        dryRun,
        summary: {
          processed: results.length,
          successful: successful.length,
          failed: failed.length
        },
        results,
        generatedAt: new Date().toISOString()
      };
      await fs.writeFile(args.report, JSON.stringify(report, null, 2), 'utf8');
      console.log(`\n? Report saved to ${args.report}`);
    } catch (err) {
      console.error(`Failed to save report: ${(err as Error).message}`);
    }
  }

  // Exit with error if any failed
  if (failed.length > 0 && !dryRun) {
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  try {
    if (args.command === 'fix' || args.autofix) {
      await fixCommand(args);
    } else {
      await analyzeCommand(args);
    }
  } catch (err) {
    console.error('? Error:', (err as Error).message);
    if ((err as Error).stack) {
      console.error((err as Error).stack);
    }
    process.exit(1);
  }
}

main();
