using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MusicalConductor.Core.Interfaces;
using MusicalConductor.Core.Models;
using RenderX.Plugins.ControlPanel.Handlers;

namespace RenderX.Plugins.ControlPanel;

/// <summary>
/// Sequence registration helpers for ControlPanel plugin.
/// Contains all 13 sequence registration methods.
/// </summary>
public static class ControlPanelSequenceRegistration
{
    public static void RegisterAllSequences(
        List<ISequence> sequences,
        ControlPanelHandlers handlers)
    {
        RegisterClassesAddSequence(sequences, handlers);
        RegisterClassesRemoveSequence(sequences, handlers);
        RegisterCssCreateSequence(sequences, handlers);
        RegisterCssEditSequence(sequences, handlers);
        RegisterCssDeleteSequence(sequences, handlers);
        RegisterSelectionShowSequence(sequences, handlers);
        RegisterUiFieldChangeSequence(sequences, handlers);
        RegisterUiFieldValidateSequence(sequences, handlers);
        RegisterUiInitSequence(sequences, handlers);
        RegisterUiInitBatchedSequence(sequences, handlers);
        RegisterUiRenderSequence(sequences, handlers);
        RegisterUiSectionToggleSequence(sequences, handlers);
        RegisterUpdateSequence(sequences, handlers);
    }

