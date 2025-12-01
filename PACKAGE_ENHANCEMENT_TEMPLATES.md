# Package Symphony Enhancement Templates

**Purpose:** Define replicable metadata templates (user story, persona, business value) per package to enable governance-compliant enhancement of all 56 remaining symphonies.

**Foundation:** renderx-web pattern (6 movements, 23 beats, 100% test coverage, full metadata)

---

## 🎯 Template Structure

### Per-Movement Template
```json
{
  "number": 1,
  "id": "initialization",
  "name": "Movement Name",
  "userStory": "As a [PERSONA], I want to [GOAL] so that [BUSINESS_VALUE]",
  "persona": "Role/Actor",
  "businessValue": "Outcome/KPI/Impact",
  "description": "Movement purpose and context"
}
```

### Per-Beat Template
```json
{
  "number": 1,
  "beat": 1,
  "event": "plugin:domain:action:type",
  "title": "Beat Title",
  "scenario": "Gherkin Scenario Title",
  "acceptanceCriteria": [
    "Testable condition 1",
    "Testable condition 2",
    "Testable condition 3"
  ],
  "testFile": "path/to/test.spec.ts",
  "testCase": "specific test case name",
  "handler": {
    "name": "handlerFunctionName",
    "scope": "plugin | orchestration",
    "kind": "plugin | orchestration | stage-crew | pure"
  },
  "timing": "immediate | async | deferred",
  "dynamics": "ppp | pp | p | mp | mf | f | ff | fff"
}
```

---

## 📦 Package-Specific Templates

### 1. Orchestration Layer

**Package:** `packages/orchestration`  
**Symphonies:** 19 files  
**Focus:** Core platform orchestration; build pipeline; architecture governance; domain symphony  
**Test Pattern:** Jest specs in `packages/orchestration/test/*.spec.ts`

#### Orchestration Movement Templates

**Movement: Initialization**
```json
{
  "userStory": "As a Build Orchestrator, I want to initialize build context and validate prerequisites so that the build pipeline executes with consistent state and validated dependencies.",
  "persona": "Build System Administrator",
  "businessValue": "Reduces build failures due to missing/invalid dependencies; enables reproducible builds; establishes traceability baseline"
}
```

**Movement: Build & Compilation**
```json
{
  "userStory": "As a Build Orchestrator, I want to compile source code and generate artifacts so that downstream processes have validated, executable output.",
  "persona": "Build System Administrator",
  "businessValue": "Ensures code quality; catches compilation errors early; generates deployment-ready artifacts"
}
```

**Movement: Test & Validation**
```json
{
  "userStory": "As a QA Validator, I want to execute comprehensive tests and validate compliance so that only high-quality builds proceed to production.",
  "persona": "QA Validator / Compliance Officer",
  "businessValue": "Detects regressions; validates architecture governance; prevents non-compliant code deployment"
}
```

**Movement: Delivery & Deployment**
```json
{
  "userStory": "As a Release Manager, I want to coordinate deployment and publish artifacts so that the application reaches users with minimal downtime.",
  "persona": "Release Manager",
  "businessValue": "Enables reliable, repeatable deployments; supports blue-green/canary strategies; reduces deployment risk"
}
```

**Movement: Telemetry & Monitoring**
```json
{
  "userStory": "As an Operations Engineer, I want to instrument the pipeline and collect telemetry so that I can monitor performance, detect anomalies, and optimize pipeline efficiency.",
  "persona": "Operations Engineer",
  "businessValue": "Enables proactive performance optimization; provides visibility into pipeline health; supports SLA tracking"
}
```

**Movement: Recovery & Resilience**
```json
{
  "userStory": "As a Platform Reliability Engineer, I want to detect failures and execute automated recovery so that pipeline disruptions are minimized.",
  "persona": "Platform Reliability Engineer",
  "businessValue": "Reduces MTTR (Mean Time to Recovery); enables self-healing pipelines; improves availability SLA"
}
```

#### Orchestration Beat AC Template (Example for "Initialize Build")

