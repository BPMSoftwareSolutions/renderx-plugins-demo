# @slo-shape/dashboard

Generic, reusable React dashboard for visualizing SLI/SLO/SLA + self-healing activity.

## Features

- **Real-time SLI Metrics**: Display component health scores, latencies, availability, and error rates
- **Budget Burndown**: Show error budget consumption with projections and breach warnings
- **Compliance Tracking**: Monitor SLA compliance status with trend analysis
- **Health Scores**: Individual component health cards with visual indicators
- **Self-Healing Activity**: Real-time log of automated fixes deployed
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Themes**: Built-in theme support
- **Export Functionality**: Export dashboard data as JSON
- **Modular Components**: Use individual components or the complete dashboard

## Installation

```bash
npm install @slo-shape/dashboard
# or
yarn add @slo-shape/dashboard
```

## Quick Start

```tsx
import React from 'react';
import { Dashboard } from '@slo-shape/dashboard';
import '@slo-shape/dashboard/styles';

function App() {
  const [metricsData, setMetricsData] = React.useState(null);

  React.useEffect(() => {
    // Load your SLI metrics data
    fetch('.generated/sli-metrics.json')
      .then(res => res.json())
      .then(data => setMetricsData(data));
  }, []);

  return (
    <Dashboard
      metricsData={metricsData}
      theme="light"
      onRefresh={() => {
        // Refresh data
      }}
    />
  );
}

export default App;
```

## Component Props

### Dashboard

```tsx
interface DashboardProps {
  metricsData?: SLIMetricsData | null;
  sloTargetsData?: SLOTargetsData | null;
  errorBudgetsData?: ErrorBudgetsData | null;
  complianceData?: SLAComplianceData | null;
  selfHealingData?: SelfHealingActivityData | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  theme?: 'light' | 'dark';
}
```

## Available Hooks

### useSLOMetrics

```tsx
const { data, isLoading, error, refresh } = useSLOMetrics(
  sourceUrl,
  autoRefresh = true,
  refreshIntervalMs = 30000
);
```

### useErrorBudget

```tsx
const { 
  budgets, 
  isLoading, 
  error, 
  getBurnRate, 
  getTimeToBreachHours 
} = useErrorBudget(
  sourceUrl,
  autoRefresh = true,
  refreshIntervalMs = 60000
);
```

### useComplianceStatus

```tsx
const { 
  compliance, 
  isLoading, 
  error, 
  isCompliant, 
  breachedComponents 
} = useComplianceStatus(
  sourceUrl,
  autoRefresh = true,
  refreshIntervalMs = 60000
);
```

## Services

### MetricsLoader

Load SLI metrics from file or API:

```tsx
import { MetricsLoader } from '@slo-shape/dashboard';

const loader = new MetricsLoader();
const metrics = await loader.loadFromFile('.generated/sli-metrics.json');
const metrics = await loader.loadFromAPI('/api/metrics');
```

### BudgetEngine

Calculate budget burn rates and projections:

```tsx
import { BudgetEngine } from '@slo-shape/dashboard';

const engine = new BudgetEngine();
const burnRate = engine.calculateBurnRate(budget);
const projection = engine.getMonthEndProjection(budget);
```

### ComplianceTracker

Monitor and analyze compliance status:

```tsx
import { ComplianceTracker } from '@slo-shape/dashboard';

const tracker = new ComplianceTracker();
const breached = tracker.getBreachedComponents(entries);
const sorted = tracker.sortByPriority(entries);
```

### DataUpdater

Real-time data streaming and polling:

```tsx
import { DataUpdater } from '@slo-shape/dashboard';

const updater = new DataUpdater();
updater.startMetricsPolling(metricsLoader, 30000);
updater.subscribe('metrics', (data) => {
  console.log('Metrics updated:', data);
});
```

## Data Formats

All data structures follow TypeScript interfaces:

- `SLIMetricsData`: Real-time component metrics (Phase 2 output)
- `SLOTargetsData`: Service level objectives (Phase 3d output)
- `ErrorBudgetsData`: Monthly error budgets (Phase 4 output)
- `SLAComplianceData`: Compliance status (Phase 5 output)
- `SelfHealingActivityData`: Automated fixes (Self-healing logs)

## Theming

Switch between light and dark themes:

```tsx
<Dashboard theme="dark" />
```

CSS custom properties are available for customization:

```css
:root {
  --color-bg-primary: #ffffff;
  --color-text-primary: #1e293b;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
}
```

## Styling

Import styles:

```tsx
import '@slo-shape/dashboard/dist/styles/variables.css';
import '@slo-shape/dashboard/dist/styles/dashboard.css';
import '@slo-shape/dashboard/dist/styles/metrics-panel.css';
```

## Individual Components

Use components independently:

```tsx
import { MetricsPanel, BudgetBurndown, HealthScores } from '@slo-shape/dashboard';

<MetricsPanel data={componentMetrics} isLoading={false} />
<BudgetBurndown budgets={budgetsData} isLoading={false} />
<HealthScores metrics={componentMetrics} isLoading={false} />
```

## TypeScript Support

Full TypeScript support included. Import types:

```tsx
import { 
  DashboardProps, 
  SLIMetricsData, 
  ComponentErrorBudget,
  ComplianceEntry 
} from '@slo-shape/dashboard';
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT

## Contributing

See main project repository for contribution guidelines.
