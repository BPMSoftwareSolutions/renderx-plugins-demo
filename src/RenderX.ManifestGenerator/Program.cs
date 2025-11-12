using RenderX.ManifestGenerator;

if (args.Length == 0)
{
    Console.WriteLine("Usage: RenderX.ManifestGenerator <repo-root-path>");
    Console.WriteLine("Example: RenderX.ManifestGenerator C:\\source\\repos\\bpm\\internal\\renderx-plugins-demo");
    return 1;
}

var rootDir = args[0];
if (!Directory.Exists(rootDir))
{
    Console.Error.WriteLine($"❌ Error: Directory not found: {rootDir}");
    return 1;
}

try
{
    var generator = new ManifestGeneratorPipeline(rootDir);
    await generator.ExecuteAsync();
    Console.WriteLine("✅ Manifest generation complete");
    return 0;
}
catch (Exception ex)
{
    Console.Error.WriteLine($"❌ Manifest generation failed: {ex.Message}");
    Console.Error.WriteLine(ex.StackTrace);
    return 1;
}
