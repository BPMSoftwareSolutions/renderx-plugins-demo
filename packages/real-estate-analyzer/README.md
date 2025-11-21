# @renderx-plugins/real-estate-analyzer

Real Estate Opportunity Analyzer plugin for identifying property flipping opportunities using Zillow data.

## Features

- **Property Search**: Search for properties on Zillow
- **Opportunity Analysis**: Analyze properties for flipping potential
- **ROI Calculation**: Estimate profit margins and return on investment
- **Risk Assessment**: Evaluate risk levels based on market conditions
- **Market Trends**: Analyze price history and market trends
- **Recommendations**: Get actionable recommendations for each property

## Installation

```bash
npm install @renderx-plugins/real-estate-analyzer
```

## Configuration

Set the Zillow API key via environment variable:

```bash
VITE_ZILLOW_API_KEY=your_rapidapi_key_here
```

Get your API key from [RapidAPI Zillow](https://rapidapi.com/s.mahmoud97/api/zillow-com1)

## Usage

The plugin integrates with the RenderX plugin system and provides:

### UI Component

```tsx
import { OpportunityAnalyzer } from '@renderx-plugins/real-estate-analyzer';

export function App() {
  return <OpportunityAnalyzer />;
}
```

### Handlers

The plugin exposes handlers for use in sequences:

- `fetchProperty3DTour`: Fetch 3D tour data from Zillow
- `analyzeProperty`: Analyze property for flipping opportunity
- `formatResults`: Format results for UI display

## Analysis Metrics

Each property analysis includes:

- **Overall Score** (0-100): Composite opportunity score
- **ROI Potential**: Return on investment potential
- **Market Trend**: Market direction and momentum
- **Condition Score**: Property condition assessment
- **Location Score**: Location desirability rating
- **Estimated Profit**: Projected profit amount
- **Profit Margin**: Profit as percentage of total investment
- **Risk Level**: Low, Medium, or High

## Development

```bash
# Build
npm run build

# Test
npm run test

# Lint
npm run lint

# Type check
npm run typecheck
```

## License

MIT

