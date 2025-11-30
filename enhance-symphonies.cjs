#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define templates per package
const templates = {
  orchestration: {
    movements: {
      initialization: {
        userStory: "As a Build Orchestrator, I want to initialize build context and validate prerequisites so that the build pipeline executes with consistent state and validated dependencies.",
        persona: "Build System Administrator",
        businessValue: "Reduces build failures due to missing/invalid dependencies; enables reproducible builds; establishes traceability baseline"
      },
      build: {
        userStory: "As a Build Orchestrator, I want to compile source code and generate artifacts so that downstream processes have validated, executable output.",
        persona: "Build System Administrator",
        businessValue: "Ensures code quality; catches compilation errors early; generates deployment-ready artifacts"
      },
      test: {
        userStory: "As a QA Validator, I want to execute comprehensive tests and validate compliance so that only high-quality builds proceed to production.",
        persona: "QA Validator",
        businessValue: "Detects regressions; validates architecture governance; prevents non-compliant code deployment"
      },
      delivery: {
        userStory: "As a Release Manager, I want to coordinate deployment and publish artifacts so that the application reaches users with minimal downtime.",
        persona: "Release Manager",
        businessValue: "Enables reliable, repeatable deployments; supports blue-green/canary strategies; reduces deployment risk"
      },
      telemetry: {
        userStory: "As an Operations Engineer, I want to instrument the pipeline and collect telemetry so that I can monitor performance, detect anomalies, and optimize pipeline efficiency.",
        persona: "Operations Engineer",
        businessValue: "Enables proactive performance optimization; provides visibility into pipeline health; supports SLA tracking"
      },
      recovery: {
        userStory: "As a Platform Reliability Engineer, I want to detect failures and execute automated recovery so that pipeline disruptions are minimized.",
        persona: "Platform Reliability Engineer",
        businessValue: "Reduces MTTR; enables self-healing pipelines; improves availability SLA"
      }
    }
  },
  ControlPanel: {
    movements: {
      init: {
        userStory: "As a Configuration Administrator, I want to initialize the Control Panel with domain-specific configuration so that users can see contextualized UI tailored to their domain.",
        persona: "Configuration Administrator",
        businessValue: "Enables rapid UI customization without code changes; reduces time-to-market; supports multi-tenancy"
      },
      render: {
        userStory: "As an End User, I want to see a dynamically rendered form with fields configured for my domain so that I can interact with the application efficiently.",
        persona: "End User",
        businessValue: "Provides intuitive, domain-specific UI; improves user productivity; supports accessibility"
      },
      validate: {
        userStory: "As a System Administrator, I want input validation to be applied consistently so that only valid data enters the system.",
        persona: "System Administrator",
        businessValue: "Prevents data corruption; ensures compliance; improves system reliability"
      },
      style: {
        userStory: "As a UX Designer, I want to manage CSS and styling so that the UI maintains brand consistency and visual hierarchy.",
        persona: "UX Designer",
        businessValue: "Enables consistent branding; improves visual hierarchy; supports accessibility"
      }
    }
  },
  selfHealing: {
    movements: {
      detect: {
        userStory: "As a Platform Reliability Engineer, I want to continuously detect performance, behavioral, and error anomalies so that I can identify issues before they impact users.",
        persona: "Platform Reliability Engineer",
        businessValue: "Enables proactive incident response; reduces MTTR; improves SLA compliance"
      },
      baseline: {
        userStory: "As a Systems Administrator, I want to establish performance baselines so that anomaly detection has a reference point for normality.",
        persona: "Systems Administrator",
        businessValue: "Provides accurate anomaly detection; reduces false positives; enables data-driven optimization"
      },
      validate: {
        userStory: "As a Data Analyst, I want to validate anomalies and analyze root causes so that remediation efforts target the right issues.",
        persona: "Data Analyst",
        businessValue: "Enables data-driven decision-making; improves incident response accuracy"
      },
      remediate: {
        userStory: "As an Automation Engineer, I want automated remediation to execute when anomalies are detected so that system recovery is rapid and consistent.",
        persona: "Automation Engineer",
        businessValue: "Reduces MTTR; enables self-healing; improves availability"
      }
    }
  },
  sloDashboard: {
    movements: {
      aggregate: {
        userStory: "As a Platform Operations Engineer, I want to aggregate metrics across all services so that I can track SLO compliance and system health.",
        persona: "Platform Operations Engineer",
        businessValue: "Provides unified visibility across distributed system; enables data-driven SLA decisions"
      },
      evaluate: {
        userStory: "As an Incident Manager, I want SLO violations to be detected and alerted immediately so that my team can respond before SLA breach occurs.",
        persona: "Incident Manager",
        businessValue: "Enables proactive incident response; prevents SLA breaches; reduces escalations"
      },
      report: {
        userStory: "As a Manager, I want visibility into SLO trends and compliance metrics so that I can report on service quality and plan improvements.",
        persona: "Engineering Manager",
        businessValue: "Enables data-driven reporting; supports stakeholder communication; identifies improvement opportunities"
      }
    }
  }
};

