using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Plugins.Library.Controls
{
    /// <summary>
    /// Template gallery
    /// </summary>
    public partial class TemplateGallery : UserControl
    {
        public TemplateGallery()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }

        // TODO: Add properties, commands, and logic here
    }
}
