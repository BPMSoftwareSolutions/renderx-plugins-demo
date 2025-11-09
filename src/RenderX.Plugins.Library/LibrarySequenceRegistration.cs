using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MusicalConductor.Core.Interfaces;
using MusicalConductor.Core.Models;
using RenderX.Plugins.Library.Handlers;

namespace RenderX.Plugins.Library;

/// <summary>
/// Sequence registration helpers for Library plugin.
/// Contains 1 sequence registration method.
/// </summary>
public static class LibrarySequenceRegistration
{
    public static void RegisterAllSequences(
        List<ISequence> sequences,
        LibraryHandlers handlers)
    {
        RegisterLoadSequence(sequences, handlers);
    }

    private static void RegisterLoadSequence(List<ISequence> sequences, LibraryHandlers handlers)
    {
        var sequence = new Sequence
        {
            Id = "library-load-symphony",
            Name = "Library Load",
            Category = "library",
            Description = "Load component library templates and metadata"
        };

        var movement = new Movement { Id = "load", Name = "Load" };
        movement.AddBeat(new Beat
        {
            Id = "beat-1",
            Event = "library:load",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.LoadLibrary(data, ctx))
        });

        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }
}
