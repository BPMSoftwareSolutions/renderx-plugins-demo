using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Plugins.Library.Controls
{
    /// <summary>
    /// Library filter
    /// </summary>
    public partial class LibraryFilter : UserControl
    {
        public LibraryFilter()
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
