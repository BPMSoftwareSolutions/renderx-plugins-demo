# Recommended Analysis Metrics for Symphonic Pipelines

## What We Should Add (Priority Order)

### 🔴 Critical (Foundation)
1. **Lines of Code per Beat** — How much code implements each beat?
2. **Code Coverage per Beat** — Are beats tested?
3. **Complexity Ranking per Beat** — Which beats are hardest to understand/maintain?
4. **Handler-to-Beat Mapping** — Which handlers implement which beats?

### 🟠 High Priority (Insight)
5. **Code Distribution Balance** — Are beats evenly distributed or top-heavy?
6. **Movement-Level Aggregation** — Summary metrics for entire movements
7. **Test Gap Analysis** — Specific beats that need test coverage
8. **God Function Detection** — Which handlers have too many dependencies?
9. **Dead Code Ratio** — Handlers in code but not in any beat?

### 🟡 Medium Priority (Intelligence)
10. **Interaction Completeness** — Are all component events properly handled?
11. **Cyclomatic Complexity Distribution** — Code complexity per beat
12. **Call Dependency Graph** — Which beats call which other beats?
13. **Performance Profile** — Which beats take longest?
14. **External Integration Points** — Where does code interact with outside systems?

### 🟢 Nice-to-Have (Polish)
15. **Trend Analysis** — How metrics change over time
16. **Comparison Mode** — Compare two pipelines side-by-side
17. **Refactoring Suggestions** — Automated recommendations
18. **Architecture Violations** — When beats violate expected patterns
19. **Change Impact Analysis** — What happens when beat changes?
20. **Performance Regression Detection** — Alert when metrics degrade

## What to Compute from Existing Artifacts

### From `analysis.json` (464 files, 1153 symbols, 5610 calls)
```javascript
✓ Lines of code per file/function
✓ Function count, class count, method count
✓ Call distribution (which functions called most)
✓ Symbol complexity (based on call patterns)
✓ External vs. internal calls
```

### From `comprehensive-audit.json` (1830 tests, 74% coverage)
```javascript
✓ Test count per file
✓ Test coverage percentage
✓ Handlers with/without tests
✓ Sequence-defined handler coverage (92%)
✓ Handler gaps (tests needed)
```

### From `god-functions.json` (100 complex functions)
```javascript
✓ Top functions by call count
✓ Complexity ratio per function
✓ Unique callees per function
✓ Refactoring candidates
✓ Interdependency risk
```

### From `external-interactions-audit.json` (112 edges)
```javascript
✓ Component events → handlers mapping
✓ Missing topic coverage
✓ Orphan handlers (code without events)
✓ Plugin ownership validation
✓ Event handling completeness
```

### From `catalog-sequences.json` (Sequence definitions)
```javascript
✓ Movement structure
✓ Beat count per movement
✓ Handler assignments per beat
✓ Event definitions
✓ Expected interactions
```

## Implementation Skeleton

