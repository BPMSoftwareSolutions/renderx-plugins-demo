using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace RenderX.Shell.Avalonia.UI.Controls
{
    /// <summary>
    /// Password input
    /// </summary>
    public partial class RxPasswordBox : UserControl
    {
        public RxPasswordBox()
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
