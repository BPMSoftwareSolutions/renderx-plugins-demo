using Avalonia;
using Avalonia.Controls;
using System.Collections.Generic;

namespace RenderX.Plugins.Diagnostics;

/// <summary>
/// Plugin tree explorer - displays plugin hierarchy and status
/// </summary>
public partial class PluginTreeExplorer : UserControl
{
    public class TreeNode
    {
        public string Name { get; set; } = "";
        public string Status { get; set; } = "";
        public List<TreeNode> Children { get; set; } = new();
    }

    public static readonly StyledProperty<List<TreeNode>> NodesProperty =
        AvaloniaProperty.Register<PluginTreeExplorer, List<TreeNode>>(
            nameof(Nodes),
            new List<TreeNode>());

    public List<TreeNode> Nodes
    {
        get => GetValue(NodesProperty);
        set => SetValue(NodesProperty, value);
    }

    public PluginTreeExplorer()
    {
        InitializeComponent();
        UpdateTree();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == NodesProperty)
        {
            UpdateTree();
        }
    }

    private void UpdateTree()
    {
        var treeView = this.FindControl<TreeView>("PluginTree");
        if (treeView != null)
        {
            treeView.ItemsSource = Nodes;
        }
    }
}

