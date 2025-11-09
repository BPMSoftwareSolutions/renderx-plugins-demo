using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using System;
using System.Collections.Generic;
using System.Linq;

namespace RenderX.Plugins.ControlPanel;

/// <summary>
/// Class manager - manages CSS classes for selected component
/// </summary>
public partial class ClassManager : UserControl
{
    public static readonly RoutedEvent<RoutedEventArgs> ClassesAppliedEvent =
        RoutedEvent.Register<ClassManager, RoutedEventArgs>(
            nameof(ClassesApplied),
            RoutingStrategies.Bubble);

    public event EventHandler<RoutedEventArgs>? ClassesApplied
    {
        add => AddHandler(ClassesAppliedEvent, value);
        remove => RemoveHandler(ClassesAppliedEvent, value);
    }

    public static readonly StyledProperty<List<string>> ClassesProperty =
        AvaloniaProperty.Register<ClassManager, List<string>>(
            nameof(Classes),
            new List<string>());

    public List<string> Classes
    {
        get => GetValue(ClassesProperty);
        set => SetValue(ClassesProperty, value);
    }

    public ClassManager()
    {
        InitializeComponent();
        UpdateClasses();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == ClassesProperty)
        {
            UpdateClasses();
        }
    }

    private void OnApplyClick(object? sender, RoutedEventArgs e)
    {
        var input = this.FindControl<TextBox>("CssClassesInput");
        if (input != null && !string.IsNullOrWhiteSpace(input.Text))
        {
            var newClasses = input.Text.Split(' ', StringSplitOptions.RemoveEmptyEntries).ToList();
            Classes = newClasses;
            input.Text = "";
            RaiseEvent(new RoutedEventArgs(ClassesAppliedEvent));
        }
    }

    private void OnRemoveClassClick(object? sender, RoutedEventArgs e)
    {
        if (sender is Button button && button.DataContext is string className)
        {
            Classes.Remove(className);
            UpdateClasses();
        }
    }

    private void UpdateClasses()
    {
        var tagsControl = this.FindControl<ItemsControl>("ClassTagsControl");
        if (tagsControl != null)
        {
            tagsControl.ItemsSource = Classes;
        }
    }
}

