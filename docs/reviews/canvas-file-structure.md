# Canvas .ui File Structure (observed)

Minimal schema inferred from existing files:

- version: string (e.g., "1.0.1")
- metadata: { createdAt: ISO string, canvasSize: { width, height }, componentCount }
- cssClasses: map of className -> { name, content, isBuiltIn, createdAt, updatedAt }
- components: array of nodes
  - Common fields:
    - id: string (free-form; examples use "rx-node-..."; we can also use semantic ids like "scene-5")
    - type: "svg" | "container" (observed)
    - template: { tag: string, classRefs?: string[], style?: object }
    - layout: { x, y, width, height }
    - parentId: string | null (nesting supported; containers can be parents)
    - siblingIndex: number
    - createdAt: number (epoch-ish)
    - content: varies
      - for container: { text?: string }
      - for svg: {
          content?: string, text?: string,
          viewBox?: string, preserveAspectRatio?: string,
          svgMarkup: string (full inline SVG)
        }

Notes
- Nesting SVGs under containers allows contextual boundaries and grouping.
- Class refs include built-ins: rx-comp, rx-svg, rx-container.
- Inline svgMarkup is the current pattern; external references are not observed.

