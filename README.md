# RenderX Plugins Demo

A **thin-client host application** showcasing the RenderX plugin architecture. This demo provides a lightweight shell with manifest-driven plugin loading and orchestrated via the MusicalConductor engine.

## Overview

This repository contains:

- A minimal host app that initializes the RenderX plugin system.
- Example plugins serving as a sandbox for testing orchestration flows, UI extension, and manifest-driven panel slots.

## Related Resources

Check out these supporting projects for more detail on the underlying architecture:

- **MusicalConductor** — the orchestration engine powering plugin coordination (symphonies, movements, beats):
  https://github.com/BPMSoftwareSolutions/MusicalConductor/blob/main/README.md

- **renderx-plugins** — core utilities, base interfaces, and manifest schema for RenderX-compatible plugins:
  https://github.com/BPMSoftwareSolutions/renderx-plugins/blob/main/README.md

## Getting Started

1. Clone this repository:

   ```bash
   git clone https://github.com/BPMSoftwareSolutions/renderx-plugins-demo.git
   cd renderx-plugins-demo
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Launch the host application:

   ```bash
   npm start
   ```

4. Interact with the example plugins via the UI or white-box exploring the code.

## Example Plugins

| Plugin Name      | Purpose                                           |
| ---------------- | ------------------------------------------------- |
| **SamplePanel**  | Adds a plugin UI panel via a manifest-driven slot |
| **CanvasWidget** | Demonstrates a rendering component plugin         |

## Development Workflow

- To add a new plugin:

  - Create a plugin folder under `plugins/`
  - Update the host manifest to include your plugin’s metadata and entry point
  - Restart the host to see it in action

- To test orchestration:

  - Create a plugin that registers into the conductor’s flow
  - Use `conductor.play()` to orchestrate actions across plugins

## Layout and Slots

- To add a new slot using the layout-manifest path, see:
  - docs/layout/ADD-A-SLOT.md

## Host SDK Migration (for external plugin authors)

See the canonical checklist and guidance here:

- docs/host-sdk/USING_HOST_SDK.md
- docs/host-sdk/EXTERNAL_PLUGIN_MIGRATION_CHECKLIST.md

## License

Specify your preferred license here (e.g., MIT).