// Handler-to-test mapping patterns
const testFilePatterns = {
  orchestration: {
    findTest: (handler) => {
      const patterns = [
        `packages/orchestration/test/${handler}.spec.ts`,
        `packages/orchestration/test/${handler.replace(/([A-Z])/g, '-$1').toLowerCase()}.spec.ts`,
        `packages/orchestration/__tests__/${handler}.spec.ts`,
        `packages/orchestration/__tests__/${handler.replace(/([A-Z])/g, '-$1').toLowerCase()}.spec.ts`
      ];
      return patterns[0]; // Primary pattern
    }
  },
  ControlPanel: {
    findTest: (handler) => {
      const camelToKebab = handler.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `src/RenderX.Plugins.ControlPanel/Tests/${handler}Tests.cs`;
    },
    findJsTest: (handler) => {
      const camelToKebab = handler.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `packages/control-panel/__tests__/${camelToKebab}.test.ts`;
    }
  },
  selfHealing: {
    findTest: (handler) => {
      const camelToKebab = handler.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `packages/self-healing/__tests__/${camelToKebab}.test.ts`;
    }
  },
  sloDashboard: {
    findTest: (handler) => {
      const camelToKebab = handler.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `packages/slo-dashboard/__tests__/${camelToKebab}.test.ts`;
    }
  }
};

// Beat scenario templates
const beatScenarios = {
  generateFields: "Generate UI Fields from Configuration",
  generateSections: "Generate UI Sections",
  renderView: "Render Dynamic View",
  validateInput: "Validate User Input",
  renderMain: "Render Main Control Panel",
  initializeBuild: "Initialize Build Process",
  compileSources: "Compile Source Code",
  runTests: "Execute Test Suite",
  validateCompliance: "Validate Architecture Compliance",
  publishArtifacts: "Publish Build Artifacts",
  deployService: "Deploy Service to Target Environment",
  collectTelemetry: "Collect Pipeline Telemetry",
  publishMetrics: "Publish Performance Metrics",
  detectFailure: "Detect Pipeline Failure",
  initiateRecovery: "Initiate Automated Recovery",
  detectAnomalies: "Detect Performance Anomalies",
  loadTelemetry: "Load Telemetry Data",
  detectPerformance: "Detect Performance Thresholds",
  detectBehavioral: "Detect Behavioral Anomalies",
  establishBaseline: "Establish Performance Baseline",
  validateMetrics: "Validate Metrics Against Baseline",
  aggregateMetrics: "Aggregate Metrics Across Services",
  evaluateSlo: "Evaluate SLO Compliance",
  publishAlerts: "Publish SLO Violation Alerts",
  generateReport: "Generate SLO Compliance Report"
};

