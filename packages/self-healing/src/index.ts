/**
 * Self-Healing System Plugin
 * 
 * Detects, diagnoses, fixes, and learns from production issues autonomously.
 * 
 * Features:
 * - Telemetry parsing from production logs
 * - Anomaly detection (performance, behavioral, coverage, errors)
 * - Root cause diagnosis
 * - Automatic fix generation (code, tests, docs)
 * - Fix validation and testing
 * - Automated deployment
 * - Learning and optimization
 */

// Re-export internal TypeScript sources (omit extensions so the declaration build includes them)
export * from './handlers/index';
export * from './types/index';
export * from './plugin';

// Re-export sequences for manifest registration
export { default as telemetryParseSequence } from '../json-sequences/telemetry.parse.json';
export { default as anomalyDetectSequence } from '../json-sequences/anomaly.detect.json';
export { default as diagnosisAnalyzeSequence } from '../json-sequences/diagnosis.analyze.json';
export { default as fixGenerateSequence } from '../json-sequences/fix.generate.json';
export { default as validationRunSequence } from '../json-sequences/validation.run.json';
export { default as deploymentDeploySequence } from '../json-sequences/deployment.deploy.json';
export { default as learningTrackSequence } from '../json-sequences/learning.track.json';

