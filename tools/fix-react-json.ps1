$reactCode = @'
export default function ThemeToggle(props) {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const handleThemeToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (window.RenderX && window.RenderX.publish) {
      window.RenderX.publish('react.component.theme.toggled', {
        isDarkMode: newMode,
        theme: newMode ? 'dark' : 'light',
      });
    }
  };

  const bgColor = isDarkMode ? '#1e1e1e' : '#ffffff';
  const textColor = isDarkMode ? '#ffffff' : '#000000';

  return (
    <div style={{
      padding: '20px',
      borderRadius: '8px',
      backgroundColor: bgColor,
      color: textColor,
      fontFamily: 'Arial, sans-serif',
      maxWidth: '400px',
    }}>
      <h2>Theme Toggle</h2>
      <p>
        Current Theme:{' '}
        <strong>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</strong>
      </p>
      <button onClick={handleThemeToggle}>
        {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>
    </div>
  );
}
'@

$react = [ordered]@{
  metadata = [ordered]@{
    type        = 'react'
    name        = 'React Component'
    version     = '1.0.0'
    author      = 'RenderX Team'
    description = 'Mount and run custom React code on the canvas with state management and inter-component communication'
    category    = 'advanced'
    tags        = @('react', 'dynamic', 'interactive', 'code', 'jsx')
  }
  ui = [ordered]@{
    template = '<div class="rx-react-container"></div>'
    styles   = [ordered]@{
      css      = '.rx-react-container { position: relative; background: #fafafa; border: 1px dashed #9ca3af; border-radius: 8px; padding: 8px; min-height: 100px; }'
      variables = @{}
      library  = [ordered]@{
        css       = '.rx-lib .rx-react-container { background: #f5f7fb; border-color: #cbd5e1; width: 300px; height: 200px; }'
        variables = @{}
      }
    }
    icon  = [ordered]@{
      mode      = 'emoji'
      value     = '⚛️'
      position  = 'start'
    }
    tools = [ordered]@{
      drag   = @{ enabled = $true }
      resize = [ordered]@{
        enabled     = $true
        handles     = @('e', 's', 'se')
        constraints = @{ min = @{ w = 150; h = 100 } }
      }
    }
  }
  integration = [ordered]@{
    render     = @{ strategy = 'react' }
    properties = [ordered]@{
      schema = [ordered]@{
        reactCode = [ordered]@{
          type        = 'string'
          default     = $reactCode
          description = 'React component code (JSX)'
          required    = $true
          ui          = [ordered]@{
            control     = 'code'
            language    = 'javascript'
            rows        = 12
            placeholder = "export default function MyComponent() {`n  return <div>Your JSX here</div>;`n}"
          }
        }
        props = [ordered]@{
          type        = 'object'
          default     = @{}
          description = 'Initial props to pass to the component'
          ui          = @{ control = 'json' }
        }
      }
      defaultValues = [ordered]@{
        reactCode = $reactCode
        props     = @{}
      }
    }
    canvasIntegration = [ordered]@{
      resizable          = $true
      draggable          = $true
      selectable         = $true
      defaultWidth       = 400
      defaultHeight      = 300
      minWidth           = 150
      minHeight          = 100
      allowChildElements = $false
    }
    events = [ordered]@{
      componentMounted = [ordered]@{
        description = 'Fired when React component mounts'
        parameters  = @('componentId', 'timestamp')
      }
      componentError = [ordered]@{
        description = 'Fired when React component encounters an error'
        parameters  = @('componentId', 'error', 'errorInfo')
      }
      stateChanged = [ordered]@{
        description = 'Fired when component state changes'
        parameters  = @('componentId', 'newState')
      }
    }
  }
  interactions = [ordered]@{
    'canvas.component.create' = [ordered]@{
      pluginId   = 'CanvasComponentPlugin'
      sequenceId = 'canvas-component-create-symphony'
    }
    'canvas.component.select' = [ordered]@{
      pluginId   = 'CanvasComponentSelectionPlugin'
      sequenceId = 'canvas-component-select-symphony'
    }
    'canvas.component.drag.move' = [ordered]@{
      pluginId   = 'CanvasComponentDragPlugin'
      sequenceId = 'canvas-component-drag-symphony'
    }
    'canvas.component.resize.start' = [ordered]@{
      pluginId   = 'CanvasComponentResizeStartPlugin'
      sequenceId = 'canvas-component-resize-start-symphony'
    }
    'canvas.component.resize.move' = [ordered]@{
      pluginId   = 'CanvasComponentResizeMovePlugin'
      sequenceId = 'canvas-component-resize-move-symphony'
    }
    'canvas.component.resize.end' = [ordered]@{
      pluginId   = 'CanvasComponentResizeEndPlugin'
      sequenceId = 'canvas-component-resize-end-symphony'
    }
  }
}

$react | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath 'packages/components/json-components/react.json' -Encoding utf8

