## Testing RenderX.HostSDK.Avalonia

This repo contains a comprehensive xUnit test suite for the Avalonia Host SDK. Below are the common workflows.

### Run all tests
<augment_code_snippet mode="EXCERPT">
````bash
# Build solution (optional, test will build as needed)
dotnet build MusicalConductor.sln -c Release --nologo

# Run only the Host SDK tests
dotnet test RenderX.HostSDK.Avalonia/Tests/RenderX.HostSDK.Avalonia.Tests.csproj -c Release --nologo
````
</augment_code_snippet>

### Run a single test class or method
<augment_code_snippet mode="EXCERPT">
````bash
# Filter by fully-qualified name
 dotnet test RenderX.HostSDK.Avalonia/Tests/RenderX.HostSDK.Avalonia.Tests.csproj \
   -c Release --nologo --filter FullyQualifiedName~ServiceRegistrationTests

# Filter by trait or method name
 dotnet test RenderX.HostSDK.Avalonia/Tests/RenderX.HostSDK.Avalonia.Tests.csproj \
   -c Release --nologo --filter "Name~AddRenderXHostSdk_WithOptions_RegistersServicesWithOptions"
````
</augment_code_snippet>

### Test results artifact
In CI, results are uploaded from `RenderX.HostSDK.Avalonia/Tests/TestResults/test-results.trx` as an artifact.

### Notes
- Tests target .NET 8 and run cross-platform.
- If you modify DI registration or options (`HostSdkOptions`), update or add tests accordingly.
- Safe-by-default: these tests do not touch external systems.

