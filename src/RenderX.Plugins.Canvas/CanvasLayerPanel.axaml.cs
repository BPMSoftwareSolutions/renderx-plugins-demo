using Avalonia;
using Avalonia.Controls;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace RenderX.Plugins.Canvas
{
    public partial class CanvasLayerPanel : UserControl
    {
        // Layer data model
        public class Layer : INotifyPropertyChanged
        {
            private string _name = "Layer";
            private bool _isVisible = true;
            private bool _isLocked = false;
            private double _opacity = 100;
            private bool _isSelected = false;

            public string Name
            {
                get => _name;
                set { _name = value; OnPropertyChanged(); }
            }

            public bool IsVisible
            {
                get => _isVisible;
                set { _isVisible = value; OnPropertyChanged(); }
            }

            public bool IsLocked
            {
                get => _isLocked;
                set { _isLocked = value; OnPropertyChanged(); }
            }

            public double Opacity
            {
                get => _opacity;
                set { _opacity = value; OnPropertyChanged(); }
            }

            public bool IsSelected
            {
                get => _isSelected;
                set { _isSelected = value; OnPropertyChanged(); }
            }

            public event PropertyChangedEventHandler? PropertyChanged;

            protected virtual void OnPropertyChanged([CallerMemberName] string? propertyName = null)
            {
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
            }
        }

        // Properties
        public ObservableCollection<Layer> Layers { get; } = new ObservableCollection<Layer>();

        public CanvasLayerPanel()
        {
            InitializeComponent();
            DataContext = this;

            // Initialize with default layers
            InitializeDefaultLayers();

            // Wire up button events
            if (AddLayerButton != null)
                AddLayerButton.Click += (s, e) => AddLayer();

            if (DeleteLayerButton != null)
                DeleteLayerButton.Click += (s, e) => DeleteSelectedLayer();

            if (DuplicateButton != null)
                DuplicateButton.Click += (s, e) => DuplicateSelectedLayer();

            if (MergeDownButton != null)
                MergeDownButton.Click += (s, e) => MergeSelectedLayerDown();

            if (MoveUpButton != null)
                MoveUpButton.Click += (s, e) => MoveSelectedLayerUp();

            if (MoveDownButton != null)
                MoveDownButton.Click += (s, e) => MoveSelectedLayerDown();

            // Set ItemsSource for layer list
            if (LayerList != null)
                LayerList.ItemsSource = Layers;
        }

        private void InitializeDefaultLayers()
        {
            Layers.Add(new Layer { Name = "Background", IsSelected = false, Opacity = 100 });
            Layers.Add(new Layer { Name = "Layer 1", IsSelected = true, Opacity = 100 });
            Layers.Add(new Layer { Name = "Layer 2", IsSelected = false, Opacity = 100 });
        }

        private void AddLayer()
        {
            var newLayer = new Layer
            {
                Name = $"Layer {Layers.Count + 1}",
                IsVisible = true,
                IsLocked = false,
                Opacity = 100,
                IsSelected = false
            };

            Layers.Add(newLayer);
        }

        private void DeleteSelectedLayer()
        {
            var selectedLayer = GetSelectedLayer();
            if (selectedLayer != null && Layers.Count > 1)
            {
                Layers.Remove(selectedLayer);
            }
        }

        private void DuplicateSelectedLayer()
        {
            var selectedLayer = GetSelectedLayer();
            if (selectedLayer != null)
            {
                var duplicateLayer = new Layer
                {
                    Name = $"{selectedLayer.Name} Copy",
                    IsVisible = selectedLayer.IsVisible,
                    IsLocked = selectedLayer.IsLocked,
                    Opacity = selectedLayer.Opacity,
                    IsSelected = false
                };

                var index = Layers.IndexOf(selectedLayer);
                Layers.Insert(index + 1, duplicateLayer);
            }
        }

        private void MergeSelectedLayerDown()
        {
            var selectedLayer = GetSelectedLayer();
            if (selectedLayer != null)
            {
                var index = Layers.IndexOf(selectedLayer);
                if (index > 0)
                {
                    // In a real implementation, this would merge the layer graphics
                    var belowLayer = Layers[index - 1];
                    belowLayer.Name = $"{belowLayer.Name} + {selectedLayer.Name}";
                    Layers.RemoveAt(index);
                }
            }
        }

        private void MoveSelectedLayerUp()
        {
            var selectedLayer = GetSelectedLayer();
            if (selectedLayer != null)
            {
                var index = Layers.IndexOf(selectedLayer);
                if (index < Layers.Count - 1)
                {
                    Layers.Move(index, index + 1);
                }
            }
        }

        private void MoveSelectedLayerDown()
        {
            var selectedLayer = GetSelectedLayer();
            if (selectedLayer != null)
            {
                var index = Layers.IndexOf(selectedLayer);
                if (index > 0)
                {
                    Layers.Move(index, index - 1);
                }
            }
        }

        private Layer? GetSelectedLayer()
        {
            foreach (var layer in Layers)
            {
                if (layer.IsSelected)
                    return layer;
            }
            return null;
        }
    }
}
