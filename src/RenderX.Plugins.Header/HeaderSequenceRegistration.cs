using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MusicalConductor.Core.Interfaces;
using MusicalConductor.Core.Models;
using RenderX.Plugins.Header.Handlers;

namespace RenderX.Plugins.Header;

/// <summary>
/// Sequence registration helpers for Header plugin.
/// Contains all 2 sequence registration methods.
/// </summary>
public static class HeaderSequenceRegistration
{
    public static void RegisterAllSequences(
        List<ISequence> sequences,
        HeaderHandlers handlers)
    {
        RegisterUiThemeGetSequence(sequences, handlers);
        RegisterUiThemeToggleSequence(sequences, handlers);
    }

    private static void RegisterUiThemeGetSequence(List<ISequence> sequences, HeaderHandlers handlers)
    {
        var sequence = new Sequence
        {
            Id = "header-ui-theme-get-symphony",
            Name = "Header UI Theme Get",
            Category = "header",
            Description = "Get current theme"
        };

        var movement = new Movement { Id = "getTheme", Name = "Get Theme" };
        movement.AddBeat(new Beat
        {
            Id = "beat-1",
            Event = "header:ui:theme:get",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.GetTheme(data, ctx))
        });

        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterUiThemeToggleSequence(List<ISequence> sequences, HeaderHandlers handlers)
    {
        var sequence = new Sequence
        {
            Id = "header-ui-theme-toggle-symphony",
            Name = "Header UI Theme Toggle",
            Category = "header",
            Description = "Toggle theme between light and dark"
        };

        var movement = new Movement { Id = "toggleTheme", Name = "Toggle Theme" };
        movement.AddBeat(new Beat
        {
            Id = "beat-1",
            Event = "header:ui:theme:toggle",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.ToggleTheme(data, ctx))
        });

        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }
}
