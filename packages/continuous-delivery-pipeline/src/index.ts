/**
 * CDP Handlers Package
 * 
 * Provides executable handlers for SAFe Continuous Delivery Pipeline practices.
 * Each handler implements capabilities like audit, build, deploy, report, validate,
 * measure, learn, and rollback.
 */

export * from './types';
export { CDPHandlerRegistry, createHandlerRegistry } from './registry';

// Re-export example handlers
export { handler as trunkBasedDevelopmentHandler } from './continuous-integration/build/trunk-based-development';
export { handler as deploymentAutomationHandler } from './continuous-deployment/deploy/deployment-automation';
export { handler as innovationAccountingHandler } from './continuous-exploration/hypothesize/innovation-accounting';

