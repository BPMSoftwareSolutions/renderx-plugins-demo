# Test Execution Guide

## Quick Start

### Run All Tests

```bash
cd C:\source\repos\bpm\internal\MusicalConductor
dotnet test
```

### Run Phase 1 Tests

```bash
dotnet test tools/avalonia-integration/Tests/MusicalConductor.Avalonia.Tests.csproj
```

### Run Phase 2 Tests

```bash
dotnet test tools/avalonia-integration/MusicalConductor.Core/Tests/MusicalConductor.Core.Tests.csproj
```

## Detailed Test Execution

### Build First

```bash
dotnet build --configuration Release
```

### Run Tests with Options

#### Verbose Output
```bash
dotnet test --verbosity detailed
```

#### Specific Test Class
```bash
dotnet test --filter "ClassName=EventBusTests"
```

#### Specific Test Method
```bash
dotnet test --filter "FullyQualifiedName~EventBusTests.Subscribe_WithValidEventAndCallback_ReturnsSubscription"
```

#### With Code Coverage
```bash
dotnet test /p:CollectCoverage=true /p:CoverageFormat=opencover
```

#### With Test Results Export
```bash
dotnet test --logger "trx;LogFileName=test-results.trx"
```

#### Parallel Execution
```bash
dotnet test --parallel
```

#### Stop on First Failure
```bash
dotnet test --no-build --stop-on-failure
```

## Test Suites

### Phase 1: Avalonia Integration

**Project:** `tools/avalonia-integration/Tests/MusicalConductor.Avalonia.Tests.csproj`

**Tests:**
- ConductorClientTests (10 tests)

**Run:**
```bash
dotnet test tools/avalonia-integration/Tests/MusicalConductor.Avalonia.Tests.csproj --verbosity normal
```

### Phase 2: Core Architecture

**Project:** `tools/avalonia-integration/MusicalConductor.Core/Tests/MusicalConductor.Core.Tests.csproj`

**Tests:**
- EventBusTests (15 tests)
- SequenceTests (20 tests)
- ConductorTests (15 tests)
- PluginManagerTests (15 tests)

**Run:**
```bash
dotnet test tools/avalonia-integration/MusicalConductor.Core/Tests/MusicalConductor.Core.Tests.csproj --verbosity normal
```

## Test Categories

### EventBus Tests

```bash
dotnet test --filter "ClassName=EventBusTests"
```

**Coverage:**
- Subscribe/Unsubscribe
- Emit (sync/async)
- Subscriber counting
- Error handling
- Thread safety

### Sequence Tests

```bash
dotnet test --filter "ClassName=SequenceTests"
```

**Coverage:**
- Beat creation
- Movement management
- Sequence composition
- Registry operations
- Category queries

### Conductor Tests

```bash
dotnet test --filter "ClassName=ConductorTests"
```

**Coverage:**
- Sequence execution
- Event emission
- Statistics tracking
- Status reporting
- Error handling

### PluginManager Tests

```bash
dotnet test --filter "ClassName=PluginManagerTests"
```

**Coverage:**
- Plugin registration
- Handler lookup
- Plugin lifecycle
- Error handling

## Code Coverage

### Generate Coverage Report

```bash
dotnet test /p:CollectCoverage=true /p:CoverageFormat=opencover /p:CoverageDirectory=./coverage
```

### View Coverage Report

Coverage files are generated in `./coverage/` directory:
- `coverage.opencover.xml` - OpenCover format
- `coverage.cobertura.xml` - Cobertura format

### Coverage Targets

- **Overall:** 80%+
- **EventBus:** 90%+
- **Sequence Models:** 85%+
- **Conductor:** 85%+
- **PluginManager:** 85%+

## Continuous Integration

### Local CI Simulation

Run the same tests as CI pipeline:

```bash
# Build
dotnet build --configuration Release

# Phase 1 Tests
dotnet test tools/avalonia-integration/Tests/MusicalConductor.Avalonia.Tests.csproj --configuration Release --no-build --verbosity normal

# Phase 2 Tests
dotnet test tools/avalonia-integration/MusicalConductor.Core/Tests/MusicalConductor.Core.Tests.csproj --configuration Release --no-build --verbosity normal
```

### GitHub Actions

Tests run automatically on:
- Push to main, develop, pr-* branches
- Pull requests to main or develop

View results:
1. Go to Actions tab
2. Click on workflow run
3. View test results

## Debugging Tests

### Visual Studio

1. Open test file
2. Right-click on test method
3. Select "Debug Test"

### VS Code

1. Install C# extension
2. Set breakpoint in test
3. Run test with debugger

### Command Line

```bash
dotnet test --logger "console;verbosity=detailed" --diag "diagnostics.log"
```

## Performance Testing

### Run Performance Tests

```bash
dotnet test --filter "Category=Performance"
```

### Benchmark Targets

- EventBus.Emit: <1ms
- Conductor.Play: <2ms
- SequenceRegistry.Get: <0.5ms

## Troubleshooting

### Tests Not Found

**Issue:** "No test is available in..."

**Solution:**
```bash
dotnet test --list-tests
```

### Build Errors

**Issue:** "The project file could not be loaded"

**Solution:**
```bash
dotnet restore
dotnet build --configuration Release
```

### Test Timeout

**Issue:** "Test execution timeout"

**Solution:**
```bash
dotnet test --logger "console;verbosity=detailed" --diag "diagnostics.log"
```

### Mock Issues

**Issue:** "Mock setup not working"

**Solution:**
- Verify mock setup matches method signature
- Check mock is passed to component
- Use `Times.Once` to verify calls

## Test Results Format

### Console Output

```
Test Run Successful.
Total tests: 75
     Passed: 75
     Failed: 0
 Skipped: 0
```

### TRX Format

```bash
dotnet test --logger "trx;LogFileName=test-results.trx"
```

Results saved to `test-results.trx`

### OpenCover Format

```bash
dotnet test /p:CollectCoverage=true /p:CoverageFormat=opencover
```

Results saved to `coverage/coverage.opencover.xml`

## Best Practices

1. **Run tests before committing**
   ```bash
   dotnet test
   ```

2. **Run tests after pulling**
   ```bash
   dotnet restore && dotnet test
   ```

3. **Run tests before pushing**
   ```bash
   dotnet test --configuration Release
   ```

4. **Check coverage regularly**
   ```bash
   dotnet test /p:CollectCoverage=true
   ```

5. **Keep tests fast**
   - Avoid I/O operations
   - Use mocks for external dependencies
   - Minimize delays

## Continuous Monitoring

### Watch Tests

```bash
dotnet watch test
```

### Run Tests on File Change

```bash
dotnet watch test --watch-path tools/avalonia-integration
```

## Integration with IDEs

### Visual Studio

- Test Explorer: View → Test Explorer
- Run All: Ctrl+R, A
- Run Selected: Ctrl+R, T
- Debug Selected: Ctrl+R, D

### VS Code

- Test Explorer extension
- Run tests from command palette
- Debug with launch configuration

## Reporting

### Generate Test Report

```bash
dotnet test --logger "trx;LogFileName=test-results.trx" --logger "console;verbosity=normal"
```

### Upload to CI

Test results automatically uploaded to GitHub Actions.

## Next Steps

1. Run all tests: `dotnet test`
2. Check coverage: `dotnet test /p:CollectCoverage=true`
3. Review results
4. Fix any failures
5. Commit with confidence

