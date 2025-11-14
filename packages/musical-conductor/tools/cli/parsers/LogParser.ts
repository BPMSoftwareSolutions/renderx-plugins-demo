/**
 * LogParser - Parse production logs to extract sequences and context
 */

import * as fs from "fs";
import * as readline from "readline";

export interface ExtractedSequence {
  id: string;
  beats: number;
  startTime: string;
  endTime: string;
  duration: number;
  events: string[];
}

export interface LogData {
  sequenceId: string;
  context: any;
}

export class LogParser {
  /**
   * Parse a production log file and extract sequence information
   */
  parseLog(filePath: string): LogData {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Log file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    // Extract sequence ID from log
    const sequenceMatch = lines.find((line) =>
      line.includes("SequenceExecutor: Executing sequence")
    );

    if (!sequenceMatch) {
      throw new Error("Could not find sequence in log");
    }

    // Parse sequence ID
    const sequenceId = this.extractSequenceId(sequenceMatch);

    // Extract context from log
    const context = this.extractContext(lines);

    return { sequenceId, context };
  }

  /**
   * Extract all sequences from a log file
   */
  extractSequences(filePath: string): ExtractedSequence[] {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Log file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    const sequences: ExtractedSequence[] = [];
    const sequenceMap = new Map<string, ExtractedSequence>();

    lines.forEach((line) => {
      // Look for sequence start
      if (line.includes("SequenceExecutor: Executing sequence")) {
        const sequenceId = this.extractSequenceId(line);
        if (!sequenceMap.has(sequenceId)) {
          sequenceMap.set(sequenceId, {
            id: sequenceId,
            beats: 0,
            startTime: this.extractTimestamp(line),
            endTime: "",
            duration: 0,
            events: [],
          });
        }
      }

      // Look for beat execution
      if (line.includes("BeatExecutor: Executing beat")) {
        const beatNum = this.extractBeatNumber(line);
        const lastSeq = Array.from(sequenceMap.values()).pop();
        if (lastSeq && beatNum > lastSeq.beats) {
          lastSeq.beats = beatNum;
        }
      }

      // Look for events
      if (line.includes("EventBus: Emitting event")) {
        const event = this.extractEventName(line);
        const lastSeq = Array.from(sequenceMap.values()).pop();
        if (lastSeq && event) {
          lastSeq.events.push(event);
        }
      }

      // Look for sequence completion
      if (line.includes("SequenceExecutor: Sequence completed")) {
        const lastSeq = Array.from(sequenceMap.values()).pop();
        if (lastSeq) {
          lastSeq.endTime = this.extractTimestamp(line);
          lastSeq.duration = this.calculateDuration(
            lastSeq.startTime,
            lastSeq.endTime
          );
        }
      }
    });

    return Array.from(sequenceMap.values());
  }

  private extractSequenceId(line: string): string {
    const match = line.match(/sequence[:\s]+([a-zA-Z0-9\-_]+)/i);
    return match ? match[1] : "unknown";
  }

  private extractBeatNumber(line: string): number {
    const match = line.match(/beat\s+(\d+)/i);
    return match ? parseInt(match[1], 10) : 0;
  }

  private extractEventName(line: string): string | null {
    const match = line.match(/event[:\s]+([a-zA-Z0-9\-_:.]+)/i);
    return match ? match[1] : null;
  }

  private extractTimestamp(line: string): string {
    const match = line.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    return match ? match[0] : new Date().toISOString();
  }

  private calculateDuration(startTime: string, endTime: string): number {
    try {
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      return Math.max(0, end - start);
    } catch {
      return 0;
    }
  }

  private extractContext(lines: string[]): any {
    const context: any = {};

    // Extract relevant context from log lines
    lines.forEach((line) => {
      if (line.includes("data:") || line.includes("context:")) {
        try {
          const match = line.match(/\{.*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            Object.assign(context, parsed);
          }
        } catch {
          // Ignore parse errors
        }
      }
    });

    return context;
  }
}

