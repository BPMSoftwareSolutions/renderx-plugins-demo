# Graph-to-SVG Converter & Advanced Scene Graph System

A comprehensive TypeScript library providing two powerful approaches to SVG generation:

1. **Graph-to-SVG Converter**: Clean, data-driven graph visualization with pluggable layouts and themes
2. **Advanced Scene Graph System**: Sprite-based composition with hierarchical groups, z-ordering, and visual effects

Both systems are implemented in pure TypeScript with zero external dependencies.

## Features

- 🎨 **Multiple Layout Engines**: Grid, Radial, and Layered (DAG-style) layouts
- 🌓 **Light & Dark Themes**: Built-in color palettes for different contexts
- 🎯 **Zero Dependencies**: Pure TypeScript implementation
- 📐 **Customizable Styling**: Rounded corners, arrow heads, dashed edges
- 🔧 **TypeScript Support**: Full type safety with comprehensive interfaces
- 🚀 **CLI Tool**: Command-line interface for quick conversions
- ✅ **Well Tested**: Comprehensive unit test coverage

### ✨ Configuration-Driven Architecture (NEW)

- 📋 **Data-Driven Design**: All knowledge separated from TypeScript code into JSON configurations
- 🧩 **Modular Components**: Mix and match sprites, themes, layouts, and templates
- 🔄 **Scalable & Reusable**: Generic generators that work with any configuration
- 🎛️ **Template Processing**: Parameter substitution and dependency management
- ✅ **Schema Validation**: JSON Schema validation for all configuration files
- 🎨 **Sprite Libraries**: Reusable SVG symbol collections organized by category
- 🎭 **Theme Configurations**: Color palettes, typography, spacing, and visual effects
- 📐 **Layout Configurations**: Algorithm-specific parameters for positioning nodes
- 📄 **Scene Templates**: Parameterizable scene definitions with examples

## Quick Start

### Installation

```bash
npm install --save-dev typescript @types/node
```

### Basic Usage

```typescript
import { graphToSVG } from "./src/svg-export";
import type { Graph } from "./src/graph";

const graph: Graph = {
  meta: { 
    layout: "layered", 
    theme: "light", 
    arrowHeads: true, 
    rounded: true 
  },
  nodes: [
    { id: "A", label: "Frontend" },
    { id: "B", label: "API" },
    { id: "C", label: "Database" }
  ],
  edges: [
    { from: "A", to: "B", label: "HTTP" },
    { from: "B", to: "C", label: "SQL" }
  ]
};

const svg = graphToSVG(graph);
console.log(svg); // Complete SVG string ready for use
```

### CLI Usage

```bash
# Build the project
npm run build

# Convert a JSON graph to SVG
npm run graph-to-svg samples/microservices-architecture.json

# Specify custom output path
npm run graph-to-svg samples/data-pipeline.json output/my-diagram.svg

# Generate sample graphs
npm run generate-samples
```

## Graph Schema

### Node Interface
```typescript
interface Node {
  id: string;           // Unique identifier
  label?: string;       // Display text (defaults to id)
  w?: number;          // Width in pixels (default: 120)
  h?: number;          // Height in pixels (default: 48)
  data?: Record<string, unknown>; // Custom data
}
```

### Edge Interface
```typescript
interface Edge {
  id?: string;         // Optional edge identifier
  from: string;        // Source node ID
  to: string;          // Target node ID
  label?: string;      // Edge label text
  dashed?: boolean;    // Dashed line style
}
```

### Graph Configuration
```typescript
interface Graph {
  nodes: Node[];
  edges: Edge[];
  meta?: {
    layout?: "grid" | "radial" | "layered";  // Layout algorithm
    spacingX?: number;                       // Horizontal spacing
    spacingY?: number;                       // Vertical spacing
    margin?: number;                         // Canvas margin
    theme?: "light" | "dark";               // Color theme
    rounded?: boolean;                       // Rounded node corners
    arrowHeads?: boolean;                    // Show arrow markers
  };
}
```

## Layout Engines

### Grid Layout (Default)
Arranges nodes in a grid pattern, ideal for simple visualizations.
```typescript
{ meta: { layout: "grid", spacingX: 180, spacingY: 120 } }
```

### Radial Layout
Places nodes in a circle, perfect for network or social graphs.
```typescript
{ meta: { layout: "radial" } }
```

### Layered Layout
Organizes nodes in layers based on dependencies (DAG-style).
```typescript
{ meta: { layout: "layered", spacingX: 200, spacingY: 100 } }
```

## Sample Patterns

The library includes several pre-built graph patterns:

