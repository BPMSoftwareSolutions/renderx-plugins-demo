/**
 * VALIDATE-PLUGIN Symphony - Stage Crew
 * Handlers for validating SPA/CIA-compliant plugins
 * 
 * Movement 1 (Shape): validatePluginShape, checkManifest, verifyExports
 * Movement 2 (Compliance): checkSPACompliance, validateHandlerContracts, verifyBeatMapping
 * Movement 3 (Resources): checkResourceRequirements, validatePriorities
 * Movement 4 (Report): generateValidationReport, logResults
 */

import type { SPAPlugin } from "../../../modules/communication/sequences/plugins/PluginInterfaceFacade.js";

/** Movement 1, Beat 1: Validate plugin shape */
export const validatePluginShape = (data: any, ctx: any) => {
  const plugin: SPAPlugin = ctx.payload.plugin;
  
  if (!plugin) {
    throw new Error("Plugin cannot be null or undefined");
  }
  const pluginName = plugin.metadata?.id ?? "unknown-plugin";
  const pluginVersion = plugin.metadata?.version;
  if (!plugin.metadata?.id) {
    throw new Error("Plugin must have a metadata.id");
  }
  if (!pluginVersion) {
    (globalThis as any).__MC_WARN(`⚠️ Plugin "${pluginName}" missing version field`);
  }
  
  ctx.payload.shapeValid = true;
  (globalThis as any).__MC_LOG(`✅ Plugin shape validated: "${pluginName}"`);
};

/** Movement 1, Beat 2: Check plugin manifest */
export const checkManifest = (data: any, ctx: any) => {
  const plugin: SPAPlugin = ctx.payload.plugin;
  const pluginName = plugin.metadata?.id ?? "unknown-plugin";
  
  const manifestFields = ['metadata.id', 'metadata.version', 'sequence'];
  const missingFields: string[] = [];
  
  manifestFields.forEach(field => {
    if (field === 'metadata.id' && !plugin.metadata?.id) {
      missingFields.push('metadata.id');
      return;
    }
    if (field === 'metadata.version' && !plugin.metadata?.version) {
      missingFields.push('metadata.version');
      return;
    }
    if (field === 'sequence' && !plugin.sequence) {
      missingFields.push('sequence');
      return;
    }
  });
  
  if (missingFields.length > 0) {
    (globalThis as any).__MC_WARN(
      `⚠️ Plugin "${pluginName}" missing manifest fields: ${missingFields.join(', ')}`
    );
    ctx.payload.manifestComplete = false;
    ctx.payload.missingFields = missingFields;
  } else {
    ctx.payload.manifestComplete = true;
  }
  
  (globalThis as any).__MC_LOG(`✅ Manifest checked: "${pluginName}"`);
};

/** Movement 1, Beat 3: Verify exported sequences */
export const verifyExports = (data: any, ctx: any) => {
  const plugin: SPAPlugin = ctx.payload.plugin;
  const pluginName = plugin.metadata?.id ?? "unknown-plugin";
  
  if (!plugin.sequence) {
    throw new Error(`Plugin "${pluginName}" must export a sequence`);
  }
  
  ctx.payload.sequenceCount = 1;
  ctx.payload.exportsValid = true;
  
  (globalThis as any).__MC_LOG(
    `✅ Exports verified: "${pluginName}" provides 1 sequence`
  );
};

/** Movement 2, Beat 1: Check SPA compliance */
export const checkSPACompliance = (data: any, ctx: any) => {
  const plugin: SPAPlugin = ctx.payload.plugin;
  const pluginName = plugin.metadata?.id ?? "unknown-plugin";
  const violations: string[] = [];
  
  if (!plugin.sequence) {
    violations.push('Plugin must provide a sequence');
  }
  const seq = (plugin.sequence as any) || {};
  if (!seq.movements || !Array.isArray(seq.movements)) {
    violations.push(`Sequence missing movements array`);
  } else {
    seq.movements.forEach((mov: any, movIdx: number) => {
      if (!mov.beats || !Array.isArray(mov.beats)) {
        violations.push(`Movement ${movIdx + 1} missing beats array`);
      }
    });
  }
  
  if (violations.length > 0) {
    ctx.payload.spaCompliant = false;
    ctx.payload.spaViolations = violations;
    (globalThis as any).__MC_WARN(
      `⚠️ SPA compliance violations in "${pluginName}": ${violations.join('; ')}`
    );
  } else {
    ctx.payload.spaCompliant = true;
    (globalThis as any).__MC_LOG(`✅ SPA compliance verified: "${pluginName}"`);
  }
};

/** Movement 2, Beat 2: Validate handler contracts */
export const validateHandlerContracts = (data: any, ctx: any) => {
  const plugin: SPAPlugin = ctx.payload.plugin;
  const pluginName = plugin.metadata?.id ?? "unknown-plugin";
  const contractErrors: string[] = [];
  
  const seq = plugin.sequence as any;
  seq.movements?.forEach((mov: any, movIdx: number) => {
    mov.beats?.forEach((beat: any, beatIdx: number) => {
      // Validate beat structure per SequenceTypes
      if (beat.beat === undefined || beat.beat === null) {
        contractErrors.push(`Mov ${movIdx + 1}, Beat ${beatIdx + 1}: Missing beat number`);
      }
      if (!beat.event || typeof beat.event !== 'string') {
        contractErrors.push(`Mov ${movIdx + 1}, Beat ${beatIdx + 1}: Missing event type`);
      }
    });
  });
  
  if (contractErrors.length > 0) {
    ctx.payload.contractsValid = false;
    ctx.payload.contractErrors = contractErrors;
    throw new Error(`Handler contract violations: ${contractErrors.join('; ')}`);
  } else {
    ctx.payload.contractsValid = true;
    (globalThis as any).__MC_LOG(`✅ Handler contracts validated: "${pluginName}"`);
  }
};

