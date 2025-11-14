/**
 * Sequence Player - CLI for replaying sequences and debugging performance
 *
 * Features:
 * - Load and play sequences through the conductor
 * - Parse production logs to extract sequences
 * - Measure timing for each beat
 * - Support incremental mocking of services (pure, io, stage-crew)
 * - Generate performance reports
 *
 * Usage:
 *   npm run conductor:play -- --sequence canvas-component-create-symphony
 *   npm run conductor:play -- --from-log .logs/localhost-1763041026581.log --sequence canvas-component-create-symphony
 *   npm run conductor:play -- --sequence canvas-component-create-symphony --mock io
 */

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { CLILogger } from "./utils/CLILogger";
import { SequencePlayerEngine } from "./engines/SequencePlayerEngine";
import { LogParser } from "./parsers/LogParser";
import { PerformanceReporter } from "./reporters/PerformanceReporter";

// Suppress circular dependency warnings during initialization
process.on("warning", (warning) => {
  if (warning.code === "ERR_MODULE_NOT_FOUND" || warning.code === "ERR_UNKNOWN_FILE_EXTENSION") {
    // Ignore module loading warnings
  }
});

class SequencePlayerCLI {
  private program: Command;
  private logger: CLILogger;
  private engine: SequencePlayerEngine;
  private logParser: LogParser;
  private reporter: PerformanceReporter;

  constructor() {
    this.program = new Command();
    this.logger = new CLILogger();
    this.engine = new SequencePlayerEngine();
    this.logParser = new LogParser();
    this.reporter = new PerformanceReporter();

    this.setupCommands();
  }

  private setupCommands(): void {
    this.program
      .name("conductor:play")
      .description("CLI Bug Detective: Sequence Replay and Performance Debugging")
      .version("1.0.0");

    // Play command
    this.program
      .command("play")
      .description("Play a sequence and measure performance")
      .option("-s, --sequence <id>", "Sequence ID to play")
      .option("-l, --from-log <file>", "Load sequence from production log")
      .option("-m, --mock <types>", "Mock service types (pure,io,stage-crew)")
      .option("-b, --mock-beat <beats>", "Mock specific beats (comma-separated)")
      .option("-o, --output <file>", "Output report file (JSON)")
      .option("--analyze-beat <beat>", "Analyze specific beat in detail")
      .option("--compare <file>", "Compare with previous run for before/after")
      .option("--json", "Output in JSON format")
      .action(this.handlePlay.bind(this));

    // List command
    this.program
      .command("list")
      .description("List available sequences")
      .option("--json", "Output in JSON format")
      .action(this.handleList.bind(this));

    // Parse command
    this.program
      .command("parse-log")
      .description("Parse production log and extract sequences")
      .option("-f, --file <file>", "Log file to parse")
      .option("-o, --output <file>", "Output file for extracted sequences")
      .action(this.handleParseLog.bind(this));
  }

  private async handlePlay(options: any): Promise<void> {
    try {
      this.logger.info("🎵 Sequence Player: Starting...");

      if (!options.sequence && !options.fromLog) {
        this.logger.error("❌ Must provide --sequence or --from-log");
        process.exit(1);
      }

      // Load sequence from log if provided
      let sequenceId = options.sequence;
      let context: any = {};

      if (options.fromLog) {
        this.logger.info(`📖 Parsing log: ${options.fromLog}`);
        const logData = this.logParser.parseLog(options.fromLog);
        if (!sequenceId) {
          sequenceId = logData.sequenceId;
        }
        context = logData.context;
      }

      // Play sequence
      const result = await this.engine.play(sequenceId, context, {
        mockServices: options.mock ? options.mock.split(",") : [],
        mockBeats: options.mockBeat ? options.mockBeat.split(",").map(Number) : [],
      });

      // Generate report
      const report = this.reporter.generate(result);
      this.logger.info(report);

      // Save output if requested
      if (options.output) {
        fs.writeFileSync(options.output, JSON.stringify(result, null, 2));
        this.logger.success(`✅ Report saved to ${options.output}`);
      }

      // Compare with previous run if requested
      if (options.compare) {
        const comparison = this.reporter.compare(result, options.compare);
        this.logger.info(comparison);
      }
    } catch (error) {
      this.logger.error("❌ Play failed:", error);
      process.exit(1);
    }
  }

  private async handleList(options: any): Promise<void> {
    try {
      const sequences = await this.engine.listSequences();
      if (options.json) {
        console.log(JSON.stringify(sequences, null, 2));
      } else {
        this.logger.info(`📚 Available sequences: ${sequences.length}`);
        sequences.forEach((seq: any) => {
          this.logger.info(`  - ${seq.id}: ${seq.name}`);
        });
      }
    } catch (error) {
      this.logger.error("❌ List failed:", error);
      process.exit(1);
    }
  }

  private async handleParseLog(options: any): Promise<void> {
    try {
      if (!options.file) {
        this.logger.error("❌ Must provide --file");
        process.exit(1);
      }

      this.logger.info(`📖 Parsing log: ${options.file}`);
      const sequences = this.logParser.extractSequences(options.file);

      if (options.output) {
        fs.writeFileSync(options.output, JSON.stringify(sequences, null, 2));
        this.logger.success(`✅ Extracted ${sequences.length} sequences to ${options.output}`);
      } else {
        this.logger.info(`📊 Found ${sequences.length} sequences`);
        sequences.forEach((seq: any) => {
          this.logger.info(`  - ${seq.id}: ${seq.beats.length} beats`);
        });
      }
    } catch (error) {
      this.logger.error("❌ Parse failed:", error);
      process.exit(1);
    }
  }

  public run(): void {
    this.program.parse(process.argv);
  }
}

// Main entry point
const cli = new SequencePlayerCLI();
cli.run();

