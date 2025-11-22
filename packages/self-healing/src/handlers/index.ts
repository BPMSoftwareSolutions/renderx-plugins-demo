/**
 * Self-Healing System Handlers
 * 
 * Organized by sequence:
 * - Telemetry Parsing (7 handlers)
 * - Anomaly Detection (9 handlers)
 * - Diagnosis (11 handlers)
 * - Fix Generation (9 handlers)
 * - Validation (10 handlers)
 * - Deployment (11 handlers)
 * - Learning (10 handlers)
 * 
 * Total: 67 handlers
 */

// Telemetry Parsing Handlers
export * from './telemetry/parse.requested.js';
export * from './telemetry/load.logs.js';
export * from './telemetry/extract.events.js';
export * from './telemetry/normalize.data.js';
export * from './telemetry/aggregate.metrics.js';
export * from './telemetry/store.database.js';
export * from './telemetry/parse.completed.js';

// Anomaly Detection Handlers
export * from './anomaly/detect.requested.js';
export * from './anomaly/load.telemetry.js';
export * from './anomaly/detect.performance.js';
export * from './anomaly/detect.behavioral.js';
export * from './anomaly/detect.coverage.js';
export * from './anomaly/detect.errors.js';
export * from './anomaly/aggregate.results.js';
export * from './anomaly/store.results.js';
export * from './anomaly/detect.completed.js';

// Diagnosis Handlers
export * from './diagnosis/analyze.requested.js';
export * from './diagnosis/load.anomalies.js';
export * from './diagnosis/load.codebase.js';
export * from './diagnosis/analyze.performance.js';
export * from './diagnosis/analyze.behavioral.js';
export * from './diagnosis/analyze.coverage.js';
export * from './diagnosis/analyze.errors.js';
export * from './diagnosis/assess.impact.js';
export * from './diagnosis/recommend.fixes.js';
export * from './diagnosis/store.diagnosis.js';
export * from './diagnosis/analyze.completed.js';

// Fix Generation Handlers
export * from './fix/generate.requested.js';
export * from './fix/load.diagnosis.js';
export * from './fix/generate.code.js';
export * from './fix/generate.test.js';
export * from './fix/generate.documentation.js';
export * from './fix/create.patch.js';
export * from './fix/validate.syntax.js';
export * from './fix/store.patch.js';
export * from './fix/generate.completed.js';

// Validation Handlers
export * from './validation/validate.requested.js';
export * from './validation/load.patch.js';
export * from './validation/apply.patch.js';
export * from './validation/run.tests.js';
export * from './validation/check.coverage.js';
export * from './validation/verify.performance.js';
export * from './validation/validate.documentation.js';
export * from './validation/aggregate.results.js';
export * from './validation/store.results.js';
export * from './validation/validate.completed.js';

// Deployment Handlers
export * from './deployment/deploy.requested.js';
export * from './deployment/load.validation.js';
export * from './deployment/check.approval.js';
export * from './deployment/create.branch.js';
export * from './deployment/apply.changes.js';
export * from './deployment/create.pr.js';
export * from './deployment/run.ci.js';
export * from './deployment/auto.merge.js';
export * from './deployment/deploy.production.js';
export * from './deployment/verify.deployment.js';
export * from './deployment/deploy.completed.js';

// Learning Handlers
export * from './learning/track.requested.js';
export * from './learning/load.deployment.js';
export * from './learning/collect.metrics.js';
export * from './learning/compare.metrics.js';
export * from './learning/calculate.improvement.js';
export * from './learning/assess.success.js';
export * from './learning/update.models.js';
export * from './learning/generate.insights.js';
export * from './learning/store.effectiveness.js';
export * from './learning/track.completed.js';

