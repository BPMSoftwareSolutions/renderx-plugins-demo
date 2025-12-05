/**
 * CDP Handlers Package
 *
 * Provides executable handlers for SAFe Continuous Delivery Pipeline practices.
 * Each handler implements capabilities like audit, build, deploy, report, validate,
 * measure, learn, and rollback.
 *
 * Four CDP Aspects:
 * - Continuous Exploration: Architect, Collaborate & Research, Hypothesize, Synthesize
 * - Continuous Integration: Develop, Build, Test End-to-End, Stage
 * - Continuous Deployment: Deploy, Verify, Monitor, Respond
 * - Release on Demand: Release, Stabilize, Measure, Learn
 */

export * from './types';
export { CDPHandlerRegistry, createHandlerRegistry } from './registry';

// Continuous Exploration handlers
export { handler as innovationAccountingHandler } from './continuous-exploration/hypothesize/innovation-accounting';

// Continuous Integration handlers
export { handler as trunkBasedDevelopmentHandler } from './continuous-integration/build/trunk-based-development';

// Continuous Deployment handlers
export { handler as deploymentAutomationHandler } from './continuous-deployment/deploy/deployment-automation';

// Release on Demand handlers
export { handler as darkLaunchesHandler } from './release-on-demand/release/dark-launches';
export { handler as failoverDisasterRecoveryHandler } from './release-on-demand/stabilize/failover-disaster-recovery';
export { handler as applicationTelemetryHandler } from './release-on-demand/measure/application-telemetry';
export { handler as relentlessImprovementHandler } from './release-on-demand/learn/relentless-improvement';