### General Patterns
- **Microservices Architecture**: API Gateway, services, and databases
- **Data Pipeline**: ETL workflow with sources, transforms, and outputs
- **Neural Network**: Multi-layer perceptron with full connections
- **Social Network**: Radial friend connections
- **CI/CD Pipeline**: Build, test, and deployment workflow

### Plugin Architecture Patterns (Slide 1)
- **Plugin Package Structure**: Internal components and relationships
- **Plugin Manifest Structure**: Document structure and navigation
- **Handlers Export Structure**: Connectors, ports, and circuit traces
- **Build & Publish Process**: Conveyor to staging to publication
- **Host SDK Structure**: Console, rails, ports, and modules
- **Plugin Workflow**: Development lifecycle from scaffold to discovery
- **Plugin Capabilities**: Radial view of plugin features and boundaries

Generate all samples:
```bash
npm run generate-samples
npm run generate-slide-01
```

## Testing

Run the comprehensive test suite:
```bash
# Run all tests
npm test

# Run only graph-to-SVG tests
npm test -- tests/graph-to-svg.test.js tests/layout.test.js

# Run with coverage
npm run test:coverage
```

## API Reference

### Core Functions

- `graphToSVG(graph: Graph): string` - Convert graph to SVG string
- `layoutGraph(graph: Graph): LayoutResult` - Apply layout algorithm

### Sample Generators

#### General Patterns
- `createMicroservicesGraph()` - Generate microservices architecture
- `createDataPipelineGraph()` - Generate data processing pipeline
- `createNeuralNetworkGraph()` - Generate neural network diagram
- `createSocialNetworkGraph()` - Generate social network graph
- `createCICDGraph()` - Generate CI/CD pipeline

#### Plugin Architecture Patterns
- `createPluginPackageGraph()` - Plugin package internal structure
- `createPluginManifestGraph()` - Plugin manifest document structure
- `createHandlersExportGraph()` - Handlers export connectors and ports
- `createBuildPublishGraph()` - Build and publish process flow
- `createHostSDKGraph()` - Host SDK infrastructure components
- `createSlide01ArchitectureGraph()` - Overall slide 1 architecture
- `createPluginWorkflowGraph()` - Plugin development workflow
- `createPluginCapabilitiesGraph()` - Plugin capabilities and boundaries

## Advanced Scene Graph System

