using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Shell.Avalonia.UI.Controls
{
    /// <summary>
    /// Slider control
    /// </summary>
    public partial class RxSlider : UserControl
    {
        public RxSlider()
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
