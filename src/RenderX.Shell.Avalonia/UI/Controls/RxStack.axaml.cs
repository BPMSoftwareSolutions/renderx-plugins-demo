using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Shell.Avalonia.UI.Controls
{
    /// <summary>
    /// Stack layout
    /// </summary>
    public partial class RxStack : UserControl
    {
        public RxStack()
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
