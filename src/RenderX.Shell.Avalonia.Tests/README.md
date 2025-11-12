# RenderX Shell Avalonia E2E Tests

This project contains end-to-end (E2E) tests for the RenderX Shell Avalonia application using FlaUI for UI automation testing.

## Overview

The tests use FlaUI (Fluent UI Automation) to automate testing of the Avalonia-based desktop application. FlaUI provides a .NET library for automating Windows applications through UI Automation (UIA).

## Test Structure

- **ApplicationTests.cs**: Main test class containing E2E tests for the application startup, window display, and basic UI functionality.

## Prerequisites

1. **Windows OS**: Tests require Windows as they use Windows UI Automation APIs.
2. **.NET 8.0**: The test project targets `net8.0-windows`.
3. **Built Application**: The main RenderX.Shell.Avalonia application must be built before running tests.

## Dependencies

- **FlaUI.Core**: Core FlaUI functionality
- **FlaUI.UIA3**: Windows UI Automation 3.0 provider
- **xUnit**: Testing framework
- **Microsoft.NET.Test.Sdk**: Test SDK for .NET

## Running Tests

### From Visual Studio

1. Open the solution in Visual Studio
2. Build the entire solution (including the main application)
3. Run tests from Test Explorer

### From Command Line

```bash
# Build the solution
dotnet build

# Run tests
dotnet test src/RenderX.Shell.Avalonia.Tests/RenderX.Shell.Avalonia.Tests.csproj
```

## Test Scenarios

### Application Startup Tests

- **Application_Starts_And_Shows_MainWindow**: Verifies the application launches and displays the main window with correct title
- **Application_Loads_WebView_Content**: Tests that the WebView component loads within the application
- **Application_Shows_Loading_Indicator_Initially**: Checks for the initial loading indicator text
- **Application_Has_Expected_Window_Size**: Validates minimum window dimensions

## Test Execution Details

1. **Application Launch**: Tests automatically locate and launch the built executable from the Debug or Release build directories
2. **UI Automation**: Uses FlaUI with UIA3 automation to interact with the application's UI elements
3. **Cleanup**: Each test properly disposes of automation objects and closes the application

## Troubleshooting

### Common Issues

1. **Application executable not found**: Ensure the main project is built before running tests
2. **UI elements not found**: The application may need more time to initialize; adjust wait times if needed
3. **Windows UI Automation not available**: Ensure tests are run on Windows with proper permissions

### Test Configuration

- Tests wait up to 3 seconds for application startup
- Additional 2-5 second waits for UI elements to become available
- Window detection uses process ID matching for reliability

## Adding New Tests

When adding new tests:

1. Inherit from the base test class or implement `IDisposable` for proper cleanup
2. Use `LaunchApplication()` and `GetMainWindow()` helper methods
3. Follow the existing pattern of Arrange-Act-Assert
4. Add appropriate wait times for UI operations

## Integration with CI/CD

These tests can be integrated into CI/CD pipelines to ensure UI functionality remains intact across changes. Ensure the build environment has Windows and the required .NET workloads installed.