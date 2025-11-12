using Avalonia;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Media;
using RenderX.HostSDK.Avalonia.Services;
using System;

namespace RenderX.Plugins.Library;

/// <summary>
/// Helper class for managing drag ghost image operations.
/// Provides utilities for creating, styling, and managing drag adorners using Popup-based approach.
/// </summary>
public static class DragGhostHelper
{
    /// <summary>
    /// Creates a drag adorner for the specified component.
    /// </summary>
    /// <param name="component">The component to create a ghost for.</param>
    /// <param name="width">The width of the ghost preview.</param>
    /// <param name="height">The height of the ghost preview.</param>
    /// <returns>A configured DragAdorner instance.</returns>
    public static DragAdorner CreateGhost(Control component, double width, double height)
    {
        try
        {
            ConductorLogService.Instance.LogDebug($"Creating drag ghost ({width:F0}x{height:F0})", "DragGhostHelper");

            // Create a copy of the component for preview
            var ghostContent = CreatePreviewControl(component, width, height);

            // Create the adorner (Popup-based)
            var adorner = new DragAdorner(component, width, height)
            {
                Content = ghostContent
            };

            ConductorLogService.Instance.LogDebug("Drag ghost created successfully", "DragGhostHelper");
            return adorner;
        }
        catch (Exception ex)
        {
            ConductorLogService.Instance.LogError($"Error creating drag ghost: {ex.Message}", "DragGhostHelper");
            throw;
        }
    }

    /// <summary>
    /// Creates a preview control from the source component.
    /// </summary>
    private static Control CreatePreviewControl(Control sourceComponent, double width, double height)
    {
        // Extract properties from source if it's a Border
        var sourceBorder = sourceComponent as Border;
        var background = sourceBorder?.Background ?? new SolidColorBrush(Colors.White);
        var borderBrush = sourceBorder?.BorderBrush ?? new SolidColorBrush(Colors.Gray);
        var borderThickness = sourceBorder?.BorderThickness ?? new Thickness(0);
        var cornerRadius = sourceBorder?.CornerRadius ?? new CornerRadius(0);
        var padding = sourceBorder?.Padding ?? new Thickness(0);

        // Create a border to contain the preview
        var preview = new Border
        {
            Width = width,
            Height = height,
            Background = background,
            BorderBrush = borderBrush,
            BorderThickness = borderThickness,
            CornerRadius = cornerRadius,
            Padding = padding,
            Child = new TextBlock
            {
                Text = GetComponentLabel(sourceComponent),
                FontSize = 12,
                FontWeight = FontWeight.Bold,
                VerticalAlignment = Avalonia.Layout.VerticalAlignment.Center,
                HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Center,
                Foreground = new SolidColorBrush(Colors.Black)
            }
        };

        return preview;
    }

    /// <summary>
    /// Gets a label for the component to display in the ghost.
    /// </summary>
    private static string GetComponentLabel(Control component)
    {
        // Try to get a meaningful label from the component
        if (component is Border border && border.Child is TextBlock textBlock)
        {
            return textBlock.Text ?? "Component";
        }

        if (component is TextBlock tb)
        {
            return tb.Text ?? "Component";
        }

        return component.Name ?? "Component";
    }

    /// <summary>
    /// Applies component styling to the drag adorner.
    /// </summary>
    /// <param name="adorner">The adorner to style.</param>
    /// <param name="component">The source component to copy styling from.</param>
    public static void ApplyComponentStyles(DragAdorner adorner, Control component)
    {
        // The adorner already has the content with styling applied
        // This method is here for future enhancements
    }

    /// <summary>
    /// Computes the cursor offset relative to the component.
    /// </summary>
    /// <param name="e">The pointer event args.</param>
    /// <param name="targetElement">The element being dragged.</param>
    /// <param name="ghostWidth">The width of the ghost preview.</param>
    /// <param name="ghostHeight">The height of the ghost preview.</param>
    /// <returns>A tuple of (offsetX, offsetY) for cursor positioning.</returns>
    public static (double offsetX, double offsetY) ComputeCursorOffsets(
        PointerEventArgs e,
        Control targetElement,
        double ghostWidth,
        double ghostHeight)
    {
        try
        {
            // Get the position of the pointer relative to the target element
            var pointerPosition = e.GetPosition(targetElement);

            // Calculate offsets to center the ghost on the cursor
            var offsetX = pointerPosition.X - (ghostWidth / 2);
            var offsetY = pointerPosition.Y - (ghostHeight / 2);

            return (offsetX, offsetY);
        }
        catch
        {
            // Default to centering if calculation fails
            return (-ghostWidth / 2, -ghostHeight / 2);
        }
    }

    /// <summary>
    /// Shows the drag ghost at the specified position.
    /// </summary>
    /// <param name="adorner">The adorner to show.</param>
    /// <param name="screenX">Screen X coordinate.</param>
    /// <param name="screenY">Screen Y coordinate.</param>
    public static void ShowGhost(DragAdorner adorner, double screenX, double screenY)
    {
        try
        {
            ConductorLogService.Instance.LogDebug($"Showing drag ghost at ({screenX:F0}, {screenY:F0})", "DragGhostHelper");
            adorner.Show(screenX, screenY);
            ConductorLogService.Instance.LogDebug("Drag ghost displayed successfully", "DragGhostHelper");
        }
        catch (Exception ex)
        {
            ConductorLogService.Instance.LogError($"Error showing drag ghost: {ex.Message}", "DragGhostHelper");
            System.Diagnostics.Debug.WriteLine($"Error showing drag ghost: {ex.Message}");
        }
    }

    /// <summary>
    /// Updates the ghost position during drag.
    /// </summary>
    /// <param name="adorner">The adorner to update.</param>
    /// <param name="screenX">Screen X coordinate.</param>
    /// <param name="screenY">Screen Y coordinate.</param>
    public static void UpdateGhostPosition(DragAdorner adorner, double screenX, double screenY)
    {
        try
        {
            adorner.UpdatePosition(screenX, screenY);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error updating ghost position: {ex.Message}");
        }
    }

    /// <summary>
    /// Cleans up the drag ghost adorner.
    /// </summary>
    /// <param name="adorner">The adorner to clean up.</param>
    public static void CleanupGhost(DragAdorner? adorner)
    {
        if (adorner == null)
        {
            return;
        }

        try
        {
            adorner.Hide();
            adorner.Dispose();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error cleaning up drag ghost: {ex.Message}");
        }
    }
}