The Advanced Scene Graph System (Issue #7) provides a sophisticated approach to creating complex, layered SVG compositions. Unlike the simple graph-to-SVG converter, this system supports:

### Key Features
- **Sprite-based Composition**: Reusable SVG symbols for complex visual elements
- **Hierarchical Groups**: Nested composition with precise positioning and transforms
- **Z-ordering**: Depth sorting for proper layering of visual elements
- **Visual Effects**: SVG filters (shadows, glows) and gradients for polish
- **Smart Connectors**: Curved, orthogonal, and straight routing with markers
- **Precise Positioning**: Pixel-perfect placement based on design specifications

### Scene Schema
```typescript
export type Scene = {
  id: string;
  canvas: Size;
  bg?: string;
  defs?: {
    symbols?: Array<{ id: string; svg: string }>;
    filters?: string[];
    gradients?: string[]
  };
  nodes: Node[];
  connectors?: Connector[];
};

export type Node =
  | { kind: "group"; id: NodeId; children?: Node[] }
  | { kind: "sprite"; sprite: SpriteRef }
  | { kind: "shape"; shape: "rect"|"circle"|"path" }
  | { kind: "text"; text: string };
```

### Usage Example
```typescript
import { renderScene } from './src/render-svg';
import { slide01 } from './src/slide01-data';

const svg = renderScene(slide01);
// Generates complex SVG with sprites, effects, and connectors
```

### Slide 1 Implementation
The system includes a complete implementation of Slide 1 from the plugin architecture:
- **22 Reusable Sprites**: Package components, manifest elements, handlers, build process, host SDK
- **5 Hierarchical Tiles**: Plugin Package, Manifest, Handlers Export, Build & Publish, Host SDK
- **Visual Effects**: Soft shadows, violet gradients, opacity layers
- **Smart Connectors**: Curved and orthogonal routing between components

Generate the advanced scene:
```bash
npm run generate-slide-01-scene
```

See `samples/slide-01-scene/` for complete implementation and documentation.

## Configuration-Driven Architecture

The system now features a **configuration-driven architecture** that separates all hard-coded knowledge from TypeScript code into structured JSON files. This makes the generators generic, scalable, and highly reusable.

### Configuration Types

#### 🎨 Sprite Libraries (`config/sprites/`)
Reusable SVG symbol collections organized by category:
```json
{
  "name": "Plugin Architecture Sprites",
  "version": "1.0.0",
  "description": "SVG sprites for plugin architecture diagrams",
  "sprites": {
    "plugin-package": {
      "name": "Plugin Package",
      "description": "Plugin package container with rounded corners",
      "svg": "<rect width='280' height='100' rx='8' fill='#1a1f2e' stroke='#3d4465' stroke-width='1'/>"
    }
  }
}
```

#### 🎭 Theme Configurations (`config/themes/`)
Color palettes, typography, and visual styling:
```json
{
  "name": "Dark Plugin Theme",
  "colors": {
    "background": "#0f1116",
    "surface": "#1a1f2e",
    "primary": "#8b5cf6",
    "text": "#e2e8f0"
  },
  "typography": {
    "fontFamily": "Inter, system-ui, sans-serif",
    "fontSize": 12
  }
}
```

#### 📐 Layout Configurations (`config/layouts/`)
Algorithm-specific parameters for positioning:
```json
{
  "name": "Plugin Tiles Layout",
  "algorithm": "grid",
  "parameters": {
    "columns": 3,
    "spacing": { "x": 320, "y": 140 },
    "padding": { "x": 20, "y": 20 }
  }
}
```

#### 📄 Scene Templates (`config/templates/`)
Parameterizable scene definitions with examples:
```json
{
  "name": "Simple Plugin Scene",
  "description": "Basic two-tile plugin architecture scene",
  "version": "1.0.0",
  "parameters": {
    "canvasWidth": { "type": "number", "default": 800 },
    "tileWidth": { "type": "number", "default": 300 }
  },
  "dependencies": {
    "sprites": ["plugin-architecture"],
    "themes": ["dark-plugin"]
  },
  "canvas": {
    "width": "{{canvasWidth}}",
    "height": "{{canvasHeight}}"
  }
}
```

### Generic Generators

#### Scene Generator
```bash
# Generate from template with custom parameters
npm run scene:generate simple-plugin-scene -- --canvasWidth=1200 --tileWidth=400

# List available templates
npm run scene:list

# Generate from example
npm run scene:example simple-plugin-scene "Large Canvas"
```

#### Graph Generator
```bash
# Generate graph with theme and layout
npm run graph:generate microservices.json dark-plugin standard-graph

# Create sample templates
npm run graph:samples
```

### CLI Commands

The enhanced CLI provides comprehensive configuration management:

```bash
# Configuration management
npm run config:list              # List all available configurations
npm run config:sprites           # List sprite libraries
npm run config:themes            # List theme configurations
npm run config:layouts           # List layout configurations

# Scene generation
npm run scene:list               # List scene templates
npm run scene:generate <template> # Generate scene from template
npm run scene:example <template> <example> # Generate from example

# Graph generation
npm run graph:create-samples     # Create sample graph templates
npm run graph:list               # List graph templates
npm run graph:generate <template> <theme> <layout> # Generate graph
```

## Extending the Library

### Custom Layouts
Add new layout algorithms by implementing the layout interface:

```typescript
function customLayout(g: Graph, spacingX: number, spacingY: number): LayoutResult {
  // Your layout logic here
  return { nodes: positionedNodes };
}
```

### Custom Themes
Create new themes by adding JSON configuration files to `config/themes/`:

```json
{
  "name": "Custom Light Theme",
  "description": "Clean light theme for professional diagrams",
  "version": "1.0.0",
  "colors": {
    "background": "#ffffff",
    "surface": "#f8fafc",
    "primary": "#3b82f6",
    "secondary": "#64748b",
    "accent": "#10b981",
    "text": "#1e293b",
    "textSecondary": "#64748b",
    "border": "#e2e8f0"
  },
  "typography": {
    "fontFamily": "Inter, system-ui, sans-serif",
    "fontSize": 12,
    "fontWeight": 400
  },
  "spacing": {
    "padding": 16,
    "margin": 8,
    "borderRadius": 6
  }
}
```

## Integration Examples

### Web Applications
```typescript
// Generate SVG and inject into DOM
const svgString = graphToSVG(myGraph);
document.getElementById('diagram').innerHTML = svgString;
```

### Node.js Scripts
```typescript
// Save to file
import * as fs from 'fs';
const svg = graphToSVG(graph);
fs.writeFileSync('output.svg', svg);
```

### Build Pipelines
```bash
# Generate diagrams as part of build process
npm run generate-samples
npm run build:svgs
```

This implementation provides a solid foundation for creating beautiful, data-driven diagrams with minimal setup and maximum flexibility.
