using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.DigitalAssets.Controls
{
    /// <summary>
    /// Audio waveform
    /// </summary>
    public partial class AudioWaveform : UserControl
    {
        public AudioWaveform()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
