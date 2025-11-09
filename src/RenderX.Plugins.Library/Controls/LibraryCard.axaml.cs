using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Plugins.Library.Controls
{
    /// <summary>
    /// Library card
    /// </summary>
    public partial class LibraryCard : UserControl
    {
        public LibraryCard()
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
