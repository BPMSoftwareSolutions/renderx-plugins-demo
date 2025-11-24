# SLO Dashboard - Architecture & Implementation Guide

*Generated from: `.generated/global-traceability-map.json`*
*Last Updated: 2025-11-23T21:09:45.435Z*

## Design Principles

- **Generic:** Works with ANY SLI/SLO system, not RenderX-specific
- **Reusable:** Published to npm as @slo-shape/dashboard
- **Self-contained:** All logic in React hooks and services
- **Real-time:** Updates stream from JSON sources
- **Integrated:** Shows self-healing activity and improvements

## Package Structure

```
packages/slo-dashboard/
├── src/
│   ├── components/
│   │   ├── MetricsPanel.tsx
│   │   ├── BudgetBurndown.tsx
│   │   ├── ComplianceTracker.tsx
│   │   ├── HealthScores.tsx
│   │   ├── SelfHealingActivity.tsx
│   │   └── Dashboard.tsx
│   ├── services/
│   │   ├── metricsLoader.ts
│   │   ├── budgetEngine.ts
│   │   ├── complianceTracker.ts
│   │   └── dataUpdater.ts
│   ├── hooks/
│   │   ├── useSLOMetrics.ts
│   │   ├── useErrorBudget.ts
│   │   └── useComplianceStatus.ts
│   ├── types/
│   │   └── slo.types.ts
│   └── styles/
├── tests/
└── package.json
```

## Components

### MetricsPanel.tsx

**Purpose:** Display real-time SLI metrics from Phase 2

**Inputs:**
- sli-metrics.json

**Displays:**
- Health scores
- Latencies (P95/P99)
- Availability %
- Error rates

### BudgetBurndown.tsx

**Purpose:** Show error budget consumption and remaining

**Inputs:**
- error-budgets.json from Phase 4

**Displays:**
- Budget consumed
- Remaining allowance
- Burndown chart
- Alert thresholds

### ComplianceTracker.tsx

**Purpose:** Display SLO compliance status per component

**Inputs:**
- sla-compliance-report.json from Phase 5

**Displays:**
- Compliance %
- Breach indicators
- Trend (improving/stable/degrading)

### HealthScores.tsx

**Purpose:** Individual component health cards with status

**Inputs:**
- sli-metrics.json

**Displays:**
- 0-100 health score
- Status color (red/yellow/green)
- Improvement trend

### SelfHealingActivity.tsx

**Purpose:** Real-time log of automated fixes deployed

**Inputs:**
- self-healing activity logs + phase-2-recalculated metrics

**Displays:**
- Recent fixes
- Deployment status
- Before/after improvement metrics

### Dashboard.tsx

**Purpose:** Master component orchestrating all panels


## Data Inputs by Source

### From from_phase_2

**File:** `.generated/sli-metrics.json`

**Fields:**
- health_score
- latency_p95
- latency_p99
- availability
- error_rate

### From from_phase_3

**File:** `.generated/slo-targets.json`

**Fields:**
- availability_target
- latency_target
- error_rate_target

### From from_phase_4

**File:** `.generated/error-budgets.json`

**Fields:**
- budget_monthly
- budget_consumed
- budget_remaining
- time_to_breach

### From from_phase_5

**File:** `.generated/sla-compliance-report.json`

**Fields:**
- compliant
- breach_alerts
- historical_compliance

### From from_self_healing

**File:** `undefined`

**Fields:**
- recent_fixes
- deployment_status
- improvement_metrics

