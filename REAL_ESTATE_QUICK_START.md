# Real Estate Analyzer - Quick Start (5 Minutes)

## Step 1: Get API Key (2 min)

1. Go to https://rapidapi.com/s.mahmoud97/api/zillow-com1
2. Click "Subscribe to Test"
3. Copy your API key from the dashboard

## Step 2: Configure Environment (1 min)

Create `.env.local` in project root:
```
VITE_ZILLOW_API_KEY=paste_your_key_here
```

## Step 3: Build & Run (2 min)

```bash
# Install dependencies
npm install

# Build all packages including the new plugin
npm run build:packages

# Start dev server
npm run dev
```

## Step 4: Use the Plugin

1. Open http://localhost:5173
2. Look for "Real Estate Opportunity Analyzer" in the Library panel
3. Paste a Zillow property URL
4. Click "Analyze Property"
5. Review the opportunity score and recommendations

## What You Get

For each property analyzed:

✅ **Opportunity Score** (0-100)
- ROI Potential
- Market Trend
- Condition Score
- Location Score

✅ **Financial Analysis**
- Estimated Repair Cost
- After Repair Value
- Estimated Profit
- Profit Margin %

✅ **Risk Assessment**
- Risk Level (Low/Medium/High)
- Personalized Recommendations

## Example Property URL

```
https://www.zillow.com/homedetails/1541-SW-102nd-Ter-Davie-FL-33324/43177112_zpid
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Plugin not showing | Run `npm run build:packages` |
| API errors | Check `.env.local` has correct key |
| Build fails | Run `npm run clean:all && npm install` |

## Key Files

- **Plugin Code**: `packages/real-estate-analyzer/src/`
- **UI Component**: `packages/real-estate-analyzer/src/ui/OpportunityAnalyzer.tsx`
- **Analysis Logic**: `packages/real-estate-analyzer/src/services/analysis.engine.ts`
- **Tests**: `packages/real-estate-analyzer/__tests__/`

## Run Tests

```bash
npm --prefix packages/real-estate-analyzer run test
```

## Next: Customize

Edit `packages/real-estate-analyzer/src/services/analysis.engine.ts` to:
- Adjust scoring weights
- Add new analysis metrics
- Modify repair cost calculations
- Customize recommendations

## Support

- Full setup guide: `REAL_ESTATE_ANALYZER_SETUP.md`
- Implementation details: `REAL_ESTATE_ANALYZER_IMPLEMENTATION.md`
- Plugin README: `packages/real-estate-analyzer/README.md`

