using System;
using System.IO;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MusicalConductor.Avalonia.Extensions;
using MusicalConductor.Avalonia.Interfaces;
using Xunit;

namespace MusicalConductor.Avalonia.Tests
{
    public class JintClient_MinimalTests : IDisposable
    {
        private readonly string _tempBundlePath;
        private readonly string? _prevEnv;

        public JintClient_MinimalTests()
        {
            // Minimal JS bundle that exposes required API surface with simple return values
            var js = @"(function(){
  var MC = {
    play: function(pluginId, sequenceId, context, priority){ return 'req-123'; },
    getStatus: function(){ return 'status-ok'; },
    getStatistics: function(){ return 1; },
    registerCIAPlugins: function(){ return true; },
    on: function(evt, cb){ },
    off: function(evt, cb){ }
  };
  if (typeof globalThis !== 'undefined') { globalThis.MusicalConductor = MC; }
  else if (typeof window !== 'undefined') { window.MusicalConductor = MC; }
  else if (typeof global !== 'undefined') { global.MusicalConductor = MC; }
})();";

            _tempBundlePath = Path.Combine(Path.GetTempPath(), $"mc-bundle-{Guid.NewGuid():N}.js");
            File.WriteAllText(_tempBundlePath, js);

            // Set env var override for JintEngineHost to load this file
            _prevEnv = Environment.GetEnvironmentVariable("MC_BUNDLE_PATH");
            Environment.SetEnvironmentVariable("MC_BUNDLE_PATH", _tempBundlePath);
        }

        public void Dispose()
        {
            try { if (File.Exists(_tempBundlePath)) File.Delete(_tempBundlePath); } catch { }
            Environment.SetEnvironmentVariable("MC_BUNDLE_PATH", _prevEnv);
        }

        private static IConductorClient CreateClient()
        {
            var services = new ServiceCollection();
            services.AddLogging(b => b.SetMinimumLevel(LogLevel.Warning));
            services.AddMusicalConductor();
            var provider = services.BuildServiceProvider();
            return provider.GetRequiredService<IConductorClient>();
        }

        [Fact]
        public void Play_Returns_RequestId()
        {
            var client = CreateClient();
            var req = client.Play("plugin", "seq1");
            Assert.Equal("req-123", req);
        }

        [Fact]
        public void GetStatus_Returns_String()
        {
            var client = CreateClient();
            var status = client.GetStatus();
            Assert.Equal("status-ok", status);
        }

        [Fact]
        public void GetStatistics_Returns_Number()
        {
            var client = CreateClient();
            var stats = client.GetStatistics();
            Assert.Equal(1d, Convert.ToDouble(stats));
        }

        [Fact]
        public async Task RegisterCIAPlugins_Completes()
        {
            var client = CreateClient();
            await client.RegisterCIAPlugins();
        }
    }
}

