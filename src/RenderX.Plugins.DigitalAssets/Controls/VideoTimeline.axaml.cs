using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.DigitalAssets.Controls
{
    /// <summary>
    /// Video timeline
    /// </summary>
    public partial class VideoTimeline : UserControl
    {
        public VideoTimeline()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
