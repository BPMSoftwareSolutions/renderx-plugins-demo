using Avalonia;
using Avalonia.Controls;
using System.Collections.Generic;

namespace RenderX.Plugins.Diagnostics;

/// <summary>
/// Sequence inspector - displays registered sequences and their execution status
/// </summary>
public partial class SequenceInspector : UserControl
{
    public class SequenceInfo
    {
        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public string Status { get; set; } = "";
        public string ExecutionTime { get; set; } = "";
    }

    public static readonly StyledProperty<List<SequenceInfo>> SequencesProperty =
        AvaloniaProperty.Register<SequenceInspector, List<SequenceInfo>>(
            nameof(Sequences),
            new List<SequenceInfo>());

    public List<SequenceInfo> Sequences
    {
        get => GetValue(SequencesProperty);
        set => SetValue(SequencesProperty, value);
    }

    public SequenceInspector()
    {
        InitializeComponent();
        UpdateSequences();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == SequencesProperty)
        {
            UpdateSequences();
        }
    }

    private void UpdateSequences()
    {
        var sequencesControl = this.FindControl<ItemsControl>("SequencesItemsControl");
        if (sequencesControl != null)
        {
            sequencesControl.ItemsSource = Sequences;
        }
    }
}

