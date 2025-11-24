# Real Estate Analyzer - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    RenderX Host Application                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Plugin Manifest Registry                │  │
│  │  - Loads all plugins including RealEstateAnalyzer   │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Musical Conductor (Orchestrator)           │  │
│  │  - Manages plugin sequences                          │  │
│  │  - Routes events between plugins                     │  │
│  │  - Executes handlers                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        Real Estate Analyzer Plugin                   │  │
│  │                                                      │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │  UI Layer (React)                              │ │  │
│  │  │  - OpportunityAnalyzer Component               │ │  │
│  │  │  - OpportunityCard Component                   │ │  │
│  │  │  - Search Form                                 │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │                      │                               │  │
│  │                      ▼                               │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │  Handler Layer                                 │ │  │
│  │  │  - fetchProperty3DTour()                       │ │  │
│  │  │  - analyzeProperty()                           │ │  │
│  │  │  - formatResults()                             │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │                      │                               │  │
│  │                      ▼                               │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │  Service Layer                                 │ │  │
│  │  │  ┌──────────────────────────────────────────┐ │ │  │
│  │  │  │ ZillowService                            │ │ │  │
│  │  │  │ - API Communication                      │ │ │  │
│  │  │  │ - Property Data Fetching                 │ │ │  │
│  │  │  └──────────────────────────────────────────┘ │ │  │
│  │  │  ┌──────────────────────────────────────────┐ │ │  │
│  │  │  │ AnalysisEngine                           │ │ │  │
│  │  │  │ - ROI Calculation                        │ │ │  │
│  │  │  │ - Market Trend Analysis                  │ │ │  │
│  │  │  │ - Condition Scoring                      │ │ │  │
│  │  │  │ - Risk Assessment                        │ │ │  │
│  │  │  │ - Recommendation Generation              │ │ │  │
│  │  │  └──────────────────────────────────────────┘ │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │                      │                               │  │
│  │                      ▼                               │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │  External APIs                                 │ │  │
│  │  │  - Zillow RapidAPI                            │ │  │
│  │  │    (Property 3D Tour Data)                     │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Input (Property URL)
        │
        ▼
┌─────────────────────────────────┐
│  OpportunityAnalyzer Component  │
│  (Captures URL)                 │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│  Conductor.play()               │
│  (Orchestrates sequence)        │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│  search-property.json Sequence  │
│  (Defines workflow)             │
└─────────────────────────────────┘
        │
        ├─────────────────────────────────┐
        │                                 │
        ▼                                 ▼
┌──────────────────────┐    ┌──────────────────────┐
│ fetchProperty3DTour  │    │  analyzeProperty     │
│ Handler              │    │  Handler             │
└──────────────────────┘    └──────────────────────┘
        │                                 │
        ▼                                 ▼
┌──────────────────────┐    ┌──────────────────────┐
│ ZillowService        │    │ AnalysisEngine       │
│ .getProperty3DTour() │    │ .analyzeProperty()   │
└──────────────────────┘    └──────────────────────┘
        │                                 │
        ▼                                 ▼
┌──────────────────────┐    ┌──────────────────────┐
│ Zillow RapidAPI      │    │ Opportunity Score    │
│ (External)           │    │ & Analysis Results   │
└──────────────────────┘    └──────────────────────┘
        │                                 │
        └─────────────────────────────────┘
                    │
                    ▼
        ┌─────────────────────────────┐
        │ formatResults Handler       │
        │ (Prepares for UI)           │
        └─────────────────────────────┘
                    │
                    ▼
        ┌─────────────────────────────┐
        │ OpportunityCard Component   │
        │ (Displays Results)          │
        └─────────────────────────────┘
```

## Analysis Engine Flow

```
PropertyData Input
        │
        ├─────────────────────────────────────────┐
        │                                         │
        ▼                                         ▼
┌──────────────────────┐            ┌──────────────────────┐
│ calculateROIPotential│            │ calculateMarketTrend │
│ (Price vs Zestimate) │            │ (Price History)      │
└──────────────────────┘            └──────────────────────┘
        │                                         │
        ▼                                         ▼
    ROI Score (40%)                  Market Trend (25%)
        │                                         │
        └─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────────────┐  ┌──────────────────────┐
│ estimateCondition    │  │ evaluateLocation     │
│ (Property Age)       │  │ (Address Analysis)   │
└──────────────────────┘  └──────────────────────┘
        │                       │
        ▼                       ▼
  Condition (20%)          Location (15%)
        │                       │
        └───────────┬───────────┘
                    │
                    ▼
        ┌─────────────────────────────┐
        │ Calculate Overall Score     │
        │ (Weighted Average)          │
        └─────────────────────────────┘
                    │
                    ▼
        ┌─────────────────────────────┐
        │ Estimate Repair Costs       │
        │ Estimate ARV                │
        │ Calculate Profit            │
        │ Assess Risk Level           │
        │ Generate Recommendations    │
        └─────────────────────────────┘
                    │
                    ▼
        ┌─────────────────────────────┐
        │ FlippingOpportunity Result  │
        └─────────────────────────────┘
```

## Component Hierarchy

```
OpportunityAnalyzer (Main Component)
├── Search Form
│   ├── Input (Property URL)
│   └── Button (Analyze)
├── Error Message (Conditional)
└── Opportunities List
    └── OpportunityCard (Repeating)
        ├── Card Header
        │   ├── Property Address
        │   └── Score Badge
        ├── Card Body
        │   ├── Property Info
        │   │   ├── Price
        │   │   ├── Beds/Baths
        │   │   └── Sqft
        │   ├── Analysis Metrics
        │   │   ├── Estimated Profit
        │   │   ├── Profit Margin
        │   │   └── Risk Level
        │   └── Recommendations
        │       └── Recommendation List
        └── Risk Level Styling
```

## Plugin Integration Points

```
Plugin Manifest
├── UI Slot: "library"
├── Module: "@renderx-plugins/real-estate-analyzer"
├── Export: "OpportunityAnalyzer"
└── Runtime Handler: "register"

Sequences
└── json-sequences/real-estate-analyzer/
    └── search-property.json
        ├── Movement: fetch-property-data
        ├── Movement: analyze-opportunity
        └── Movement: return-results

Handlers
├── fetchProperty3DTour
├── analyzeProperty
└── formatResults
```

