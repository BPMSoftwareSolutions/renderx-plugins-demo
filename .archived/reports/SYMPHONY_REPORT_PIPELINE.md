<!-- AUTO-GENERATED: symphony-report-pipeline.json -->
<!-- Generated: 2025-11-26T18:32:06.487Z -->
<!-- Source: symphony-report-pipeline.json -->

# Symphony Report Generation Pipeline

**Status:** active  
**Kind:** reporting  
**Package:** orchestration  
**ID:** `symphony-report-pipeline`

---

## 📋 Overview

Six-movement orchestration for generating comprehensive reports from symphony pipeline executions, metrics, and conformity audits.

**Purpose:** Automate multi-format report generation (Markdown, JSON, HTML) with traceability lineage, recommendations, and audit summaries.

**Trigger:** On-demand or post-execution via governance layer

---

## 🎼 Pipeline Structure

- **Total Movements:** 6
- **Total Beats:** 30
- **Governance Policies:** 0
- **Tracked Metrics:** 0

## 📡 Events

The pipeline emits 9 distinct events during execution:

```
01. report:generation:initiated
02. metrics:aggregation:complete
03. conformity:audit:complete
04. report:markdown:generated
05. report:json:generated
06. report:html:generated
07. recommendations:computed
08. lineage:audit:complete
09. report:delivery:complete
```

## 🎵 Movements

### Movement 1: Data Collection & Aggregation

**Kind:** `undefined`  
**Beats:** 5

Gather metrics from all pipeline executions, sequences, and audit systems

#### Violation Categories Addressed
- (none specified)

#### Beats

**Beat 1: Query Execution Metrics**
- Description: Fetch performance, latency, and resource metrics from execution logs
- Event: `metrics:execution:queried`
- Handler: `queryExecutionMetrics`
- Kind: data-collection
- Timing: < 100ms




**Beat 2: Query Conformity Audit Data**
- Description: Retrieve conformity scores, violations, and audit results
- Event: `metrics:audit:queried`
- Handler: `queryConformityAudit`
- Kind: data-collection
- Timing: < 100ms




**Beat 3: Query Sequence Traceability**
- Description: Collect sequence definitions, movements, beats, and handler mappings
- Event: `metrics:traceability:queried`
- Handler: `querySequenceTraceability`
- Kind: data-collection
- Timing: < 150ms




**Beat 4: Aggregate Handler Coverage**
- Description: Analyze handler implementations, usage, and orphaned handlers
- Event: `metrics:handlers:aggregated`
- Handler: `aggregateHandlerCoverage`
- Kind: aggregation
- Timing: < 200ms




**Beat 5: Normalize All Metrics**
- Description: Standardize metric formats, calculate derived metrics, prepare for analysis
- Event: `metrics:normalized`
- Handler: `normalizeMetrics`
- Kind: transformation
- Timing: < 150ms





### Movement 2: Executive Summary Synthesis

**Kind:** `undefined`  
**Beats:** 5

Create high-level overview with key metrics and status indicators

#### Violation Categories Addressed
- (none specified)

#### Beats

**Beat 1: Calculate Summary Metrics**
- Description: Compute conformity score, violation counts, coverage percentages
- Event: `summary:metrics:calculated`
- Handler: `calculateSummaryMetrics`
- Kind: analysis
- Timing: < 100ms




**Beat 2: Compute Health Indicators**
- Description: Determine system health status (green/yellow/red) and trends
- Event: `summary:health:computed`
- Handler: `computeHealthIndicators`
- Kind: analysis
- Timing: < 75ms




**Beat 3: Identify Critical Issues**
- Description: Extract CRITICAL violations and high-priority items for immediate action
- Event: `summary:issues:identified`
- Handler: `identifyCriticalIssues`
- Kind: analysis
- Timing: < 100ms




**Beat 4: Generate Trend Analysis**
- Description: Compare current metrics to historical data, identify patterns
- Event: `summary:trends:analyzed`
- Handler: `generateTrendAnalysis`
- Kind: analysis
- Timing: < 150ms




**Beat 5: Synthesize Summary Section**
- Description: Create formatted executive summary with visualizations and key findings
- Event: `summary:synthesized`
- Handler: `synthesizeSummarySection`
- Kind: synthesis
- Timing: < 100ms





### Movement 3: Detailed Analysis & Recommendations

**Kind:** `undefined`  
**Beats:** 5

Generate in-depth analysis with recommendations for each violation category

#### Violation Categories Addressed
- (none specified)

#### Beats

**Beat 1: Categorize Violations by Severity**
- Description: Group violations into CRITICAL, MAJOR, MINOR buckets with context
- Event: `analysis:violations:categorized`
- Handler: `categorizeViolationsBySeverity`
- Kind: analysis
- Timing: < 100ms




**Beat 2: Analyze Root Causes**
- Description: Identify patterns and root causes for each violation class
- Event: `analysis:causes:identified`
- Handler: `analyzeRootCauses`
- Kind: analysis
- Timing: < 200ms




**Beat 3: Generate Remediation Plans**
- Description: Create detailed fix strategies with effort estimates and dependencies
- Event: `analysis:remediation:generated`
- Handler: `generateRemediationPlans`
- Kind: synthesis
- Timing: < 150ms




