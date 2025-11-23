import { describe, it, expect } from 'vitest';
import { loadAnomalies } from '../../src/handlers/diagnosis/load.anomalies';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Business BDD Test: loadAnomalies
 * 
 * User Story:
 * As a Platform Team
 * I want to Retrieve detected anomalies
 * 
 * Handler Type: loadAnomalies
 * Sequence: diagnosis
 * 
 * This test validates business value and user outcomes,
 * not just technical implementation details.
 */

describe('Business BDD: loadAnomalies', () => {

  describe('Scenario: Load anomalies from generated persistence for analysis', () => {
    it('loads anomalies when file exists and provides structured envelope (Given anomalies stored, When load runs, Then anomalies available for analysis)', () => {
      // GIVEN anomalies file with sample anomalies
      const genDir = path.resolve(process.cwd(), '.generated');
      if (!fs.existsSync(genDir)) fs.mkdirSync(genDir, { recursive: true });
      const filePath = path.join(genDir, 'anomalies.json');
      const sample = { timestamp: new Date().toISOString(), anomalies: [
        { id: 'a1', type: 'performance', severity: 'high', handler: 'resizeOverlay', description: 'Latency spike', metrics: { latencyRatio: 3.2 }, detectedAt: new Date().toISOString(), confidence: 0.87 },
        { id: 'a2', type: 'error', severity: 'medium', handler: 'exportGif', description: 'Error rate increased', metrics: { errorRateDelta: 0.15 }, detectedAt: new Date().toISOString(), confidence: 0.74 }
      ]};
      fs.writeFileSync(filePath, JSON.stringify(sample, null, 2), 'utf8');

      // WHEN loadAnomalies executes
      const evt = loadAnomalies();

      // THEN anomalies are available for diagnosis
      expect(evt).toBeDefined();
      expect(evt.handler).toBe('loadAnomalies');
      expect(evt.event).toBe('diagnosis.load.anomalies');
      expect(evt.context.filePath).toBe(filePath);
      expect(evt.context.missing).toBe(false);
      expect(evt.context.count).toBe(2);
      expect(Array.isArray(evt.context.anomalies)).toBe(true);
      expect(evt.context.anomalies[0].type).toBe('performance');
    });

    it('returns empty list with missing=true when file absent (resilient initiation)', () => {
      // GIVEN anomalies file removed
      const filePath = path.resolve(process.cwd(), '.generated', 'anomalies.json');
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      // WHEN loadAnomalies executes
      const evt = loadAnomalies();

      // THEN graceful fallback
      expect(evt.context.missing).toBe(true);
      expect(evt.context.count).toBe(0);
      expect(evt.context.anomalies).toEqual([]);
    });
  });
});
