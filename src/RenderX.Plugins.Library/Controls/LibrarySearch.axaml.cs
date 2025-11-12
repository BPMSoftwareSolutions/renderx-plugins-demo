using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Plugins.Library.Controls
{
    /// <summary>
    /// Library search
    /// </summary>
    public partial class LibrarySearch : UserControl
    {
        public LibrarySearch()
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