**Beat 4: Compute Priority Scores**
- Description: Calculate priority (severity + impact + effort) for sequencing fixes
- Event: `analysis:priorities:computed`
- Handler: `computePriorityScores`
- Kind: analysis
- Timing: < 100ms




**Beat 5: Synthesize Detailed Section**
- Description: Create detailed analysis markdown with tables, code examples, and guidance
- Event: `analysis:synthesized`
- Handler: `synthesizeDetailedAnalysis`
- Kind: synthesis
- Timing: < 200ms





### Movement 4: Report Generation (Multi-Format)

**Kind:** `undefined`  
**Beats:** 5

Generate reports in Markdown, JSON, and HTML formats with consistent structure

#### Violation Categories Addressed
- (none specified)

#### Beats

**Beat 1: Generate Markdown Report**
- Description: Create primary Markdown report with all sections, links, and formatting
- Event: `report:markdown:generating`
- Handler: `generateMarkdownReport`
- Kind: generation
- Timing: < 300ms




**Beat 2: Generate JSON Report**
- Description: Export structured JSON with metrics, violations, and recommendations
- Event: `report:json:generating`
- Handler: `generateJsonReport`
- Kind: generation
- Timing: < 200ms




**Beat 3: Generate HTML Report**
- Description: Create interactive HTML dashboard with charts, filtering, and export options
- Event: `report:html:generating`
- Handler: `generateHtmlReport`
- Kind: generation
- Timing: < 500ms




**Beat 4: Validate Report Consistency**
- Description: Cross-check that all formats contain consistent data and recommendations
- Event: `report:validated`
- Handler: `validateReportConsistency`
- Kind: validation
- Timing: < 100ms




**Beat 5: Compute Report Hashes**
- Description: Generate integrity hashes for audit trail and change detection
- Event: `report:hashes:computed`
- Handler: `computeReportHashes`
- Kind: validation
- Timing: < 50ms





### Movement 5: Lineage & Audit Trail Construction

**Kind:** `undefined`  
**Beats:** 5

Build complete traceability chain showing source → transformation → output

#### Violation Categories Addressed
- (none specified)

#### Beats

**Beat 1: Build Data Lineage**
- Description: Trace each report output back to source metrics and audit data
- Event: `lineage:data:constructed`
- Handler: `buildDataLineage`
- Kind: traceability
- Timing: < 150ms




**Beat 2: Record Transformation Chain**
- Description: Log each analysis step, calculation, and decision with timestamps
- Event: `lineage:transformations:recorded`
- Handler: `recordTransformationChain`
- Kind: audit
- Timing: < 100ms




**Beat 3: Link Recommendations to Sources**
- Description: Create bidirectional links between recommendations and violation sources
- Event: `lineage:recommendations:linked`
- Handler: `linkRecommendationsToSources`
- Kind: traceability
- Timing: < 100ms




**Beat 4: Generate Audit Summary**
- Description: Create human-readable audit trail documenting all decisions and transformations
- Event: `lineage:audit:generated`
- Handler: `generateAuditSummary`
- Kind: generation
- Timing: < 150ms




**Beat 5: Attach Lineage to Reports**
- Description: Embed audit trail and lineage references in all report formats
- Event: `lineage:attached`
- Handler: `attachLineageToReports`
- Kind: synthesis
- Timing: < 100ms





### Movement 6: Report Delivery & Distribution

**Kind:** `undefined`  
**Beats:** 5

Publish reports to configured locations with notifications and archival

#### Violation Categories Addressed
- (none specified)

#### Beats

**Beat 1: Write Reports to Disk**
- Description: Persist all report formats to docs/governance and output directories
- Event: `report:persisted`
- Handler: `writeReportsToDisk`
- Kind: persistence
- Timing: < 100ms




**Beat 2: Archive Previous Reports**
- Description: Move prior reports to archive with timestamp, maintain version history
- Event: `archive:previous:complete`
- Handler: `archivePreviousReports`
- Kind: housekeeping
- Timing: < 150ms




**Beat 3: Emit Notifications**
- Description: Send alerts to relevant teams (CRITICAL) or summary (all), include direct links
- Event: `notifications:emitted`
- Handler: `emitNotifications`
- Kind: notification
- Timing: < 200ms




**Beat 4: Update Dashboard Index**
- Description: Register reports in governance dashboard index for easy discovery
- Event: `dashboard:updated`
- Handler: `updateDashboardIndex`
- Kind: integration
- Timing: < 100ms




**Beat 5: Log Completion & Metrics**
- Description: Record report generation metrics, execution time, output sizes in telemetry
- Event: `report:generation:complete`
- Handler: `logCompletionMetrics`
- Kind: telemetry
- Timing: < 50ms





## 📚 Metadata

- **Version:** unknown
- **Last Updated:** unknown
- **Author:** unknown
- **Tags:** (none)

---

**This documentation is auto-generated from the JSON pipeline definition.**  
**To update, edit the JSON source file, not this Markdown.**

Generated: 2025-11-26T18:32:06.487Z
