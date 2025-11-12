using Avalonia;
using Avalonia.Controls;
using System.Collections.Generic;

namespace RenderX.Plugins.ManifestTools;

/// <summary>
/// Manifest editor - allows editing manifest files
/// </summary>
public partial class ManifestEditor : UserControl
{
    public class Section
    {
        public string Name { get; set; } = "";
    }

    public static readonly StyledProperty<string> ManifestNameProperty =
        AvaloniaProperty.Register<ManifestEditor, string>(
            nameof(ManifestName),
            "");

    public static readonly StyledProperty<string> ManifestVersionProperty =
        AvaloniaProperty.Register<ManifestEditor, string>(
            nameof(ManifestVersion),
            "1.0.0");

    public static readonly StyledProperty<List<Section>> SectionsProperty =
        AvaloniaProperty.Register<ManifestEditor, List<Section>>(
            nameof(Sections),
            new List<Section>());

    public string ManifestName
    {
        get => GetValue(ManifestNameProperty);
        set => SetValue(ManifestNameProperty, value);
    }

    public string ManifestVersion
    {
        get => GetValue(ManifestVersionProperty);
        set => SetValue(ManifestVersionProperty, value);
    }

    public List<Section> Sections
    {
        get => GetValue(SectionsProperty);
        set => SetValue(SectionsProperty, value);
    }

    public ManifestEditor()
    {
        InitializeComponent();
        UpdateEditor();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == ManifestNameProperty || change.Property == ManifestVersionProperty || 
            change.Property == SectionsProperty)
        {
            UpdateEditor();
        }
    }

    private void UpdateEditor()
    {
        var nameBox = this.FindControl<TextBox>("NameBox");
        if (nameBox != null)
        {
            nameBox.Text = ManifestName;
        }

        var versionBox = this.FindControl<TextBox>("VersionBox");
        if (versionBox != null)
        {
            versionBox.Text = ManifestVersion;
        }

        var sectionsControl = this.FindControl<ItemsControl>("SectionsControl");
        if (sectionsControl != null)
        {
            sectionsControl.ItemsSource = Sections;
        }
    }
}

