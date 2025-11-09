using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Shell.Avalonia.UI.Controls
{
    /// <summary>
    /// Progress indicator
    /// </summary>
    public partial class RxProgress : UserControl
    {
        public RxProgress()
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