// Acceptance criteria templates per handler
const beatACs = {
  generateFields: [
    "System loads field configuration from metadata",
    "Each field is generated with correct type (text, select, checkbox)",
    "Field labels, placeholders, and help text are populated",
    "Validation rules are attached to each field",
    "Fields are ordered correctly per configuration"
  ],
  generateSections: [
    "System loads section configuration from metadata",
    "Each section is generated with correct structure",
    "Section titles and descriptions are displayed",
    "Sections are collapsed/expanded per configuration",
    "Sections maintain visual hierarchy"
  ],
  renderView: [
    "System renders all configured sections and fields",
    "UI displays without errors or warnings",
    "Accessibility attributes (aria-*, labels) are present",
    "Responsive design adapts to screen size",
    "CSS styling is applied correctly"
  ],
  validateInput: [
    "System applies validation rules to user input",
    "Invalid input is rejected with error message",
    "Error messages are clear and actionable",
    "Valid input is accepted and processed",
    "Validation occurs before form submission"
  ],
  initializeBuild: [
    "Build event is published to event stream",
    "Handler receives event with correct payload",
    "All prerequisites (JDK, Maven, Git) are validated",
    "Build version/ID is generated and tracked",
    "Telemetry marker is created for build start"
  ],
  compileSources: [
    "System compiles all source files without errors",
    "Build output is generated in correct location",
    "Compilation time is tracked in telemetry",
    "Failed compilation is reported with clear error messages",
    "Generated artifacts are validated"
  ],
  runTests: [
    "System executes all configured tests",
    "Test results are collected and aggregated",
    "Failed tests are reported with details",
    "Test coverage metrics are calculated",
    "Test execution time is tracked"
  ],
  validateCompliance: [
    "System validates architecture governance rules",
    "Compliance violations are identified",
    "Violation details include severity and remediation guidance",
    "Compliance report is generated",
    "Non-compliant builds are prevented from deployment"
  ],
  publishArtifacts: [
    "Compiled artifacts are packaged correctly",
    "Artifacts are published to repository",
    "Artifact metadata is stored (version, timestamp, author)",
    "Artifact integrity is verified",
    "Downstream systems can access published artifacts"
  ],
  deployService: [
    "System validates deployment prerequisites",
    "Service is deployed to target environment",
    "Health checks confirm service is running",
    "Deployment is recorded in audit log",
    "Rollback capability is available"
  ],
  detectAnomalies: [
    "System loads telemetry data from database",
    "System compares current metrics against baseline",
    "Anomalies are flagged when deviation exceeds threshold",
    "Anomaly records include handler, observed value, baseline",
    "Anomalies are published to event stream"
  ],
  establishBaseline: [
    "System collects telemetry data from current period",
    "Statistical metrics are calculated (mean, p50, p95, p99)",
    "Baselines are stored per handler and metric type",
    "Baseline version and creation timestamp are recorded",
    "Historical baselines are preserved for trending"
  ]
};

