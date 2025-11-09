using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace RenderX.Plugins.Library.Controls
{
    /// <summary>
    /// Template card
    /// </summary>
    public partial class TemplateCard : UserControl
    {
        public TemplateCard()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            AvaloniaXamlLoader.Load(this);
        }
    }
}
