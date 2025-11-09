#!/usr/bin/env python3
"""
Component Generator for Avalonia AXAML Components
Generates skeletal AXAML and C# files for missing components.
"""

import os
from pathlib import Path
from typing import List, Dict

# Component definitions organized by package
COMPONENT_DEFINITIONS = {
    "UI.Controls": [
        # Form controls
        {"name": "RxButton", "base": "Button", "description": "Styled button control"},
        {"name": "RxTextBox", "base": "TextBox", "description": "Styled text input"},
        {"name": "RxComboBox", "base": "ComboBox", "description": "Styled dropdown select"},
        {"name": "RxCheckBox", "base": "CheckBox", "description": "Styled checkbox"},
        {"name": "RxRadioButton", "base": "RadioButton", "description": "Styled radio button"},
        {"name": "RxToggleSwitch", "base": "ToggleSwitch", "description": "Toggle switch control"},
        {"name": "RxSlider", "base": "Slider", "description": "Slider control"},
        {"name": "RxNumericUpDown", "base": "NumericUpDown", "description": "Numeric input with up/down"},
        {"name": "RxTextArea", "base": "TextBox", "description": "Multi-line text input", "props": {"AcceptsReturn": "True", "TextWrapping": "Wrap"}},
        {"name": "RxPasswordBox", "base": "TextBox", "description": "Password input", "props": {"PasswordChar": "●"}},
        
        # Display controls
        {"name": "RxLabel", "base": "TextBlock", "description": "Text label"},
        {"name": "RxHeading", "base": "TextBlock", "description": "Heading text"},
        {"name": "RxCaption", "base": "TextBlock", "description": "Caption text"},
        {"name": "RxBadge", "base": "Border", "description": "Badge indicator"},
        {"name": "RxAvatar", "base": "Border", "description": "User avatar display"},
        {"name": "RxIcon", "base": "PathIcon", "description": "Icon display"},
        {"name": "RxImage", "base": "Image", "description": "Image display"},
        {"name": "RxDivider", "base": "Separator", "description": "Visual divider"},
        {"name": "RxSpacer", "base": "Border", "description": "Spacing element"},
        {"name": "RxCode", "base": "Border", "description": "Code display block"},
        
        # Container controls
        {"name": "RxCard", "base": "Border", "description": "Card container"},
        {"name": "RxPanel", "base": "Border", "description": "Panel container"},
        {"name": "RxStack", "base": "StackPanel", "description": "Stack layout"},
        {"name": "RxGrid", "base": "Grid", "description": "Grid layout"},
        {"name": "RxContainer", "base": "Border", "description": "Generic container"},
        
        # Feedback controls
        {"name": "RxAlert", "base": "Border", "description": "Alert message"},
        {"name": "RxToast", "base": "Border", "description": "Toast notification"},
        {"name": "RxProgress", "base": "ProgressBar", "description": "Progress indicator"},
        {"name": "RxSpinner", "base": "Border", "description": "Loading spinner"},
        {"name": "RxTooltip", "base": "ToolTip", "description": "Tooltip"},
        
        # Overlay controls
        {"name": "RxModal", "base": "Window", "description": "Modal dialog"},
        {"name": "RxDialog", "base": "Window", "description": "Dialog window"},
        {"name": "RxPopover", "base": "Flyout", "description": "Popover overlay"},
        {"name": "RxDrawer", "base": "Border", "description": "Slide-out drawer"},
    ],
    
    "ControlPanel.Controls": [
        {"name": "PropertyGrid", "base": "ItemsControl", "description": "Property grid editor"},
        {"name": "ColorPicker", "base": "UserControl", "description": "Color picker"},
        {"name": "FontPicker", "base": "UserControl", "description": "Font picker"},
        {"name": "SizePicker", "base": "UserControl", "description": "Size picker"},
        {"name": "OpacitySlider", "base": "Slider", "description": "Opacity slider"},
        {"name": "RotationControl", "base": "UserControl", "description": "Rotation control"},
        {"name": "PositionControl", "base": "UserControl", "description": "Position control"},
        {"name": "AlignmentControl", "base": "UserControl", "description": "Alignment control"},
        {"name": "FilterPanel", "base": "UserControl", "description": "Filter panel"},
        {"name": "EffectPanel", "base": "UserControl", "description": "Effect panel"},
        {"name": "TransformPanel", "base": "UserControl", "description": "Transform panel"},
        {"name": "AnimationPanel", "base": "UserControl", "description": "Animation panel"},
        {"name": "TimelinePanel", "base": "UserControl", "description": "Timeline panel"},
        {"name": "KeyframeEditor", "base": "UserControl", "description": "Keyframe editor"},
    ],
    
    "Diagnostics.Controls": [
        {"name": "LogViewer", "base": "UserControl", "description": "Log viewer"},
        {"name": "LogEntry", "base": "Border", "description": "Log entry display"},
        {"name": "PerformanceMonitor", "base": "UserControl", "description": "Performance monitor"},
        {"name": "PerformanceGraph", "base": "UserControl", "description": "Performance graph"},
        {"name": "MemoryMonitor", "base": "UserControl", "description": "Memory monitor"},
        {"name": "MemoryGraph", "base": "UserControl", "description": "Memory graph"},
        {"name": "NetworkMonitor", "base": "UserControl", "description": "Network monitor"},
        {"name": "DebugConsole", "base": "UserControl", "description": "Debug console"},
        {"name": "ErrorDisplay", "base": "Border", "description": "Error display"},
        {"name": "TraceViewer", "base": "UserControl", "description": "Trace viewer"},
        {"name": "StateTree", "base": "TreeView", "description": "State tree view"},
        {"name": "MetricsPanel", "base": "UserControl", "description": "Metrics panel"},
    ],
    
    "DigitalAssets.Controls": [
        {"name": "AssetGrid", "base": "ItemsControl", "description": "Asset grid view"},
        {"name": "AssetList", "base": "ListBox", "description": "Asset list view"},
        {"name": "AssetCard", "base": "Border", "description": "Asset card"},
        {"name": "AssetThumbnail", "base": "Image", "description": "Asset thumbnail"},
        {"name": "AssetMetadata", "base": "UserControl", "description": "Asset metadata editor"},
        {"name": "AssetUploadQueue", "base": "ItemsControl", "description": "Upload queue"},
        {"name": "MediaPlayer", "base": "UserControl", "description": "Media player"},
        {"name": "MediaControls", "base": "UserControl", "description": "Media controls"},
        {"name": "ImageEditor", "base": "UserControl", "description": "Image editor"},
    ],
    
    "Library.Controls": [
        {"name": "LibraryGrid", "base": "ItemsControl", "description": "Library grid view"},
        {"name": "LibraryList", "base": "ListBox", "description": "Library list view"},
        {"name": "LibraryCard", "base": "Border", "description": "Library card"},
        {"name": "LibrarySearch", "base": "UserControl", "description": "Library search"},
        {"name": "LibraryFilter", "base": "UserControl", "description": "Library filter"},
        {"name": "TemplateGallery", "base": "ItemsControl", "description": "Template gallery"},
        {"name": "ComponentLibrary", "base": "UserControl", "description": "Component library"},
    ],
}


