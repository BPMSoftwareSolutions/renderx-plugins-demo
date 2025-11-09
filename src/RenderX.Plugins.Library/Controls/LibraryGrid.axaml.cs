using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Plugins.Library.Controls
{
    /// <summary>
    /// Library grid view
    /// </summary>
    public partial class LibraryGrid : UserControl
    {
        public LibraryGrid()
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
