# Real Estate Opportunity Analyzer - Setup Guide

## Overview

The Real Estate Opportunity Analyzer is a new RenderX plugin that helps real estate brokers identify property flipping opportunities using Zillow data. It analyzes properties for ROI potential, market trends, and risk assessment.

## Quick Start

### 1. Get Zillow API Key

1. Visit [RapidAPI Zillow](https://rapidapi.com/s.mahmoud97/api/zillow-com1)
2. Sign up for a free account
3. Subscribe to the Zillow API
4. Copy your API key

### 2. Configure Environment

Create a `.env.local` file in the project root:

```bash
VITE_ZILLOW_API_KEY=your_api_key_here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Build the Plugin

```bash
npm run build:packages
```

### 5. Run Development Server

```bash
npm run dev
```

## Features

### Property Analysis

The plugin analyzes each property across multiple dimensions:

- **ROI Potential** (40% weight): Based on price vs. Zestimate
- **Market Trend** (25% weight): Analyzed from price history
- **Condition Score** (20% weight): Estimated from property age
- **Location Score** (15% weight): Desirability rating

### Opportunity Scoring

Each property receives:
- **Overall Score** (0-100): Composite opportunity rating
- **Estimated Profit**: Projected profit amount
- **Profit Margin**: Profit as percentage of investment
- **Risk Level**: Low, Medium, or High

### Recommendations

Personalized recommendations based on:
- Opportunity quality
- Profit potential
- Market conditions
- Project scale

## Usage

### In the UI

1. Open the application
2. Navigate to the Library panel
3. Look for "Real Estate Opportunity Analyzer"
4. Enter a Zillow property URL
5. Click "Analyze Property"
6. Review the opportunity score and recommendations

### Programmatically

```typescript
import { OpportunityAnalyzer } from '@renderx-plugins/real-estate-analyzer';

// Use in your React component
export function MyApp() {
  return <OpportunityAnalyzer />;
}
```

## API Integration

The plugin uses the Zillow RapidAPI endpoint:

```
GET https://zillow-com1.p.rapidapi.com/property3dtour
```

### Required Headers

- `x-rapidapi-host`: zillow-com1.p.rapidapi.com
- `x-rapidapi-key`: Your API key

## Architecture

### Services

- **ZillowService**: Handles API communication with Zillow
- **AnalysisEngine**: Performs opportunity analysis and scoring

### Components

- **OpportunityAnalyzer**: Main UI component
- **OpportunityCard**: Individual property card display

### Sequences

- **search-property**: Orchestrates property search and analysis workflow

## Testing

Run tests:

```bash
npm --prefix packages/real-estate-analyzer run test
```

Run tests in watch mode:

```bash
npm --prefix packages/real-estate-analyzer run test:watch
```

## Troubleshooting

### API Key Not Working

- Verify the key is correctly set in `.env.local`
- Check that the key hasn't expired
- Ensure you have an active RapidAPI subscription

### Build Errors

- Clear node_modules: `npm run clean:all`
- Reinstall: `npm install`
- Rebuild: `npm run build:packages`

### Plugin Not Loading

- Check browser console for errors
- Verify plugin is registered in `catalog/json-plugins/plugin-manifest.json`
- Ensure all dependencies are installed

## Next Steps

1. **Enhance Analysis**: Add more sophisticated analysis algorithms
2. **Market Data**: Integrate with additional real estate data sources
3. **Comparables**: Add comparable property analysis
4. **Financing**: Add mortgage and financing calculations
5. **Export**: Add ability to export analysis reports

## Support

For issues or questions, refer to:
- Plugin README: `packages/real-estate-analyzer/README.md`
- RenderX Documentation: `docs/`
- GitHub Issues: Create an issue with details

