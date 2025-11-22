# 🤖 Self-Healing System Plugin

Autonomous system that detects, diagnoses, fixes, and learns from production issues.

## Features

### 🔍 Telemetry Parsing
- Parse production logs from `.logs/` directory
- Extract beat-started, beat-completed, and error events
- Normalize timestamps and handler names
- Aggregate performance metrics

### 🚨 Anomaly Detection
- Detect performance anomalies (handlers exceeding thresholds)
- Detect behavioral anomalies (sequence order issues)
- Detect coverage gaps (untested handlers)
- Detect error patterns (failure modes)

### 🧠 Root Cause Diagnosis
- Analyze performance issues
- Analyze behavioral issues
- Analyze coverage gaps
- Analyze error patterns
- Assess impact and severity
- Recommend fixes

### 🔧 Fix Generation
- Generate optimized code
- Generate test cases from production data
- Generate documentation updates
- Create unified patches

### ✅ Validation
- Run tests on patched code
- Check test coverage
- Verify performance improvements
- Validate documentation

### 🚀 Deployment
- Create feature branches
- Create pull requests
- Run CI checks
- Auto-merge on success
- Deploy to production

### 🧠 Learning
- Collect post-deployment metrics
- Compare before/after metrics
- Calculate improvements
- Update learning models
- Generate insights

## Architecture

### 7 Sequences
1. **telemetry.parse** - Parse production telemetry (7 handlers)
2. **anomaly.detect** - Detect anomalies (9 handlers)
3. **diagnosis.analyze** - Analyze root causes (11 handlers)
4. **fix.generate** - Generate fixes (9 handlers)
5. **validation.run** - Validate fixes (10 handlers)
6. **deployment.deploy** - Deploy fixes (11 handlers)
7. **learning.track** - Track effectiveness (10 handlers)

### 67 Total Handlers

## Usage

### Installation
```bash
npm install @renderx-plugins/self-healing
```

### Registration
```typescript
import { SelfHealingPlugin } from '@renderx-plugins/self-healing';

// Register with conductor
conductor.registerPlugin(SelfHealingPlugin);
```

### Running Sequences
```typescript
// Parse telemetry
await conductor.play('self-healing:telemetry:parse', {
  logsDirectory: '.logs'
});

// Detect anomalies
await conductor.play('self-healing:anomaly:detect', {
  recordId: 'telemetry-123'
});

// Analyze root causes
await conductor.play('self-healing:diagnosis:analyze', {
  recordId: 'anomaly-456'
});

// Generate fixes
await conductor.play('self-healing:fix:generate', {
  recordId: 'diagnosis-789'
});

// Validate fixes
await conductor.play('self-healing:validation:run', {
  recordId: 'fix-101'
});

// Deploy fixes
await conductor.play('self-healing:deployment:deploy', {
  recordId: 'validation-202'
});

// Track effectiveness
await conductor.play('self-healing:learning:track', {
  recordId: 'deployment-303'
});
```

## Documentation

- **[SELF_HEALING_SYSTEM_BRAINSTORM.md](./docs/SELF_HEALING_SYSTEM_BRAINSTORM.md)** - Vision & capabilities
- **[SELF_HEALING_HANDLERS_SPECIFICATION.md](./docs/SELF_HEALING_HANDLERS_SPECIFICATION.md)** - Handler specs
- **[SELF_HEALING_TEST_SPECIFICATIONS.md](./docs/SELF_HEALING_TEST_SPECIFICATIONS.md)** - Test specs
- **[SELF_HEALING_TDD_IMPLEMENTATION_GUIDE.md](./docs/SELF_HEALING_TDD_IMPLEMENTATION_GUIDE.md)** - Implementation guide

## Development

### TDD Approach
1. Write tests first (from test specifications)
2. Implement handlers to pass tests
3. Run full test suite
4. Validate with production logs

### Testing
```bash
npm run test              # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Building
```bash
npm run build            # Build package
npm run type-check       # Type checking
npm run lint             # Linting
```

## Status

**Version**: 0.1.0-alpha.1  
**Status**: In Development  
**Handlers**: 67 (0 implemented, 67 pending)  
**Tests**: 150+ (0 passing, 150+ pending)

## Next Steps

1. Implement telemetry parsing handlers
2. Implement anomaly detection handlers
3. Implement diagnosis handlers
4. Implement fix generation handlers
5. Implement validation handlers
6. Implement deployment handlers
7. Implement learning handlers

## License

MIT

