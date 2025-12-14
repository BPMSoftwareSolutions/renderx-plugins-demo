# Test Breakdown by Category

## Tests by Category

### **UI Component Tests** (350+ tests)
**Location:** `packages/canvas-component/__tests__/`, `packages/control-panel/__tests__/`

| Category | Test Count | Key Files |
|----------|-----------|-----------|
| Canvas Operations | 80+ | drag.dom.spec.ts, resize.*.spec.ts, select.*.spec.ts |
| SVG Manipulation | 40+ | svg-node.update.spec.ts, line.svg.spec.ts |
| Import/Export | 30+ | import.*.spec.ts, export.*.spec.ts |
| Control Panel Fields | 50+ | attribute-editing.*.spec.ts, schema-resolver.*.spec.ts |
| CSS Management | 25+ | css.*.spec.ts, classes.editing.spec.ts |
| React Components | 35+ | react-component-*.spec.ts |

### **Handler Tests** (200+ tests)
**Location:** `packages/*/handlers.*.spec.ts`

| Package | Handler Count | Test Count |
|---------|--------------|-----------|
| canvas-component | 30+ | 100+ |
| control-panel | 25+ | 80+ |
| library-component | 15+ | 40+ |
| library | 20+ | 50+ |
| header | 6 | 6 |
| real-estate-analyzer | 10 | 10 |

### **Service Tests** (100+ tests)
**Location:** `packages/library/__tests__/`, `src/domain/`

| Service | Test Count | Focus |
|---------|-----------|-------|
| OpenAI Service | 12 | API integration, error handling |
| Chat Utils | 23 | localStorage, data persistence |
| Log Parser | 9 | Log parsing, telemetry extraction |
| Vector Store | 50+ | Indexing, search, embeddings |
| RAG Enrichment | 8 | Component enrichment |

### **Orchestration Tests** (80+ tests)
**Location:** `tests/`, `scripts/__tests__/`

| Test Type | Count | Purpose |
|-----------|-------|---------|
| Domain Registry | 5 | Orchestration invariants |
| Sequence Validation | 10+ | Musical sequence schema |
| Topics Manifest | 6 | Topic routing guardrails |
| Orchestration Registry | 7 | Completeness checks |
| Architecture Governance | 10+ | Handler indexing, compliance |

### **Business Logic Tests** (150+ tests)
**Location:** `packages/self-healing/__tests__/`

| Category | Test Count | Status |
|----------|-----------|--------|
| Telemetry Parsing | 15 | ✅ Active |
| Anomaly Detection | 23 | ✅ Active |
| Diagnosis Analysis | 23 | ✅ Active |
| Business BDD Handlers | 67 | ⏸️ Mostly Skipped |
| Deployment Flows | 22 | ⏸️ Skipped |
| Learning Tracking | 20 | ⏸️ Skipped |

### **Integration Tests** (100+ tests)
**Location:** `packages/canvas-component/__tests__/`, `tests/`

| Test Type | Count | Scope |
|-----------|-------|-------|
| Canvas-Control Panel | 10+ | Bidirectional attribute editing |
| Event Routing | 15+ | Event flow, topic publishing |
| Plugin Loading | 5+ | Plugin registration, manifest |
| Sequence Execution | 20+ | Multi-sequence orchestration |
| Component Communication | 15+ | Cross-component messaging |

### **Utility & Helper Tests** (50+ tests)
**Location:** `tests/`, `packages/*/`

| Utility | Test Count | Purpose |
|---------|-----------|---------|
| ASCII Sketcher | 5 | ASCII rendering |
| Config Service | 14 | Configuration management |
| Log Converter | 9 | Log format conversion |
| Musical Sequence Schema | 5 | Schema validation |
| Symphonic Code Analysis | 3 | Code pattern analysis |

## Test Distribution by Plugin

### **Canvas Component Plugin**
- **Total Tests:** 150+
- **Handlers:** 30+
- **Coverage:** Drag, resize, select, import, export, SVG manipulation

### **Control Panel Plugin**
- **Total Tests:** 100+
- **Handlers:** 25+
- **Coverage:** Field editing, CSS management, schema resolution

### **Library Plugin**
- **Total Tests:** 80+
- **Handlers:** 20+
- **Coverage:** Component loading, OpenAI integration, RAG

### **Self-Healing Plugin**
- **Total Tests:** 200+
- **Handlers:** 67+
- **Coverage:** Telemetry, anomaly detection, diagnosis, fixes

### **Musical Conductor**
- **Total Tests:** 50+
- **Coverage:** CLI tools, sequence execution, performance analysis

### **Real Estate Analyzer**
- **Total Tests:** 16
- **Handlers:** 10
- **Coverage:** Property analysis, opportunity detection

## Test Execution Patterns

### **Fast Tests** (< 50ms)
- Utility functions
- Configuration services
- Schema validation
- Handler exports

### **Medium Tests** (50-500ms)
- Component rendering
- DOM manipulation
- Event handling
- Service integration

### **Slow Tests** (> 500ms)
- Full workflow integration
- Telemetry analysis
- Vector store operations
- Diagnosis analysis (78+ seconds)

## Skipped Tests Analysis

**Total Skipped:** 194 (9.8%)

| Category | Count | Reason |
|----------|-------|--------|
| Self-Healing BDD | 120+ | Incomplete implementation |
| Plugin Loading | 5 | Environment setup |
| Integration Flows | 20+ | Pending completion |
| E2E Scenarios | 10+ | Manual testing required |
| Desktop Tests | 30+ | Separate .NET suite |

