/**
 * SequencePlayerEngine - Core engine for playing sequences and measuring performance
 * Connects to the running browser conductor via WebSocket
 */

import WebSocket from 'ws';

export interface PlayOptions {
  mockServices?: string[];
  mockBeats?: number[];
}

export interface PlayResult {
  sequenceId: string;
  sequenceName: string;
  mode: "full-integration" | "mocked";
  mockServices: string[];
  mockBeats: number[];
  startTime: number;
  endTime: number;
  duration: number;
  beats: BeatTiming[];
  totalBeats: number;
  errors: any[];
  status: "success" | "failed";
}

export interface BeatTiming {
  beat: number;
  event: string;
  handler?: string;
  kind?: string;
  timing?: string;
  startTime: number;
  endTime: number;
  duration: number;
  isMocked: boolean;
}

export class SequencePlayerEngine {
  private ws: WebSocket | null = null;
  private wsUrl: string = 'ws://localhost:5173/conductor-ws';
  private beatTimings: Map<number, BeatTiming> = new Map();

  constructor() {
    // Connect to the running browser conductor via WebSocket
  }

  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.on('open', () => {
        console.log('✅ Connected to browser conductor');
        resolve();
      });

      this.ws.on('error', (error: Error) => {
        console.error('❌ WebSocket connection failed:', error.message);
        reject(new Error('Failed to connect to running browser. Make sure dev server is running on http://localhost:5173'));
      });

      this.ws.on('close', () => {
        console.log('🔌 Disconnected from browser conductor');
      });
    });
  }

  private async sendCommand(command: any): Promise<any> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.connectWebSocket();
    }

    return new Promise((resolve, reject) => {
      const id = `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const message = { ...command, id };

      const timeout = setTimeout(() => {
        reject(new Error('Command timeout'));
      }, 30000);

      this.ws!.once('message', (data: Buffer) => {
        clearTimeout(timeout);
        try {
          const response = JSON.parse(data.toString());
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });

      this.ws!.send(JSON.stringify(message));
    });
  }

  async play(
    sequenceId: string,
    context: any = {},
    options: PlayOptions = {}
  ): Promise<PlayResult> {
    const startTime = Date.now();
    this.beatTimings.clear();

    try {
      console.log(`🎵 Sending play command to browser: ${sequenceId}`);

      // Send play command to browser conductor via WebSocket
      await this.sendCommand({
        type: 'play',
        pluginId: 'CanvasComponentPlugin', // TODO: Make this configurable
        sequenceId,
        context,
      });

      const endTime = Date.now();

      // For now, return basic timing info
      // TODO: Get actual beat timings from browser
      return {
        sequenceId,
        sequenceName: sequenceId,
        mode: options.mockServices?.length ? "mocked" : "full-integration",
        mockServices: options.mockServices || [],
        mockBeats: options.mockBeats || [],
        startTime,
        endTime,
        duration: endTime - startTime,
        beats: [],
        totalBeats: 0,
        errors: [],
        status: "success",
      };
    } catch (error) {
      const endTime = Date.now();
      return {
        sequenceId,
        sequenceName: "",
        mode: "full-integration",
        mockServices: options.mockServices || [],
        mockBeats: options.mockBeats || [],
        startTime,
        endTime,
        duration: endTime - startTime,
        beats: [],
        totalBeats: 0,
        errors: [error instanceof Error ? error.message : String(error)],
        status: "failed",
      };
    }
  }

  async listSequences(): Promise<any[]> {
    try {
      console.log('📋 Requesting sequence list from browser...');
      await this.sendCommand({ type: 'list' });

      // For now, return empty array
      // TODO: Get actual sequence list from browser
      return [];
    } catch (error) {
      console.error('❌ Failed to list sequences:', error);
      return [];
    }
  }

}

