# Orchestration Guide

**Generated**: 2025-11-22T16:04:17.783Z

## Sequences Overview

- **Total Sequences**: 54
- **Total Handlers**: 87
- **Total Topics**: 97

## Sequence Structure

Each sequence has:
- **Movements**: Logical groupings of work
- **Beats**: Individual handler invocations
- **Handler Types**: pure, io, stage-crew
- **Timing**: immediate or deferred

## Sample Sequences

### Canvas Component Copy
  - Copy to Clipboard (3 beats)

### Canvas Component Create
  - Create (6 beats)

### Canvas Component Delete
  - Delete (2 beats)

### Canvas Component Delete Requested
  - Route Delete (1 beats)

### Canvas Component Deselect All
  - Deselect All (2 beats)

## Event Topics

### Public Topics

- **canvas.component.copied**: Published when a component is copied to clipboard
- **canvas.component.pasted**: Published when a component is pasted from clipboard
- **canvas.component.select.svg-node.changed**: Published when SVG node selection changes
- **control.panel.classes.updated**: Published when CSS classes are updated for a component
- **control.panel.css.registry.updated**: Published when the CSS registry is updated
- **control.panel.selection.updated**: Published when control panel selection state is updated
- **react.component.error**: Published when a React component fails to compile or render
- **react.component.mounted**: Published when a React component is successfully mounted on the canvas

## Handler Types

- **pure**: Pure functions, no side effects
- **io**: I/O operations (API calls, storage)
- **stage-crew**: DOM manipulation and rendering

## See Also

- [HANDLER_REFERENCE.md](./HANDLER_REFERENCE.md) - Handler details