/** Movement 2, Beat 3: Verify beat-to-handler mapping */
export const verifyBeatMapping = (data: any, ctx: any) => {
  const plugin: SPAPlugin = ctx.payload.plugin;
  let totalBeats = 0;
  let mappedHandlers = 0;
  
  const seq = plugin.sequence as any;
  seq.movements?.forEach((mov: any) => {
    mov.beats?.forEach((beat: any) => {
      totalBeats++;
      if (beat.event) {
        mappedHandlers++;
      }
    });
  });
  
  ctx.payload.totalBeats = totalBeats;
  ctx.payload.mappedHandlers = mappedHandlers;
  ctx.payload.unmappedBeats = totalBeats - mappedHandlers;
  
  if (mappedHandlers === totalBeats) {
    (globalThis as any).__MC_LOG(
      `✅ Beat mapping complete: All ${totalBeats} beats have handlers`
    );
  } else {
    (globalThis as any).__MC_WARN(
      `⚠️ Incomplete mapping: ${mappedHandlers}/${totalBeats} beats have handlers`
    );
  }
};

/** Movement 3, Beat 1: Check resource requirements */
export const checkResourceRequirements = (data: any, ctx: any) => {
  const plugin: SPAPlugin = ctx.payload.plugin;
  
  const resourceDeclarations: string[] = [];
  const seq = plugin.sequence as any;
  if (seq.resources && Array.isArray(seq.resources)) {
    resourceDeclarations.push(...seq.resources);
  }
  
  ctx.payload.requiredResources = [...new Set(resourceDeclarations)];
  (globalThis as any).__MC_LOG(
    `✅ Resource requirements: ${ctx.payload.requiredResources.length} unique resources`
  );
};

/** Movement 3, Beat 2: Validate priority settings */
export const validatePriorities = (data: any, ctx: any) => {
  const plugin: SPAPlugin = ctx.payload.plugin;
  const validPriorities = ['HIGH', 'NORMAL', 'CHAINED'];
  const invalidPriorities: string[] = [];
  
  const seq = plugin.sequence as any;
  if (seq.priority && !validPriorities.includes(seq.priority)) {
    invalidPriorities.push(`Sequence: "${seq.priority}"`);
  }
  
  if (invalidPriorities.length > 0) {
    (globalThis as any).__MC_WARN(
      `⚠️ Invalid priorities: ${invalidPriorities.join('; ')}`
    );
    ctx.payload.prioritiesValid = false;
  } else {
    ctx.payload.prioritiesValid = true;
    (globalThis as any).__MC_LOG(`✅ Priorities validated`);
  }
};

/** Movement 4, Beat 1: Generate validation report */
export const generateValidationReport = (data: any, ctx: any) => {
  const { plugin, shapeValid, manifestComplete, exportsValid, spaCompliant, 
          contractsValid, totalBeats, mappedHandlers, requiredResources, prioritiesValid } = ctx.payload;
  
  const report = {
    pluginName: plugin.metadata?.id ?? "unknown-plugin",
    pluginVersion: plugin.metadata?.version ?? "unknown",
    timestamp: Date.now(),
    validation: {
      shape: shapeValid,
      manifest: manifestComplete,
      exports: exportsValid,
      spaCompliance: spaCompliant,
      handlerContracts: contractsValid,
      priorities: prioritiesValid,
    },
    metrics: {
      sequenceCount: ctx.payload.sequenceCount || 0,
      totalBeats: totalBeats || 0,
      mappedHandlers: mappedHandlers || 0,
      unmappedBeats: (totalBeats || 0) - (mappedHandlers || 0),
      requiredResources: (requiredResources || []).length,
    },
    issues: {
      spaViolations: ctx.payload.spaViolations || [],
      contractErrors: ctx.payload.contractErrors || [],
      missingFields: ctx.payload.missingFields || [],
    },
  };
  
  ctx.payload.validationReport = report;
  ctx.payload.isValid = shapeValid && exportsValid && spaCompliant && contractsValid;
  
  (globalThis as any).__MC_LOG(`📋 Validation report generated for "${report.pluginName}"`);
};

/** Movement 4, Beat 2: Log validation results */
export const logResults = (data: any, ctx: any) => {
  const { validationReport, isValid } = ctx.payload;
  
  if (isValid) {
    (globalThis as any).__MC_LOG(
      `✅✅✅ Plugin validated successfully: "${validationReport.pluginName}" | ` +
      `${validationReport.metrics.sequenceCount} sequences | ` +
      `${validationReport.metrics.totalBeats} beats | ` +
      `${validationReport.metrics.requiredResources} resources`
    );
  } else {
    (globalThis as any).__MC_ERROR(
      `❌ Plugin validation failed: "${validationReport.pluginName}" | ` +
      `Issues: ${validationReport.issues.spaViolations.length} SPA + ` +
      `${validationReport.issues.contractErrors.length} contract + ` +
      `${validationReport.issues.missingFields.length} missing fields`
    );
  }
  
  ctx.payload.validationComplete = true;
};

// Export handlers for JSON sequence mounting
export const handlers = {
  validatePluginShape,
  checkManifest,
  verifyExports,
  checkSPACompliance,
  validateHandlerContracts,
  verifyBeatMapping,
  checkResourceRequirements,
  validatePriorities,
  generateValidationReport,
  logResults,
};
