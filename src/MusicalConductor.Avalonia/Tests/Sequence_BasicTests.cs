using Xunit;
using MusicalConductor.Core.Models;
using MusicalConductor.Core.Interfaces;

namespace MusicalConductor.Core.Tests;

public class Sequence_BasicTests
{
    [Fact]
    public void Register_ThenGet_ReturnsSequence()
    {
        var registry = new SequenceRegistry();
        var seq = new Sequence { Id = "seq-1", Name = "Test" };

        registry.Register(seq);
        var result = registry.Get("seq-1");

        Assert.NotNull(result);
        Assert.Equal("seq-1", result!.Id);
    }

    [Fact]
    public void GetByCategory_FiltersCorrectly()
    {
        var registry = new SequenceRegistry();
        var a = new Sequence { Id = "a", Category = "alpha" };
        var b = new Sequence { Id = "b", Category = "beta" };
        var c = new Sequence { Id = "c", Category = "alpha" };

        registry.Register(a);
        registry.Register(b);
        registry.Register(c);

        var alpha = registry.GetByCategory("alpha").ToList();

        Assert.Equal(2, alpha.Count);
        Assert.All(alpha, s => Assert.Equal("alpha", s.Category));
    }
}

