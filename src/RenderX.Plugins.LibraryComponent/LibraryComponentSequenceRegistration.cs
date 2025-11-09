using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MusicalConductor.Core.Interfaces;
using MusicalConductor.Core.Models;
using RenderX.Plugins.LibraryComponent.Handlers;

namespace RenderX.Plugins.LibraryComponent;

/// <summary>
/// Sequence registration helpers for LibraryComponent plugin.
/// Contains 3 sequence registration methods.
/// </summary>
public static class LibraryComponentSequenceRegistration
{
    public static void RegisterAllSequences(
        List<ISequence> sequences,
        LibraryComponentHandlers handlers)
    {
        RegisterDragSequence(sequences, handlers);
        RegisterDropSequence(sequences, handlers);
        RegisterContainerDropSequence(sequences, handlers);
    }

    private static void RegisterDragSequence(List<ISequence> sequences, LibraryComponentHandlers handlers)
    {
        var sequence = new Sequence
        {
            Id = "library-component-drag-symphony",
            Name = "Library Component Drag",
            Category = "library-component",
            Description = "Handle drag start from library component"
        };

        var movement = new Movement { Id = "drag", Name = "Drag" };
        movement.AddBeat(new Beat
        {
            Id = "beat-1",
            Event = "library:component:drag",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.HandleDrag(data, ctx))
        });

        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterDropSequence(List<ISequence> sequences, LibraryComponentHandlers handlers)
    {
        var sequence = new Sequence
        {
            Id = "library-component-drop-symphony",
            Name = "Library Component Drop",
            Category = "library-component",
            Description = "Handle drop onto canvas"
        };

        var movement = new Movement { Id = "drop", Name = "Drop" };
        movement.AddBeat(new Beat
        {
            Id = "beat-1",
            Event = "library:component:drop",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.HandleDrop(data, ctx))
        });

        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterContainerDropSequence(List<ISequence> sequences, LibraryComponentHandlers handlers)
    {
        var sequence = new Sequence
        {
            Id = "library-component-container-drop-symphony",
            Name = "Library Component Container Drop",
            Category = "library-component",
            Description = "Handle drop onto container (nested drop)"
        };

        var movement = new Movement { Id = "containerDrop", Name = "Container Drop" };
        movement.AddBeat(new Beat
        {
            Id = "beat-1",
            Event = "library:component:container:drop",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.HandleContainerDrop(data, ctx))
        });

        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }
}