```json
{
  "number": 1,
  "scenario": "Initialize Build Process",
  "acceptanceCriteria": [
    "Build event is published to event stream with correct payload",
    "Handler receives event and initializes build context",
    "All prerequisites (JDK, Maven, Git) are validated",
    "Build version/ID is generated and tracked",
    "Telemetry marker is created for build start",
    "Handler exits with success status (0) on valid initialization"
  ]
}
```

---

### 2. Control Panel Plugins

**Package:** `src/RenderX.Plugins.ControlPanel` (C#) + `packages/control-panel` (JS)  
**Symphonies:** 13 C# + 13 JS = 26 files  
**Focus:** UI orchestration; form rendering; field validation; CSS management  
**Test Pattern:** 
- C#: `.Tests` project (e.g., `UI/GenerateFieldsTests.cs`)
- JS: `.spec.ts` files (e.g., `__tests__/ui.render.test.ts`)

#### Control Panel Movement Templates

**Movement: Initialization & Configuration**
```json
{
  "userStory": "As a Configuration Administrator, I want to initialize the Control Panel with domain-specific configuration so that users can see contextualized UI tailored to their domain.",
  "persona": "Configuration Administrator",
  "businessValue": "Enables rapid UI customization without code changes; reduces time-to-market; supports multi-tenancy"
}
```

**Movement: Rendering & UI Generation**
```json
{
  "userStory": "As an End User, I want to see a dynamically rendered form with fields configured for my domain so that I can interact with the application efficiently.",
  "persona": "End User / Domain User",
  "businessValue": "Provides intuitive, domain-specific UI; improves user productivity; supports accessibility requirements"
}
```

**Movement: Input Validation & Processing**
```json
{
  "userStory": "As a System Administrator, I want input validation to be applied consistently so that only valid data enters the system.",
  "persona": "System Administrator / Data Validator",
  "businessValue": "Prevents data corruption; ensures compliance; improves system reliability"
}
```

**Movement: Styling & Theming**
```json
{
  "userStory": "As a UX Designer, I want to manage CSS and styling so that the UI maintains brand consistency and visual hierarchy.",
  "persona": "UX Designer / Brand Manager",
  "businessValue": "Enables consistent branding; improves visual hierarchy; supports accessibility (WCAG compliance)"
}
```

#### Control Panel Beat AC Template (Example for "Generate Fields")

```json
{
  "number": 1,
  "scenario": "Generate UI Fields from Configuration",
  "acceptanceCriteria": [
    "System loads field configuration from metadata",
    "Each field is generated with correct type (text, select, checkbox, etc.)",
    "Field labels, placeholders, and help text are populated",
    "Validation rules are attached to each field",
    "Fields are ordered correctly per configuration",
    "Generated fields render without errors",
    "Accessibility attributes (aria-*, labels) are present"
  ]
}
```

---

### 3. Self-Healing & Observability

**Package:** `packages/self-healing`  
**Symphonies:** 9 files  
**Focus:** Anomaly detection; metrics baseline; remediation; recovery  
**Test Pattern:** Jest specs in `packages/self-healing/__tests__/*.test.ts`

#### Self-Healing Movement Templates

**Movement: Anomaly Detection**
```json
{
  "userStory": "As a Platform Reliability Engineer, I want to continuously detect performance, behavioral, and error anomalies so that I can identify issues before they impact users.",
  "persona": "Platform Reliability Engineer",
  "businessValue": "Enables proactive incident response; reduces MTTR; improves SLA compliance; prevents cascading failures"
}
```

**Movement: Baseline Establishment**
```json
{
  "userStory": "As a Systems Administrator, I want to establish performance baselines so that anomaly detection has a reference point for normality.",
  "persona": "Systems Administrator",
  "businessValue": "Provides accurate anomaly detection; reduces false positives; enables data-driven optimization"
}
```

**Movement: Validation & Analysis**
```json
{
  "userStory": "As a Data Analyst, I want to validate anomalies and analyze root causes so that remediation efforts target the right issues.",
  "persona": "Data Analyst / Incident Commander",
  "businessValue": "Enables data-driven decision-making; improves incident response accuracy; supports post-mortem analysis"
}
```

**Movement: Remediation & Recovery**
```json
{
  "userStory": "As an Automation Engineer, I want automated remediation to execute when anomalies are detected so that system recovery is rapid and consistent.",
  "persona": "Automation Engineer / SRE",
  "businessValue": "Reduces MTTR; enables self-healing; improves availability; reduces manual intervention burden"
}
```

#### Self-Healing Beat AC Template (Example for "Detect Performance Anomalies")

```json
{
  "number": 3,
  "scenario": "Detect Performance Anomalies in Handler Execution",
  "acceptanceCriteria": [
    "System loads telemetry data for current time window",
    "System loads baseline metrics (p50, p95, p99 latencies)",
    "System compares current metrics against baseline thresholds",
    "Anomalies are flagged when current > baseline * threshold multiplier (e.g., 1.5x)",
    "Anomaly records include handler name, observed value, baseline, deviation %",
    "Anomalies are published to anomaly event stream",
    "System logs analysis results with timestamp and severity"
  ]
}
```

---

### 4. SLO Dashboard

**Package:** `packages/slo-dashboard`  
**Symphonies:** 3 files  
**Focus:** Observability; SLO tracking; alerting; dashboarding  
**Test Pattern:** Jest specs in `packages/slo-dashboard/__tests__/*.test.ts`

#### SLO Dashboard Movement Templates

**Movement: Metrics Aggregation**
```json
{
  "userStory": "As a Platform Operations Engineer, I want to aggregate metrics across all services so that I can track SLO compliance and system health.",
  "persona": "Platform Operations Engineer",
  "businessValue": "Provides unified visibility across distributed system; enables data-driven SLA decisions; supports capacity planning"
}
```

**Movement: SLO Evaluation & Alerting**
```json
{
  "userStory": "As an Incident Manager, I want SLO violations to be detected and alerted immediately so that my team can respond before SLA breach occurs.",
  "persona": "Incident Manager / On-Call Engineer",
  "businessValue": "Enables proactive incident response; prevents SLA breaches; reduces escalations; improves customer trust"
}
```

**Movement: Dashboard & Reporting**
```json
{
  "userStory": "As a Manager, I want visibility into SLO trends and compliance metrics so that I can report on service quality and plan improvements.",
  "persona": "Engineering Manager / Product Manager",
  "businessValue": "Enables data-driven reporting; supports stakeholder communication; identifies improvement opportunities; supports capacity planning"
}
```

---

## 🔗 Handler-to-Beat Mapping Pattern

Each beat references a handler. Templates define:

1. **Handler Naming:** Camel case (e.g., `generateFields`, `detectAnomalies`, `validateInput`)
2. **Scope:** `plugin` (domain-specific) or `orchestration` (system-level)
3. **Kind:** `plugin`, `orchestration`, `stage-crew` (async multi-handler), `pure` (stateless)
4. **Test File Linking:** Direct path to test file + test case name

#### Handler Template (Beat Level)
```json
{
  "handler": {
    "name": "generateFields",
    "scope": "plugin",
    "kind": "stage-crew",
    "testFile": "src/RenderX.Plugins.ControlPanel/Tests/UI/GenerateFieldsTests.cs",
    "testCase": "Should_GenerateFields_When_ConfigurationProvided",
    "jsTestFile": "packages/control-panel/__tests__/ui.render.test.ts",
    "jsTestCase": "should generate fields from configuration"
  }
}
```

---

## 📋 Template Instantiation Process

### Step 1: Per-Package Instantiation

For each package:
1. Select movement template (1-6 appropriate to domain)
2. Customize persona (e.g., "Configuration Administrator" → "ControlPanel Administrator")
3. Customize business value (domain-specific outcome)
4. Define 2-7 beats per movement (based on handler analysis)

### Step 2: Per-Beat Instantiation

For each beat:
1. Extract handler name from symphony JSON
2. Look up handler test file (search patterns: `HandlerNameTests.cs`, `handler-name.test.ts`)
3. Extract test case name from test file
4. Define scenario title (Gherkin format)
5. Define 3-5 acceptance criteria (testable conditions)
6. Validate event naming (`package:domain:action:type`)

### Step 3: Validation

1. **Syntax:** All JSON valid and well-formed
2. **Completeness:** All beats have all required fields
3. **Coverage:** All beats linked to test files (or flagged as "TBD")
4. **Consistency:** Event naming patterns consistent within package
5. **Governance:** All metadata in JSON (no external docs as source of truth)

---

## 🎓 Example: Control Panel ui.render.json Enrichment

### BEFORE (Current State)
```json
{
  "pluginId": "ControlPanelPlugin",
  "id": "control-panel-ui-render-symphony",
  "name": "Control Panel UI Render",
  "movements": [
    {
      "id": "render",
      "name": "Render",
      "beats": [
        {
          "beat": 1,
          "event": "control:panel:ui:fields:generate",
          "title": "Generate Fields",
          "dynamics": "mf",
          "handler": "generateFields",
          "timing": "immediate",
          "kind": "stage-crew",
          "handlerDef": {
            "id": "control-panel-ui-render-symphony.generatefields.0",
            "scope": "plugin",
            "kind": "plugin"
          }
        }
      ]
    }
  ]
}
```

### AFTER (Enhanced with Metadata)
```json
{
  "pluginId": "ControlPanelPlugin",
  "id": "control-panel-ui-render-symphony",
  "name": "Control Panel UI Render",
  "userStory": "As a Configuration Administrator, I want to render dynamically configured UI forms so that users can interact with domain-specific interfaces.",
  "persona": "Configuration Administrator",
  "businessValue": "Enables rapid UI customization without code changes; reduces time-to-market; supports multi-tenancy",
  "movements": [
    {
      "number": 1,
      "id": "render",
      "name": "Render",
      "userStory": "As an End User, I want to see a dynamically rendered form so that I can interact with the application.",
      "persona": "End User",
      "businessValue": "Provides intuitive, domain-specific UI; improves user productivity",
      "beats": [
        {
          "number": 1,
          "beat": 1,
          "event": "control:panel:ui:fields:generate",
          "title": "Generate Fields",
          "scenario": "Generate UI Fields from Configuration",
          "acceptanceCriteria": [
            "System loads field configuration from metadata",
            "Each field is generated with correct type",
            "Field labels and placeholders are populated",
            "Validation rules are attached to fields",
            "Fields render without errors"
          ],
          "testFile": "src/RenderX.Plugins.ControlPanel/Tests/UI/GenerateFieldsTests.cs",
          "testCase": "Should_GenerateFields_When_ConfigurationProvided",
          "jsTestFile": "packages/control-panel/__tests__/ui.render.test.ts",
          "jsTestCase": "should generate fields from configuration",
          "dynamics": "mf",
          "handler": "generateFields",
          "timing": "immediate",
          "kind": "stage-crew",
          "handlerDef": {
            "name": "generateFields",
            "scope": "plugin",
            "kind": "plugin"
          }
        }
      ]
    }
  ]
}
```

---

## ✅ Template Checklist

Before applying enhancement script:

- [ ] All 5 packages have movement templates defined
- [ ] All movement templates have userStory, persona, businessValue
- [ ] Sample beats from each package have been enriched (manual test)
- [ ] Test file discovery patterns are validated (can find 80%+ of handlers)
- [ ] Handler-to-test mapping covers 85%+ of handlers (flag remaining as "TBD")
- [ ] Governance policy (JSON authority) is understood by team
- [ ] BDD scenarios match user stories and acceptance criteria
- [ ] Traceability indices are planned (beat → test file mapping ready)

---

## 📚 References

- **renderx-web Enhanced Example:** `packages/orchestration/json-sequences/renderx-web-orchestration.json`
- **Governance Authority:** `UNIFIED_GOVERNANCE_AUTHORITY.json`
- **Enhancement Roadmap:** `PACKAGE_SYMPHONY_ENHANCEMENT_ROADMAP.md`
- **Audit Summary:** `PACKAGE_SYMPHONY_AUDIT_SUMMARY.json`

