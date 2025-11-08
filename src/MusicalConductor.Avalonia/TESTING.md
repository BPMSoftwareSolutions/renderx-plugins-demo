# MusicalConductor Avalonia.NET - Testing Guide

## Overview

This document describes the testing strategy and how to run tests for the MusicalConductor Avalonia.NET implementation.

## Test Structure

### Phase 1: Avalonia Integration Tests

**Location:** `tools/avalonia-integration/Tests/`

- **ConductorClientTests.cs** - Tests for the Jint-based client wrapper
  - Constructor validation
  - Play() method
  - Event subscription/unsubscription
  - Status and statistics retrieval
  - CIA plugin registration

### Phase 2: Core Architecture Tests

**Location:** `tools/avalonia-integration/MusicalConductor.Core/Tests/`

- **EventBusTests.cs** - Tests for the event bus
  - Subscribe/unsubscribe operations
  - Event emission (sync and async)
  - Subscriber counting
  - Error handling
  - Thread safety

- **SequenceTests.cs** - Tests for sequence models
  - Beat creation and properties
  - Movement management
  - Sequence composition
  - Registry operations
  - Category-based queries

- **ConductorTests.cs** - Tests for the conductor orchestration
  - Sequence execution
  - Event emission
  - Statistics tracking
  - Status reporting
  - Error handling

- **PluginManagerTests.cs** - Tests for plugin management
  - Plugin registration/unregistration
  - Handler lookup
  - Plugin lifecycle
  - Error handling

## Running Tests

### Run All Tests

```bash
dotnet test
```

### Run Phase 1 Tests Only

```bash
dotnet test tools/avalonia-integration/Tests/MusicalConductor.Avalonia.Tests.csproj
```

### Run Phase 2 Tests Only

```bash
dotnet test tools/avalonia-integration/MusicalConductor.Core/Tests/MusicalConductor.Core.Tests.csproj
```

### Run Specific Test Class

```bash
dotnet test --filter "ClassName=EventBusTests"
```

### Run Specific Test Method

```bash
dotnet test --filter "FullyQualifiedName~EventBusTests.Subscribe_WithValidEventAndCallback_ReturnsSubscription"
```

### Run with Verbose Output

```bash
dotnet test --verbosity detailed
```

### Run with Code Coverage

```bash
dotnet test /p:CollectCoverage=true /p:CoverageFormat=opencover
```

## Test Categories

### Unit Tests

All tests are unit tests that verify individual components in isolation using mocks.

**Coverage:**
- EventBus: 15+ tests
- Sequence Models: 20+ tests
- Conductor: 15+ tests
- PluginManager: 15+ tests
- ConductorClient: 10+ tests

**Total:** 75+ unit tests

### Integration Tests

Integration tests verify components working together. These are included in the main test suites.

### Performance Tests

Performance tests verify acceptable latency and throughput.

**Run performance tests:**
```bash
dotnet test --filter "Category=Performance"
```

## Test Naming Convention

Tests follow the pattern: `MethodName_Scenario_ExpectedResult`

Examples:
- `Subscribe_WithValidEventAndCallback_ReturnsSubscription`
- `Play_WithNonexistentSequence_IncrementsFailed`
- `GetAllBeats_ReturnsAllBeatsFromAllMovements`

## Mocking Strategy

### Mocks Used

- **ILogger<T>** - Mocked to avoid console output during tests
- **IPlugin** - Mocked for plugin manager tests
- **IHandler** - Mocked for handler tests

### Mock Setup

Mocks are created using Moq library:

```csharp
var mockLogger = new Mock<ILogger<EventBus>>();
var eventBus = new EventBus(mockLogger.Object);
```

## Test Assertions

Tests use xUnit assertions:

```csharp
Assert.NotNull(result);
Assert.Equal(expected, actual);
Assert.True(condition);
Assert.Throws<ArgumentNullException>(() => method());
```

## Continuous Integration

Tests run automatically on:
- Push to main, develop, or pr-* branches
- Pull requests to main or develop

**CI Pipeline:** `.github/workflows/ci-cd.yml`

### CI Test Matrix

- **OS:** Ubuntu, Windows, macOS
- **.NET:** 8.0.x
- **Test Projects:** Phase 1 + Phase 2

## Code Coverage

Target coverage: **80%+**

Coverage is tracked via SonarCloud in the CI pipeline.

### View Coverage Report

```bash
dotnet test /p:CollectCoverage=true /p:CoverageFormat=opencover
```

Coverage report is generated in `coverage/` directory.

## Debugging Tests

### Debug in Visual Studio

1. Open test file
2. Right-click on test method
3. Select "Debug Test"

### Debug in VS Code

1. Install C# extension
2. Set breakpoint in test
3. Run test with debugger

### Debug from Command Line

```bash
dotnet test --logger "console;verbosity=detailed" --diag "diagnostics.log"
```

## Common Issues

### Tests Timeout

**Issue:** Tests take too long to run

**Solution:** 
- Check for blocking operations
- Use `Task.Delay()` instead of `Thread.Sleep()`
- Increase timeout in test settings

### Mock Not Working

**Issue:** Mock setup not being called

**Solution:**
- Verify mock setup matches actual method signature
- Check that mock is passed to component
- Use `Times.Once` to verify calls

### Flaky Tests

**Issue:** Tests pass sometimes, fail other times

**Solution:**
- Avoid time-dependent assertions
- Use `Task.Delay()` for async operations
- Ensure proper cleanup in test teardown

## Best Practices

1. **One assertion per test** - Keep tests focused
2. **Descriptive names** - Use clear test names
3. **Arrange-Act-Assert** - Follow AAA pattern
4. **Mock external dependencies** - Isolate units
5. **Test edge cases** - Include null, empty, invalid inputs
6. **Keep tests fast** - Avoid I/O and long delays
7. **Use fixtures** - Share setup code between tests

## Adding New Tests

### Template

```csharp
[Fact]
public void MethodName_Scenario_ExpectedResult()
{
    // Arrange
    var component = new Component();
    var input = "test";

    // Act
    var result = component.Method(input);

    // Assert
    Assert.NotNull(result);
    Assert.Equal("expected", result);
}
```

### Steps

1. Create test method in appropriate test class
2. Follow naming convention
3. Use Arrange-Act-Assert pattern
4. Add assertions for expected behavior
5. Run test to verify it passes
6. Run all tests to ensure no regressions

## Test Maintenance

### Regular Tasks

- Review test coverage monthly
- Update tests when APIs change
- Remove obsolete tests
- Refactor duplicate test code
- Add tests for bug fixes

### Deprecation

When removing functionality:
1. Mark tests as obsolete
2. Update documentation
3. Remove in next major version

## Resources

- [xUnit Documentation](https://xunit.net/)
- [Moq Documentation](https://github.com/moq/moq4)
- [Unit Testing Best Practices](https://docs.microsoft.com/en-us/dotnet/core/testing/)

## Support

For test-related questions:
- Review existing tests for examples
- Check test documentation
- Consult team members