def generate_axaml_file(component: Dict, namespace: str, folder_path: Path) -> str:
    """Generate AXAML file content."""
    name = component["name"]
    base = component.get("base", "UserControl")
    description = component.get("description", "")
    props = component.get("props", {})
    
    # Build property attributes
    prop_attrs = ""
    for prop, value in props.items():
        prop_attrs += f'\n             {prop}="{value}"'
    
    content = f'''<UserControl xmlns="https://github.com/avaloniaui"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
             xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
             mc:Ignorable="d" d:DesignWidth="400" d:DesignHeight="300"
             x:Class="{namespace}.{name}"{prop_attrs}>
    
    <!-- {description} -->
    
    <Border Classes="rx-control {name.lower()}"
            Background="{{StaticResource rx-bg-primary}}"
            BorderBrush="{{StaticResource rx-border-primary}}"
            BorderThickness="1"
            CornerRadius="4"
            Padding="8">
        
        <StackPanel Spacing="8">
            <!-- Header -->
            <TextBlock Text="{name}"
                       Classes="rx-text-base rx-font-semibold"
                       Foreground="{{StaticResource rx-text-primary}}" />
            
            <!-- Content -->
            <ContentPresenter Content="{{Binding}}" />
            
            <!-- Placeholder for implementation -->
            <TextBlock Text="TODO: Implement {name}"
                       Classes="rx-text-sm"
                       Foreground="{{StaticResource rx-text-muted}}"
                       TextWrapping="Wrap" />
        </StackPanel>
    </Border>
</UserControl>
'''
    return content


