using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Shell.Avalonia.UI.Controls
{
    /// <summary>
    /// Tooltip
    /// </summary>
    public partial class RxTooltip : UserControl
    {
        public RxTooltip()
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