    private static void RegisterClassesAddSequence(List<ISequence> sequences, ControlPanelHandlers handlers)
    {
        var sequence = new Sequence
        {
            Id = "control-panel-classes-add-symphony",
            Name = "Control Panel Classes Add",
            Category = "control-panel",
            Description = "Add CSS class to canvas element"
        };

        var movement = new Movement { Id = "addClass", Name = "Add Class" };
        movement.AddBeat(new Beat
        {
            Id = "beat-1",
            Event = "control:panel:classes:add",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.AddClass(data, ctx))
        });

        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterClassesRemoveSequence(List<ISequence> sequences, ControlPanelHandlers handlers)
    {
        var sequence = new Sequence
        {
            Id = "control-panel-classes-remove-symphony",
            Name = "Control Panel Classes Remove",
            Category = "control-panel",
            Description = "Remove CSS class from canvas element"
        };

        var movement = new Movement { Id = "removeClass", Name = "Remove Class" };
        movement.AddBeat(new Beat
        {
            Id = "beat-1",
            Event = "control:panel:classes:remove",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.RemoveClass(data, ctx))
        });

        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterCssCreateSequence(List<ISequence> sequences, ControlPanelHandlers handlers)
    {
        var sequence = new Sequence
        {
            Id = "control-panel-css-create-symphony",
            Name = "Control Panel CSS Create",
            Category = "control-panel",
            Description = "Create new CSS class definition"
        };

        var movement = new Movement { Id = "createCss", Name = "Create CSS" };
        movement.AddBeat(new Beat
        {
            Id = "beat-1",
            Event = "control:panel:css:create",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.CreateCssClass(data, ctx))
        });

        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterCssEditSequence(List<ISequence> sequences, ControlPanelHandlers handlers)
    {
        var sequence = new Sequence
        {
            Id = "control-panel-css-edit-symphony",
            Name = "Control Panel CSS Edit",
            Category = "control-panel",
            Description = "Edit existing CSS class definition"
        };

        var movement = new Movement { Id = "editCss", Name = "Edit CSS" };
        movement.AddBeat(new Beat
        {
            Id = "beat-1",
            Event = "control:panel:css:edit",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.UpdateCssClass(data, ctx))
        });

        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterCssDeleteSequence(List<ISequence> sequences, ControlPanelHandlers handlers)
    {
        var sequence = new Sequence
        {
            Id = "control-panel-css-delete-symphony",
            Name = "Control Panel CSS Delete",
            Category = "control-panel",
            Description = "Delete CSS class definition"
        };

        var movement = new Movement { Id = "deleteCss", Name = "Delete CSS" };
        movement.AddBeat(new Beat
        {
            Id = "beat-1",
            Event = "control:panel:css:delete",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.DeleteCssClass(data, ctx))
        });

        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterSelectionShowSequence(List<ISequence> sequences, ControlPanelHandlers handlers)
    {
        var sequence = new Sequence
        {
            Id = "control-panel-selection-show-symphony",
            Name = "Control Panel Selection Show",
            Category = "control-panel",
            Description = "Show control panel for selected component"
        };

        var movement = new Movement { Id = "showSelection", Name = "Show Selection" };
        movement.AddBeat(new Beat
        {
            Id = "beat-1",
            Event = "control:panel:selection:show",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.DeriveSelectionModel(data, ctx))
        });

        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterUiFieldChangeSequence(List<ISequence> sequences, ControlPanelHandlers handlers)
    {
        var sequence = new Sequence
        {
            Id = "control-panel-ui-field-change-symphony",
            Name = "Control Panel UI Field Change",
            Category = "control-panel",
            Description = "Handle field value changes in control panel"
        };

        var movement = new Movement { Id = "fieldChange", Name = "Field Change" };
        movement.AddBeat(new Beat
        {
            Id = "beat-1",
            Event = "control:panel:ui:field:change",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.HandleFieldChange(data, ctx))
        });

        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterUiFieldValidateSequence(List<ISequence> sequences, ControlPanelHandlers handlers)
    {
        var sequence = new Sequence
        {
            Id = "control-panel-ui-field-validate-symphony",
            Name = "Control Panel UI Field Validate",
            Category = "control-panel",
            Description = "Validate field value in control panel"
        };

        var movement = new Movement { Id = "fieldValidate", Name = "Field Validate" };
        movement.AddBeat(new Beat
        {
            Id = "beat-1",
            Event = "control:panel:ui:field:validate",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.ValidateField(data, ctx))
        });

        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterUiInitSequence(List<ISequence> sequences, ControlPanelHandlers handlers)
    {
        var sequence = new Sequence
        {
            Id = "control-panel-ui-init-symphony",
            Name = "Control Panel UI Init",
            Category = "control-panel",
            Description = "Initialize control panel UI"
        };

        var movement = new Movement { Id = "uiInit", Name = "UI Init" };
        movement.AddBeat(new Beat
        {
            Id = "beat-1",
            Event = "control:panel:ui:init",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.InitializeUi(data, ctx))
        });

        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterUiInitBatchedSequence(List<ISequence> sequences, ControlPanelHandlers handlers)
    {
        var sequence = new Sequence
        {
            Id = "control-panel-ui-init-batched-symphony",
            Name = "Control Panel UI Init Batched",
            Category = "control-panel",
            Description = "Initialize control panel UI in batches"
        };

        var movement = new Movement { Id = "uiInitBatched", Name = "UI Init Batched" };
        movement.AddBeat(new Beat
        {
            Id = "beat-1",
            Event = "control:panel:ui:init:batched",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.InitializeUiBatched(data, ctx))
        });

        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterUiRenderSequence(List<ISequence> sequences, ControlPanelHandlers handlers)
    {
        var sequence = new Sequence
        {
            Id = "control-panel-ui-render-symphony",
            Name = "Control Panel UI Render",
            Category = "control-panel",
            Description = "Render control panel UI"
        };

        var movement = new Movement { Id = "uiRender", Name = "UI Render" };
        movement.AddBeat(new Beat
        {
            Id = "beat-1",
            Event = "control:panel:ui:render",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.RenderUi(data, ctx))
        });

        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterUiSectionToggleSequence(List<ISequence> sequences, ControlPanelHandlers handlers)
    {
        var sequence = new Sequence
        {
            Id = "control-panel-ui-section-toggle-symphony",
            Name = "Control Panel UI Section Toggle",
            Category = "control-panel",
            Description = "Toggle section expand/collapse in control panel"
        };

        var movement = new Movement { Id = "sectionToggle", Name = "Section Toggle" };
        movement.AddBeat(new Beat
        {
            Id = "beat-1",
            Event = "control:panel:ui:section:toggle",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.ToggleSection(data, ctx))
        });

        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterUpdateSequence(List<ISequence> sequences, ControlPanelHandlers handlers)
    {
        var sequence = new Sequence
        {
            Id = "control-panel-update-symphony",
            Name = "Control Panel Update",
            Category = "control-panel",
            Description = "Update control panel with new data"
        };

        var movement = new Movement { Id = "update", Name = "Update" };
        movement.AddBeat(new Beat
        {
            Id = "beat-1",
            Event = "control:panel:update",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.UpdateControlPanel(data, ctx))
        });

        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }
}
