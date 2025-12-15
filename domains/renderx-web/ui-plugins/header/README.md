# RenderX Plugin Header

[![npm version](https://badge.fury.io/js/renderx-plugin-header.svg)](https://badge.fury.io/js/renderx-plugin-header)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A customizable header UI plugin for RenderX, providing flexible header components, theme toggling, and seamless integration with the RenderX host application. Designed for easy installation as an npm package and dynamic loading via the RenderX plugin manifest system.

## Features

- 🎨 **Customizable Header Components** - Flexible and themeable header UI elements
- 🌓 **Theme Toggle Support** - Built-in dark/light theme switching
- 🔌 **Plugin Architecture** - Seamless integration with RenderX host applications
- 📦 **NPM Package** - Easy installation and dependency management
- 🔄 **Dynamic Loading** - Runtime plugin loading via manifest configuration
- 📱 **Responsive Design** - Mobile-friendly header components
- 🎯 **TypeScript Support** - Full TypeScript definitions and ESM compatibility
- 🔄 **Sequence-Driven Interactions** - Support for complex UI workflows

## Installation

Install the plugin via npm:

```bash
npm install renderx-plugin-header
```

Or with yarn:

```bash
yarn add renderx-plugin-header
```

## Usage

### Basic Usage

```javascript
import { HeaderTitle, HeaderControls, HeaderThemeToggle } from 'renderx-plugin-header';

// Basic header setup
function App() {
  return (
    <div className="app">
      <header className="app-header">
        <HeaderTitle title="My Application" />
        <HeaderControls>
          <HeaderThemeToggle />
        </HeaderControls>
      </header>
      {/* Your app content */}
    </div>
  );
}
```

### Advanced Configuration

```javascript
import { 
  HeaderTitle, 
  HeaderControls, 
  HeaderThemeToggle,
  HeaderNavigation 
} from 'renderx-plugin-header';

function AppHeader() {
  const handleThemeChange = (theme) => {
    console.log('Theme changed to:', theme);
  };

  return (
    <header className="custom-header">
      <HeaderTitle 
        title="RenderX Application"
        subtitle="Plugin Demo"
        logoUrl="/assets/logo.png"
      />
      
      <HeaderNavigation
        items={[
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' }
        ]}
      />
      
      <HeaderControls>
        <HeaderThemeToggle 
          onThemeChange={handleThemeChange}
          defaultTheme="light"
        />
      </HeaderControls>
    </header>
  );
}
```

## RenderX Host Integration

### Plugin Manifest Configuration

Add the header plugin to your RenderX application's plugin manifest:

```json
{
  "plugins": [
    {
      "name": "renderx-plugin-header",
      "version": "^1.0.0",
      "type": "ui-component",
      "entryPoint": "dist/index.js",
      "manifest": {
        "components": [
          "HeaderTitle",
          "HeaderControls", 
          "HeaderThemeToggle",
          "HeaderNavigation"
        ],
        "styles": "dist/styles.css",
        "dependencies": []
      },
      "loadStrategy": "eager",
      "scope": "global"
    }
  ]
}
```

### Dynamic Plugin Loading

```javascript
// In your RenderX host application
import { loadPlugin } from 'renderx-core';

async function initializeHeaderPlugin() {
  try {
    const headerPlugin = await loadPlugin('renderx-plugin-header');
    
    // Register plugin components with RenderX
    headerPlugin.register({
      container: document.getElementById('header-container'),
      config: {
        theme: 'auto',
        showNavigation: true,
        enableThemeToggle: true
      }
    });
    
    console.log('Header plugin loaded successfully');
  } catch (error) {
    console.error('Failed to load header plugin:', error);
  }
}
```

### Integration with RenderX Context

```javascript
import { useRenderXContext } from 'renderx-core';
import { HeaderTitle, HeaderThemeToggle } from 'renderx-plugin-header';

function IntegratedHeader() {
  const { theme, updateTheme, appConfig } = useRenderXContext();
  
  return (
    <header>
      <HeaderTitle title={appConfig.title} />
      <HeaderThemeToggle 
        currentTheme={theme}
        onThemeChange={updateTheme}
      />
    </header>
  );
}
```

## Available Components

### HeaderTitle

A customizable title component for your application header.

```javascript
<HeaderTitle 
  title="Application Name"
  subtitle="Optional subtitle"
  logoUrl="/path/to/logo.png"
  onClick={() => navigate('/home')}
/>
```

**Props:**
- `title` (string, required) - The main title text
- `subtitle` (string, optional) - Secondary text below the title
- `logoUrl` (string, optional) - URL to logo image
- `onClick` (function, optional) - Click handler for the title

### HeaderControls

A container component for header action items and controls.

```javascript
<HeaderControls 
  align="right"
  spacing="medium"
>
  {/* Your control components */}
</HeaderControls>
```

**Props:**
- `align` (string, optional) - Alignment: 'left', 'center', 'right'
- `spacing` (string, optional) - Spacing between items: 'small', 'medium', 'large'
- `children` (ReactNode) - Control components to render

### HeaderThemeToggle

A theme switching toggle button with support for light, dark, and auto modes.

```javascript
<HeaderThemeToggle 
  defaultTheme="auto"
  onThemeChange={(theme) => console.log(theme)}
  showLabel={true}
/>
```

**Props:**
- `defaultTheme` (string, optional) - Initial theme: 'light', 'dark', 'auto'
- `onThemeChange` (function, optional) - Callback when theme changes
- `showLabel` (boolean, optional) - Whether to show theme label text

### HeaderNavigation

A navigation component for header menu items.

```javascript
<HeaderNavigation 
  items={[
    { label: 'Home', href: '/', active: true },
    { label: 'About', href: '/about' },
    { label: 'Services', children: [...] }
  ]}
  orientation="horizontal"
/>
```

**Props:**
- `items` (array, required) - Navigation items with label, href, and optional children
- `orientation` (string, optional) - Layout: 'horizontal', 'vertical'
- `onNavigate` (function, optional) - Custom navigation handler

## Styling and Theming

The plugin includes CSS custom properties for easy theming:

```css
:root {
  --header-bg-color: #ffffff;
  --header-text-color: #333333;
  --header-border-color: #e1e5e9;
  --header-height: 60px;
  --header-padding: 0 1rem;
}

[data-theme="dark"] {
  --header-bg-color: #1a1a1a;
  --header-text-color: #ffffff;
  --header-border-color: #333333;
}
```

Import the base styles in your application:

```javascript
import 'renderx-plugin-header/dist/styles.css';
```

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
   ```bash
   git clone https://github.com/BPMSoftwareSolutions/renderx-plugin-header.git
   cd renderx-plugin-header
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes and commit**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Run tests and linting**
   ```bash
   npm run test
   npm run lint
   ```

6. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build the plugin
npm run build

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

## Testing

The plugin includes comprehensive test coverage using Jest and React Testing Library.

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test HeaderTitle.test.js
```

### Test Structure

```
tests/
├── components/
│   ├── HeaderTitle.test.js
│   ├── HeaderControls.test.js
│   ├── HeaderThemeToggle.test.js
│   └── HeaderNavigation.test.js
├── integration/
│   ├── renderx-integration.test.js
│   └── plugin-loading.test.js
└── utils/
    └── test-helpers.js
```

### Writing Tests

When contributing, please include tests for new features:

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { HeaderThemeToggle } from '../src/components/HeaderThemeToggle';

describe('HeaderThemeToggle', () => {
  it('should toggle theme on click', () => {
    const onThemeChange = jest.fn();
    render(<HeaderThemeToggle onThemeChange={onThemeChange} />);
    
    const toggleButton = screen.getByRole('button', { name: /theme/i });
    fireEvent.click(toggleButton);
    
    expect(onThemeChange).toHaveBeenCalledWith('dark');
  });
});
```

## Plugin Manifest Integration

For seamless integration with RenderX applications, use the following manifest configuration:

### Complete Manifest Example

```json
{
  "name": "my-renderx-app",
  "version": "1.0.0",
  "plugins": [
    {
      "name": "renderx-plugin-header",
      "version": "^1.0.0",
      "type": "ui-component",
      "entryPoint": "dist/index.js",
      "manifest": {
        "components": [
          {
            "name": "HeaderTitle",
            "export": "HeaderTitle",
            "type": "react-component"
          },
          {
            "name": "HeaderControls",
            "export": "HeaderControls", 
            "type": "react-component"
          },
          {
            "name": "HeaderThemeToggle",
            "export": "HeaderThemeToggle",
            "type": "react-component"
          },
          {
            "name": "HeaderNavigation",
            "export": "HeaderNavigation",
            "type": "react-component"
          }
        ],
        "styles": [
          "dist/styles.css"
        ],
        "dependencies": {
          "react": "^18.0.0",
          "react-dom": "^18.0.0"
        }
      },
      "loadStrategy": "eager",
      "scope": "global",
      "config": {
        "theme": {
          "default": "auto",
          "variants": ["light", "dark", "auto"]
        },
        "features": {
          "navigation": true,
          "themeToggle": true,
          "responsive": true
        }
      }
    }
  ]
}
```

### Conditional Loading

```json
{
  "plugins": [
    {
      "name": "renderx-plugin-header",
      "loadConditions": {
        "environment": ["production", "development"],
        "features": ["header", "navigation"],
        "viewport": {
          "minWidth": 768
        }
      }
    }
  ]
}
```

## API Reference

For detailed API documentation, visit our [API Reference](https://bpmsoftwaresolutions.github.io/renderx-plugin-header/api).

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://bpmsoftwaresolutions.github.io/renderx-plugin-header)
- 🐛 [Issue Tracker](https://github.com/BPMSoftwareSolutions/renderx-plugin-header/issues)
- 💬 [Discussions](https://github.com/BPMSoftwareSolutions/renderx-plugin-header/discussions)
- 📧 [Email Support](mailto:support@bpmsoftwaresolutions.com)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.