```typescript
// packages/symphony-code-analyzer/src/analyzer.ts

interface BeatMetrics {
  beatId: string;
  handler: string;
  metrics: {
    loc: number;                    // Lines of code
    complexity: number;             // Cyclomatic complexity
    callCount: number;              // How many functions call this
    uniqueCallees: number;          // How many unique functions this calls
    testCoverage: number;           // % coverage
    testCount: number;              // Test count
    isGodFunction: boolean;         // Rank >= 2?
    orphaned: boolean;              // In IR but not in sequence?
  };
  quality: {
    healthScore: 0-1;              // Overall health
    refactoringUrgency: 'critical' | 'high' | 'medium' | 'low';
    suggestions: string[];         // What to fix
  };
}

interface MovementMetrics {
  movementId: string;
  beats: BeatMetrics[];
  aggregated: {
    totalLoc: number;
    avgLocPerBeat: number;
    locVariance: number;           // Std deviation (balance metric)
    avgComplexity: number;
    complexityVariance: number;
    avgCoverage: number;
    totalTests: number;
    criticalPaths: string[];       // Highest complexity beats
  };
}

interface PipelineCodeHealthScore {
  pipeline: string;
  overallHealth: 0-1;
  dimensions: {
    codeDistribution: 0-1;         // Beat balance (low variance = better)
    testCoverage: 0-1;             // Coverage %
    complexityBalance: 0-1;        // Complexity variance (low variance = better)
    handlerEfficiency: 0-1;        // Avg callees per handler (low = better)
    deadCodeRatio: 0-1;            // 1 - (orphans/total)
    externalIntegration: 0-1;      // Topic coverage
  };
  redFlags: string[];
  opportunities: string[];
}

// Analysis pipeline
class SymphonicCodeAnalyzer {
  // 1. Extract data from artifacts
  async loadSequenceDefinitions(): Promise<Sequence[]>
  async loadHandlerAnalysis(): Promise<HandlerMetrics[]>
  async loadTestCoverage(): Promise<TestCoverage>
  async loadComplexityData(): Promise<GodFunctions>
  
  // 2. Map beats to code metrics
  async computeBeatMetrics(): Promise<BeatMetrics[]>
  async computeMovementMetrics(): Promise<MovementMetrics[]>
  
  // 3. Calculate health scores
  async computeHealthScore(): Promise<PipelineCodeHealthScore>
  
  // 4. Generate reports
  async generateReport(format: 'html' | 'json' | 'csv'): Promise<Report>
  async generateDashboard(): Promise<DashboardConfig>
  
  // 5. Comparative analysis
  async compare(pipeline1: string, pipeline2: string): Promise<Comparison>
}
```

## NPM Commands to Add

```bash
# Core analysis
npm run analyze:symphonic-code <pipeline-id>

# Reports
npm run analyze:symphonic-code -- --report health
npm run analyze:symphonic-code -- --report detailed
npm run analyze:symphonic-code -- --report comparison

# Output formats
npm run analyze:symphonic-code -- --format json,html,csv

# Comparisons
npm run analyze:symphonic-code -- --compare <p1> <p2>

# Specific metrics
npm run analyze:symphonic-code -- --metrics coverage,complexity,loc
npm run analyze:symphonic-code -- --show-god-functions
npm run analyze:symphonic-code -- --show-test-gaps

# Watch for changes
npm run analyze:symphonic-code -- --watch
npm run analyze:symphonic-code -- --trend-report
```

## Integration with Existing Tools

### Connects to:
- **ographx** — Already extracting symbols, complexity, call graphs
- **Vitest** — Already collecting coverage data
- **ESLint** — Can consume complexity metrics
- **query-domains** — Already querying orchestrations
- **pre:manifests** — Can be extended to include analysis

### Outputs that feed back:
- Health scores → governance enforcement (is pipeline healthy?)
- Test gaps → `proposed-tests.handlers.json` enhancement
- Complexity hotspots → refactoring recommendations
- Dead code → cleanup tasks

## Quick Win: MVP (1-2 days)

Focus first on **"LOC per Beat"** + **"Coverage per Beat"**:

```json
{
  "pipeline": "renderx-web-orchestration",
  "movements": [
    {
      "movement": "Build",
      "beats": [
        {
          "beatId": "build:1",
          "handler": "validateDomains",
          "loc": 120,
          "coverage": 95,
          "tests": 2
        },
        {
          "beatId": "build:2", 
          "handler": "generateManifests",
          "loc": 450,
          "coverage": 82,
          "tests": 5
        }
      ]
    }
  ]
}
```

This single metric immediately shows:
- Code hotspots
- Test coverage gaps
- Beat complexity distribution
- Refactoring priorities

## Success Criteria

When complete:
- ✅ Every beat has LOC metric
- ✅ Every beat has test coverage
- ✅ Every movement has aggregated metrics
- ✅ Health score for entire pipeline
- ✅ Visual dashboard showing metrics
- ✅ Comparison mode between pipelines
- ✅ Trend tracking over time
- ✅ Automated recommendations

---

**This transforms orchestration metrics into code quality insights.**

The beauty: You already have all the data in ographx artifacts. We just need to glue it together!
