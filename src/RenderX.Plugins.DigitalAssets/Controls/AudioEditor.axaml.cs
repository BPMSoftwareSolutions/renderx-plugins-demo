using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.DigitalAssets.Controls
{
    /// <summary>
    /// Audio editor
    /// </summary>
    public partial class AudioEditor : UserControl
    {
        public AudioEditor()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
