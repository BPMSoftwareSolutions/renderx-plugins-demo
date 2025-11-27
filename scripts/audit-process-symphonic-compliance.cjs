#!/usr/bin/env node

/**
 * Symphonic Process Compliance Audit
 * 
 * Scans all processes (scripts, pipelines, npm scripts) to identify:
 * 1. Which processes lack symphonic structure (movements/beats)
 * 2. Which processes should be wrapped in symphonies
 * 3. Which processes ARE symphonic
 * 
 * Governance Rule: "All domains must be symphonic"
 * This means: ANY process that governs/orchestrates operations MUST have:
 *   - Movements (phases)
 *   - Beats (discrete operations within movements)
 *   - Telemetry at each beat
 *   - Registration in orchestration-domains.json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const scriptsDir = path.join(rootDir, 'scripts');
const orchDomainsPath = path.join(rootDir, 'orchestration-domains.json');
const packageJsonPath = path.join(rootDir, 'package.json');
const outputPath = path.join(rootDir, 'process-symphonic-compliance-audit.json');

// Process categories
const PROCESS_CATEGORIES = {
  GENERATION: 'generation',          // Generates outputs (docs, manifests, etc.)
  VALIDATION: 'validation',          // Validates integrity, governance, compliance
  ORCHESTRATION: 'orchestration',    // Orchestrates multi-step processes
  BUILD: 'build',                    // Build-related tasks
  UTILITY: 'utility',                // Helpers, helpers, one-off tools
  TESTING: 'testing',                // Test-related utilities
  ANALYSIS: 'analysis'               // Analysis and reporting
};

// Symphonic compliance levels
const COMPLIANCE_LEVELS = {
  SYMPHONIC: 'symphonic',                    // Has movements/beats, registered
  PARTIAL_SYMPHONIC: 'partial-symphonic',    // Has symphony but not registered
  NON_SYMPHONIC: 'non-symphonic',            // No symphonic structure
  SHOULD_BE_SYMPHONIC: 'should-be-symphonic' // Process type requires symphonic structure
};

class ProcessAudit {
  constructor() {
    this.audit = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalProcesses: 0,
        symphonic: 0,
        partialSymphonic: 0,
        nonSymphonic: 0,
        shouldBeSymphonic: 0,
        complianceScore: 0
      },
      processes: [],
      violations: [],
      recommendations: []
    };
  }

  /**
   * Scan all Node scripts and categorize them
   */
  scanScripts() {
    console.log('📊 Scanning scripts directory...');
    
    const files = fs.readdirSync(scriptsDir);
    const processes = [];

    for (const file of files) {
      if (!file.endsWith('.js') && !file.endsWith('.cjs')) continue;
      
      const filePath = path.join(scriptsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      const process = {
        name: file,
        path: filePath,
        category: this.categorizeScript(file, content),
        symphonic: this.isSymphonic(content),
        registered: this.isRegisteredInDomains(file),
        inNpmScript: this.isInNpmScript(file),
        complexity: this.assessComplexity(content),
        shouldBeSymphonic: false
      };

      // Determine if this SHOULD be symphonic
      const shouldBe = [
        PROCESS_CATEGORIES.ORCHESTRATION,
        PROCESS_CATEGORIES.GENERATION,
        PROCESS_CATEGORIES.VALIDATION
      ].includes(process.category);
      
      process.shouldBeSymphonic = shouldBe;

      // Determine compliance level
      if (process.symphonic && process.registered) {
        process.complianceLevel = COMPLIANCE_LEVELS.SYMPHONIC;
      } else if (process.symphonic && !process.registered) {
        process.complianceLevel = COMPLIANCE_LEVELS.PARTIAL_SYMPHONIC;
      } else if (process.shouldBeSymphonic) {
        process.complianceLevel = COMPLIANCE_LEVELS.SHOULD_BE_SYMPHONIC;
      } else {
        process.complianceLevel = COMPLIANCE_LEVELS.NON_SYMPHONIC;
      }

      processes.push(process);
    }

    return processes;
  }

  /**
   * Extract npm scripts from package.json
   */
  scanNpmScripts() {
    console.log('📊 Scanning npm scripts in package.json...');
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const processes = [];

    for (const [scriptName, scriptCmd] of Object.entries(packageJson.scripts || {})) {
      const process = {
        name: scriptName,
        path: `package.json:scripts.${scriptName}`,
        type: 'npm-script',
        command: scriptCmd,
        category: this.categorizeNpmScript(scriptName, scriptCmd),
        symphonic: this.isSymphonicNpmScript(scriptName, scriptCmd),
        registered: this.isNpmScriptRegisteredInDomains(scriptName),
        inNpmScript: true,
        complexity: this.assessNpmScriptComplexity(scriptCmd),
        shouldBeSymphonic: false
      };

      const shouldBe = [
        PROCESS_CATEGORIES.ORCHESTRATION,
        PROCESS_CATEGORIES.GENERATION,
        PROCESS_CATEGORIES.VALIDATION
      ].includes(process.category);
      
      process.shouldBeSymphonic = shouldBe;

      if (process.symphonic && process.registered) {
        process.complianceLevel = COMPLIANCE_LEVELS.SYMPHONIC;
      } else if (process.symphonic && !process.registered) {
        process.complianceLevel = COMPLIANCE_LEVELS.PARTIAL_SYMPHONIC;
      } else if (process.shouldBeSymphonic) {
        process.complianceLevel = COMPLIANCE_LEVELS.SHOULD_BE_SYMPHONIC;
      } else {
        process.complianceLevel = COMPLIANCE_LEVELS.NON_SYMPHONIC;
      }

      processes.push(process);
    }

    return processes;
  }

  /**
   * Categorize a script by name and content patterns
   */
  categorizeScript(name, content) {
    const lower = name.toLowerCase();

    if (lower.includes('symphony') || lower.includes('orchestrate') || lower.includes('pipeline')) {
      return PROCESS_CATEGORIES.ORCHESTRATION;
    } else if (lower.includes('generate') || lower.includes('gen-')) {
      return PROCESS_CATEGORIES.GENERATION;
    } else if (lower.includes('validate') || lower.includes('verify') || lower.includes('check') || lower.includes('audit')) {
      return PROCESS_CATEGORIES.VALIDATION;
    } else if (lower.includes('build') || lower.includes('build')) {
      return PROCESS_CATEGORIES.BUILD;
    } else if (lower.includes('test')) {
      return PROCESS_CATEGORIES.TESTING;
    } else if (lower.includes('extract') || lower.includes('analyze') || lower.includes('query')) {
      return PROCESS_CATEGORIES.ANALYSIS;
    } else {
      return PROCESS_CATEGORIES.UTILITY;
    }
  }

  /**
   * Check if script has symphonic structure
   */
  isSymphonic(content) {
    const symphonyIndicators = [
      /movements|movement\s*:|"movements"/,
      /beats|beat\s*:|"beats"/,
      /Movement\s+\d+:/,
      /logBeat\s*\(/,
      /recordEvent\s*\(/,
      /telemetry/
    ];

    const matches = symphonyIndicators.filter(pattern => pattern.test(content)).length;
    return matches >= 3; // At least 3 indicators of symphonic structure
  }

  /**
   * Check if npm script is symphonic (calls symphony)
   */
  isSymphonicNpmScript(name, command) {
    const symphonyIndicators = [
      /symphony|symphonic/,
      /orchestrate/,
      /movement/
    ];

    const matches = symphonyIndicators.filter(pattern => pattern.test(command)).length;
    return matches >= 1;
  }

  /**
   * Check if registered in orchestration-domains.json
   */
  isRegisteredInDomains(scriptName) {
    if (!fs.existsSync(orchDomainsPath)) return false;
    
    const domains = JSON.parse(fs.readFileSync(orchDomainsPath, 'utf-8'));
    const scriptNameId = scriptName.replace(/\.(js|cjs)$/, '').replace(/-/g, '-');
    
    return domains.domains?.some(d => 
      d.id.includes(scriptNameId) || 
      d.name.includes(scriptName.replace(/\.(js|cjs)$/, ''))
    );
  }

  /**
   * Check if npm script name references registered domain
   */
  isNpmScriptRegisteredInDomains(scriptName) {
    if (!fs.existsSync(orchDomainsPath)) return false;
    
    const domains = JSON.parse(fs.readFileSync(orchDomainsPath, 'utf-8'));
    
    return domains.domains?.some(d => 
      d.id.includes(scriptName.replace(/:/g, '-')) ||
      d.name.includes(scriptName)
    );
  }

  /**
   * Check if script is in npm scripts
   */
  isInNpmScript(scriptName) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const scriptPrefix = scriptName.replace(/\.(js|cjs)$/, '');
    
    return Object.values(packageJson.scripts || {}).some(cmd => 
      cmd.includes(scriptName)
    );
  }

  /**
   * Assess script complexity
   */
  assessComplexity(content) {
    const lines = content.split('\n').length;
    const functions = (content.match(/^\s*(async\s+)?function\s+\w+/gm) || []).length;
    const handlers = (content.match(/handler|handler\s*:/g) || []).length;

    if (lines < 50) return 'simple';
    if (lines < 200) return 'moderate';
    if (lines < 500) return 'complex';
    return 'very-complex';
  }

  /**
   * Assess npm script complexity
   */
  assessNpmScriptComplexity(command) {
    const segments = command.split(' && ').length;
    const pipes = command.split('|').length;
    
    if (segments === 1 && pipes === 1) return 'simple';
    if (segments <= 3 && pipes <= 2) return 'moderate';
    if (segments <= 8 && pipes <= 4) return 'complex';
    return 'very-complex';
  }

  /**
   * Categorize npm script
   */
  categorizeNpmScript(name, command) {
    const lower = name.toLowerCase();

    if (lower.includes('symphony') || lower.includes('orchestrate') || lower.includes('pipeline')) {
      return PROCESS_CATEGORIES.ORCHESTRATION;
    } else if (lower.includes('generate') || lower.includes('gen') || lower.includes('make')) {
      return PROCESS_CATEGORIES.GENERATION;
    } else if (lower.includes('validate') || lower.includes('verify') || lower.includes('check') || lower.includes('audit')) {
      return PROCESS_CATEGORIES.VALIDATION;
    } else if (lower.includes('build') || lower.includes('compile')) {
      return PROCESS_CATEGORIES.BUILD;
    } else if (lower.includes('test')) {
      return PROCESS_CATEGORIES.TESTING;
    } else if (lower.includes('pre') || lower.includes('post')) {
      return PROCESS_CATEGORIES.ORCHESTRATION; // Lifecycle scripts are orchestration
    } else {
      return PROCESS_CATEGORIES.UTILITY;
    }
  }

  /**
   * Run the audit
   */
  run() {
    console.log('🎼 Starting Symphonic Process Compliance Audit...\n');

    const scriptProcesses = this.scanScripts();
    const npmProcesses = this.scanNpmScripts();
    const allProcesses = [...scriptProcesses, ...npmProcesses];

    this.audit.processes = allProcesses;
    this.audit.summary.totalProcesses = allProcesses.length;

    // Calculate compliance metrics
    this.audit.summary.symphonic = allProcesses.filter(p => p.complianceLevel === COMPLIANCE_LEVELS.SYMPHONIC).length;
    this.audit.summary.partialSymphonic = allProcesses.filter(p => p.complianceLevel === COMPLIANCE_LEVELS.PARTIAL_SYMPHONIC).length;
    this.audit.summary.shouldBeSymphonic = allProcesses.filter(p => p.complianceLevel === COMPLIANCE_LEVELS.SHOULD_BE_SYMPHONIC).length;
    this.audit.summary.nonSymphonic = allProcesses.filter(p => p.complianceLevel === COMPLIANCE_LEVELS.NON_SYMPHONIC).length;

    // Score calculation
    const orchestrationProcs = allProcesses.filter(p => p.shouldBeSymphonic);
    if (orchestrationProcs.length > 0) {
      const symphonyCount = orchestrationProcs.filter(p => p.complianceLevel === COMPLIANCE_LEVELS.SYMPHONIC).length;
      this.audit.summary.complianceScore = (symphonyCount / orchestrationProcs.length) * 100;
    }

    // Identify violations
    this.audit.violations = allProcesses.filter(p => 
      p.complianceLevel === COMPLIANCE_LEVELS.SHOULD_BE_SYMPHONIC
    ).map(p => ({
      process: p.name,
      reason: 'Process type requires symphonic structure but none found',
      category: p.category,
      severity: 'high'
    }));

    // Generate recommendations
    this.generateRecommendations(allProcesses);

    // Output results
    this.printSummary();
    this.saveAudit();
  }

  /**
   * Generate remediation recommendations
   */
  generateRecommendations(processes) {
    const violations = processes.filter(p => p.complianceLevel === COMPLIANCE_LEVELS.SHOULD_BE_SYMPHONIC);

    for (const violation of violations) {
      const recommendation = {
        process: violation.name,
        action: 'Convert to symphonic domain',
        steps: [
          `1. Create symphony definition: packages/orchestration/json-sequences/${violation.name}-symphony.json`,
          `2. Define movements (phases) and beats (operations)`,
          `3. Add telemetry/event recording at each beat`,
          `4. Register in orchestration-domains.json with 'orchestration' category`,
          `5. Update pre:manifests npm script to call symphony handler`,
          `6. Verify compliance: npm run audit:process-symphony`
        ],
        template: {
          id: violation.name.replace(/\.(js|cjs)$/, '-symphony'),
          sequenceId: violation.name.replace(/\.(js|cjs)$/, '-symphony'),
          name: `${violation.name} Symphony`,
          kind: 'orchestration',
          status: 'active',
          movements: [],
          governance: { policies: [], metrics: [] },
          events: []
        }
      };

      this.audit.recommendations.push(recommendation);
    }
  }

  /**
   * Print audit summary to console
   */
  printSummary() {
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('                   COMPLIANCE AUDIT SUMMARY');
    console.log('════════════════════════════════════════════════════════════════\n');

    console.log(`📊 Total Processes Scanned: ${this.audit.summary.totalProcesses}`);
    console.log(`  ✅ Symphonic (compliant): ${this.audit.summary.symphonic}`);
    console.log(`  ⚠️  Partial Symphonic: ${this.audit.summary.partialSymphonic}`);
    console.log(`  ❌ Should Be Symphonic (VIOLATIONS): ${this.audit.summary.shouldBeSymphonic}`);
    console.log(`  ℹ️  Non-symphonic (acceptable): ${this.audit.summary.nonSymphonic}`);

    console.log(`\n🎯 Compliance Score (Orchestration Processes): ${this.audit.summary.complianceScore.toFixed(1)}%`);

    if (this.audit.violations.length > 0) {
      console.log(`\n⚠️  GOVERNANCE VIOLATIONS: ${this.audit.violations.length}`);
      console.log('────────────────────────────────────────────────────────────────\n');

      const byCategory = {};
      for (const v of this.audit.violations) {
        if (!byCategory[v.category]) byCategory[v.category] = [];
        byCategory[v.category].push(v.process);
      }

      for (const [category, processes] of Object.entries(byCategory)) {
        console.log(`${category.toUpperCase()}: ${processes.length} violations`);
        processes.slice(0, 5).forEach(p => console.log(`  - ${p}`));
        if (processes.length > 5) console.log(`  ... and ${processes.length - 5} more`);
        console.log();
      }
    }

    console.log('\n📋 Full audit saved to:', path.relative(process.cwd(), outputPath));
    console.log('════════════════════════════════════════════════════════════════\n');
  }

  /**
   * Save audit to JSON file
   */
  saveAudit() {
    fs.writeFileSync(outputPath, JSON.stringify(this.audit, null, 2), 'utf-8');
    console.log(`✅ Audit saved: ${outputPath}`);
  }
}

// Run audit
const audit = new ProcessAudit();
audit.run();