// Enhance beat with metadata
function enhanceBeat(beat, handler, pkg) {
  const beatNum = beat.beat || beat.number;
  
  // Handle handler as string or object
  const handlerStr = typeof handler === 'string' ? handler : (handler?.name || handler?.handler || 'unknown');
  
  // Determine scenario
  const handlerKey = Object.keys(beatScenarios).find(k => handlerStr.includes(k) || beatScenarios[k].includes(beat.title));
  const scenario = handlerKey ? beatScenarios[handlerKey] : beat.title + " Scenario";
  
  // Determine ACs
  const acs = (beatACs[handlerKey] || [
    "Handler executes successfully",
    "Output is valid and conforms to schema",
    "Event is published to event stream",
    "Telemetry is recorded",
    "No errors or warnings are logged"
  ]).slice(0, 5);
  
  // Determine test file
  let testFile = "TBD";
  let testCase = "TBD";
  
  if (pkg === "orchestration" || pkg === "orchestration-core") {
    testFile = testFilePatterns.orchestration.findTest(handlerStr);
    testCase = `should ${handlerStr} when event published`;
  } else if (pkg.includes("ControlPanel")) {
    testFile = testFilePatterns.ControlPanel.findTest(handlerStr);
    testCase = `Should_${handlerStr}_When_ConfigurationProvided`;
  } else if (pkg === "control-panel") {
    testFile = testFilePatterns.ControlPanel.findJsTest(handlerStr);
    testCase = `should ${handlerStr.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
  } else if (pkg === "self-healing") {
    testFile = testFilePatterns.selfHealing.findTest(handlerStr);
    testCase = `should ${handlerStr.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
  } else if (pkg === "slo-dashboard") {
    testFile = testFilePatterns.sloDashboard.findTest(handlerStr);
    testCase = `should ${handlerStr.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
  }
  
  // Preserve existing fields and add metadata
  return {
    ...beat,
    number: beat.number || beatNum,
    scenario,
    acceptanceCriteria: acs,
    testFile,
    testCase
  };
}

// Enhance movement with metadata
function enhanceMovement(movement, pkg) {
  const movementKey = Object.keys(templates[pkg]?.movements || {}).find(k => 
    movement.name?.toLowerCase().includes(k) || 
    movement.id?.toLowerCase().includes(k)
  );
  
  const template = movementKey ? templates[pkg].movements[movementKey] : null;
  const handlerName = movement.beats?.[0]?.handler || "system";
  
  const enhanced = {
    ...movement,
    number: movement.number || movement.beat,
    userStory: template?.userStory || movement.userStory || `As a user, I want ${movement.name} so that the system operates correctly.`,
    persona: template?.persona || movement.persona || "System User",
    businessValue: template?.businessValue || movement.businessValue || "Improves system quality and reliability"
  };
  
  // Enhance all beats in movement
  if (movement.beats && Array.isArray(movement.beats)) {
    enhanced.beats = movement.beats.map((beat) => enhanceBeat(beat, beat.handler, pkg));
  }
  
  return enhanced;
}

// Main enhancement function
function enhanceSymphony(symphonyPath, pkg) {
  try {
    const content = fs.readFileSync(symphonyPath, 'utf8');
    const symphony = JSON.parse(content);
    
    // Enhance all movements
    if (symphony.movements && Array.isArray(symphony.movements)) {
      symphony.movements = symphony.movements.map(m => enhanceMovement(m, pkg));
    }
    
    // Ensure symphony-level metadata
    symphony.userStory = symphony.userStory || `${symphony.name} workflow`;
    symphony.persona = symphony.persona || "System User";
    symphony.businessValue = symphony.businessValue || "Improves system quality";
    
    // Write enhanced symphony
    fs.writeFileSync(symphonyPath, JSON.stringify(symphony, null, 2));
    
    return { success: true, path: symphonyPath, beats: symphony.movements?.reduce((sum, m) => sum + (m.beats?.length || 0), 0) || 0 };
  } catch (error) {
    return { success: false, path: symphonyPath, error: error.message };
  }
}

// Execute enhancement
const basePath = 'c:\\source\\repos\\bpm\\Internal\\renderx-plugins-demo';
const packages = [
  { dir: 'packages\\orchestration\\json-sequences', name: 'orchestration' },
  { dir: 'src\\RenderX.Plugins.ControlPanel\\json-sequences', name: 'ControlPanel' },
  { dir: 'packages\\control-panel\\json-sequences', name: 'control-panel' },
  { dir: 'packages\\self-healing\\json-sequences', name: 'self-healing' },
  { dir: 'packages\\slo-dashboard\\json-sequences', name: 'slo-dashboard' }
];

let results = { total: 0, enhanced: 0, failed: 0, totalBeats: 0 };

packages.forEach(pkg => {
  const pkgPath = path.join(basePath, pkg.dir);
  if (!fs.existsSync(pkgPath)) {
    console.log(`⚠️  Package path not found: ${pkgPath}`);
    return;
  }
  
  const files = fs.readdirSync(pkgPath)
    .filter(f => f.endsWith('.json') && !f.match(/(tsconfig|package|index\.json)/i));
  
  console.log(`\n📦 ${pkg.name}: ${files.length} symphonies`);
  
  files.forEach(file => {
    const symphonyPath = path.join(pkgPath, file);
    const result = enhanceSymphony(symphonyPath, pkg.name);
    
    results.total++;
    if (result.success) {
      results.enhanced++;
      results.totalBeats += result.beats;
      console.log(`  ✅ ${file} (${result.beats} beats)`);
    } else {
      results.failed++;
      console.log(`  ❌ ${file}: ${result.error}`);
    }
  });
});

console.log(`\n📊 Summary:`);
console.log(`  Total Symphonies: ${results.total}`);
console.log(`  Enhanced: ${results.enhanced}`);
console.log(`  Failed: ${results.failed}`);
console.log(`  Total Beats Enhanced: ${results.totalBeats}`);
