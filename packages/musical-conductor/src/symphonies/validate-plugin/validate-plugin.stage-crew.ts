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
  
  if (!plugin.name) {
    throw new Error("Plugin must have a name");
  }
  
  if (!plugin.version) {
    (globalThis as any).__MC_WARN(`⚠️ Plugin "${plugin.name}" missing version field`);
  }
  
  ctx.payload.shapeValid = true;
  (globalThis as any).__MC_LOG(`✅ Plugin shape validated: "${plugin.name}"`);
};

/** Movement 1, Beat 2: Check plugin manifest */
export const checkManifest = (data: any, ctx: any) => {
  const plugin: SPAPlugin = ctx.payload.plugin;
  
  const manifestFields = ['name', 'version', 'type', 'sequences'];
  const missingFields: string[] = [];
  
  manifestFields.forEach(field => {
    if (!(field in plugin)) {
      missingFields.push(field);
    }
  });
  
  if (missingFields.length > 0) {
    (globalThis as any).__MC_WARN(
      `⚠️ Plugin "${plugin.name}" missing manifest fields: ${missingFields.join(', ')}`
    );
    ctx.payload.manifestComplete = false;
    ctx.payload.missingFields = missingFields;
  } else {
    ctx.payload.manifestComplete = true;
  }
  
  (globalThis as any).__MC_LOG(`✅ Manifest checked: "${plugin.name}"`);
};

/** Movement 1, Beat 3: Verify exported sequences */
export const verifyExports = (data: any, ctx: any) => {
  const plugin: SPAPlugin = ctx.payload.plugin;
  
  if (!plugin.sequences || !Array.isArray(plugin.sequences)) {
    throw new Error(`Plugin "${plugin.name}" must export sequences array`);
  }
  
  if (plugin.sequences.length === 0) {
    (globalThis as any).__MC_WARN(`⚠️ Plugin "${plugin.name}" exports empty sequences array`);
  }
  
  ctx.payload.sequenceCount = plugin.sequences.length;
  ctx.payload.exportsValid = true;
  
  (globalThis as any).__MC_LOG(
    `✅ Exports verified: "${plugin.name}" provides ${plugin.sequences.length} sequences`
  );
};

/** Movement 2, Beat 1: Check SPA compliance */
export const checkSPACompliance = (data: any, ctx: any) => {
  const plugin: SPAPlugin = ctx.payload.plugin;
  const violations: string[] = [];
  
  // Check for SPA compliance markers
  if (!plugin.type || !['symphony', 'orchestration', 'utility'].includes(plugin.type)) {
    violations.push('Plugin type must be symphony, orchestration, or utility');
  }
  
  // Check for proper handler structure
  plugin.sequences?.forEach((seq: any, idx: number) => {
    if (!seq.movements || !Array.isArray(seq.movements)) {
      violations.push(`Sequence ${idx + 1} missing movements array`);
    }
    
    seq.movements?.forEach((mov: any, movIdx: number) => {
      if (!mov.beats || !Array.isArray(mov.beats)) {
        violations.push(`Sequence ${idx + 1}, Movement ${movIdx + 1} missing beats array`);
      }
    });
  });
  
  if (violations.length > 0) {
    ctx.payload.spaCompliant = false;
    ctx.payload.spaViolations = violations;
    (globalThis as any).__MC_WARN(
      `⚠️ SPA compliance violations in "${plugin.name}": ${violations.join('; ')}`
    );
  } else {
    ctx.payload.spaCompliant = true;
    (globalThis as any).__MC_LOG(`✅ SPA compliance verified: "${plugin.name}"`);
  }
};

/** Movement 2, Beat 2: Validate handler contracts */
export const validateHandlerContracts = (data: any, ctx: any) => {
  const plugin: SPAPlugin = ctx.payload.plugin;
  const contractErrors: string[] = [];
  
  plugin.sequences?.forEach((seq: any, seqIdx: number) => {
    seq.movements?.forEach((mov: any, movIdx: number) => {
      mov.beats?.forEach((beat: any, beatIdx: number) => {
        // Check handler signature
        if (!beat.handler && !beat.handlerName) {
          contractErrors.push(
            `Seq ${seqIdx + 1}, Mov ${movIdx + 1}, Beat ${beatIdx + 1}: Missing handler`
          );
        }
        
        // Check beat ID
        if (!beat.id) {
          contractErrors.push(
            `Seq ${seqIdx + 1}, Mov ${movIdx + 1}, Beat ${beatIdx + 1}: Missing beat ID`
          );
        }
        
        // Validate handler is callable
        if (beat.handler && typeof beat.handler !== 'function') {
          contractErrors.push(
            `Seq ${seqIdx + 1}, Mov ${movIdx + 1}, Beat ${beatIdx + 1}: Handler not a function`
          );
        }
      });
    });
  });
  
  if (contractErrors.length > 0) {
    ctx.payload.contractsValid = false;
    ctx.payload.contractErrors = contractErrors;
    throw new Error(`Handler contract violations: ${contractErrors.join('; ')}`);
  } else {
    ctx.payload.contractsValid = true;
    (globalThis as any).__MC_LOG(`✅ Handler contracts validated: "${plugin.name}"`);
  }
};

/** Movement 2, Beat 3: Verify beat-to-handler mapping */
export const verifyBeatMapping = (data: any, ctx: any) => {
  const plugin: SPAPlugin = ctx.payload.plugin;
  let totalBeats = 0;
  let mappedHandlers = 0;
  
  plugin.sequences?.forEach((seq: any) => {
    seq.movements?.forEach((mov: any) => {
      mov.beats?.forEach((beat: any) => {
        totalBeats++;
        if (beat.handler || beat.handlerName) {
          mappedHandlers++;
        }
      });
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
  
  // Check for resource declarations in sequences
  const resourceDeclarations: string[] = [];
  
  plugin.sequences?.forEach((seq: any) => {
    if (seq.resources && Array.isArray(seq.resources)) {
      resourceDeclarations.push(...seq.resources);
    }
  });
  
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
  
  plugin.sequences?.forEach((seq: any, idx: number) => {
    if (seq.priority && !validPriorities.includes(seq.priority)) {
      invalidPriorities.push(`Sequence ${idx + 1}: "${seq.priority}"`);
    }
  });
  
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
    pluginName: plugin.name,
    pluginVersion: plugin.version,
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
  
  (globalThis as any).__MC_LOG(`📋 Validation report generated for "${plugin.name}"`);
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