def generate_cs_file(component: Dict, namespace: str) -> str:
    """Generate C# code-behind file content."""
    name = component["name"]
    description = component.get("description", "")
    
    content = f'''using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;

namespace {namespace}
{{
    /// <summary>
    /// {description}
    /// </summary>
    public partial class {name} : UserControl
    {{
        public {name}()
        {{
            InitializeComponent();
        }}

        private void InitializeComponent()
        {{
            AvaloniaXamlLoader.Load(this);
        }}

        // TODO: Add properties, commands, and logic here
    }}
}}
'''
    return content


def generate_components(base_path: str):
    """Generate all component files."""
    base = Path(base_path)
    
    stats = {
        "created": 0,
        "skipped": 0,
        "errors": 0
    }
    
    for package_name, components in COMPONENT_DEFINITIONS.items():
        # Determine folder structure
        parts = package_name.split(".")
        if parts[0] == "UI":
            folder_path = base / "src" / "RenderX.Shell.Avalonia" / "UI" / "Controls"
            namespace = "RenderX.Shell.Avalonia.UI.Controls"
        else:
            # For plugin packages
            package_folder = parts[0]
            folder_path = base / "src" / f"RenderX.Plugins.{package_folder}" / "Controls"
            namespace = f"RenderX.Plugins.{package_folder}.Controls"
        
        # Create folder if it doesn't exist
        folder_path.mkdir(parents=True, exist_ok=True)
        
        print(f"\n📦 Generating {package_name} components in {folder_path}")
        
        for component in components:
            name = component["name"]
            axaml_path = folder_path / f"{name}.axaml"
            cs_path = folder_path / f"{name}.axaml.cs"
            
            # Check if files already exist
            if axaml_path.exists() and cs_path.exists():
                print(f"  ⏭️  Skipped {name} (already exists)")
                stats["skipped"] += 1
                continue
            
            try:
                # Generate AXAML file
                if not axaml_path.exists():
                    axaml_content = generate_axaml_file(component, namespace, folder_path)
                    axaml_path.write_text(axaml_content, encoding='utf-8')
                
                # Generate C# file
                if not cs_path.exists():
                    cs_content = generate_cs_file(component, namespace)
                    cs_path.write_text(cs_content, encoding='utf-8')
                
                print(f"  ✅ Created {name}")
                stats["created"] += 1
                
            except Exception as e:
                print(f"  ❌ Error creating {name}: {e}")
                stats["errors"] += 1
    
    # Print summary
    print(f"\n" + "="*80)
    print(f"Component Generation Summary")
    print(f"="*80)
    print(f"✅ Created:  {stats['created']}")
    print(f"⏭️  Skipped:  {stats['skipped']}")
    print(f"❌ Errors:   {stats['errors']}")
    print(f"="*80)
    
    # Calculate remaining components
    total_defined = sum(len(comps) for comps in COMPONENT_DEFINITIONS.values())
    print(f"\n📊 This batch generates {total_defined} components")
    print(f"📊 Remaining gap after this: ~150 components")
    print(f"\nNext steps:")
    print(f"  1. Add these files to .csproj")
    print(f"  2. Run: dotnet build")
    print(f"  3. Fix any compilation errors")
    print(f"  4. Generate next batch of components")


if __name__ == "__main__":
    import sys
    
    # Get base path from command line or use current directory
    base_path = sys.argv[1] if len(sys.argv) > 1 else "."
    
    print(f"🚀 Avalonia Component Generator")
    print(f"📁 Base Path: {Path(base_path).absolute()}")
    print(f"="*80)
    
    generate_components(base_path)
