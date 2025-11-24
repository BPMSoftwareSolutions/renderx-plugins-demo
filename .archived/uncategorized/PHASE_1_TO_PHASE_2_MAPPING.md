# Phase 1 → Phase 2: Catalog to IR Extraction Mapping

## The Problem
We have **catalog data** (JSON source of truth) but need to extract **IR from source code** and compare them without confusion.

## The Solution: Clear Mapping

### Phase 1 Output (Catalog - What SHOULD Exist)
```
packages/ographx/.ographx/artifacts/renderx-web/catalog/
├── catalog-sequences.json      ← 53 symphonies with beats/handlers/topics
├── catalog-topics.json         ← 8 topics from 2 plugins
├── catalog-manifest.json       ← 9 plugins with UI/runtime info
└── catalog-components.json     ← 10 components with interaction→plugin mappings
```

### Phase 2 Input (Source Code - What ACTUALLY Exists)
Extract IR from:
```
packages/*/src/
├── handlers/          ← Extract handler implementations
├── sequences/         ← Extract sequence orchestration
├── topics/            ← Extract topic subscriptions
├── components/        ← Extract component implementations
└── index.ts           ← Extract plugin registration
```

### Phase 2 Output (IR - Extracted Reality)
```
packages/ographx/.ographx/artifacts/renderx-web/ir/
├── ir-sequences.json       ← Extracted symphonies from source
├── ir-topics.json          ← Extracted topics from source
├── ir-manifest.json        ← Extracted plugin registrations
├── ir-components.json      ← Extracted component implementations
└── ir-handlers.json        ← Extracted handler implementations
```

## The Mapping Logic

### 1. Sequences: Catalog → IR
**Catalog says:**
```json
{
  "id": "canvas-component-create-symphony",
  "movements": [
    { "beats": [
      { "handler": "createComponent", "event": "canvas:component:create" }
    ]}
  ]
}
```

**IR extracts from source:**
```
packages/canvas-component/src/handlers/createComponent.ts
  ↓ (implements handler)
packages/canvas-component/src/sequences/create.ts
  ↓ (orchestrates beats)
packages/canvas-component/src/index.ts
  ↓ (registers in plugin)
```

**Comparison:** Does IR have all 53 sequences? Do handlers match?

### 2. Topics: Catalog → IR
**Catalog says:**
```json
{
  "name": "canvas:component:created",
  "plugin": "CanvasComponentPlugin"
}
```

**IR extracts from source:**
```
packages/canvas-component/src/topics/canvas-component.ts
  ↓ (defines topic)
packages/canvas-component/src/handlers/*.ts
  ↓ (publishes to topic)
```

**Comparison:** Does IR have all 8 topics? Are they published correctly?

### 3. Components: Catalog → IR
**Catalog says:**
```json
{
  "type": "button",
  "interactions": {
    "canvas.component.create": {
      "pluginId": "CanvasComponentPlugin",
      "sequenceId": "canvas-component-create-symphony"
    }
  }
}
```

**IR extracts from source:**
```
packages/components/src/button.tsx
  ↓ (component implementation)
packages/canvas-component/src/handlers/createComponent.ts
  ↓ (handles canvas.component.create event)
packages/canvas-component/src/sequences/create.ts
  ↓ (orchestrates the sequence)
```

**Comparison:** Does IR show button → create sequence connection?

### 4. Handlers: Catalog → IR
**Catalog says:**
```json
{
  "beat": 1,
  "handler": "serializeSelectedComponent",
  "event": "canvas:component:copy:serialize"
}
```

**IR extracts from source:**
```
packages/canvas-component/src/handlers/serializeSelectedComponent.ts
  ↓ (implements handler)
packages/canvas-component/src/index.ts
  ↓ (exports handler)
```

**Comparison:** Does IR have all 84 handlers? Are they exported?

## Phase 2 IR Extraction Strategy

For each plugin package, extract:

1. **Handlers** - From `src/handlers/*.ts`
   - Function name
   - Parameters
   - Return type
   - Topics published to

2. **Sequences** - From `src/sequences/*.ts`
   - Sequence ID
   - Movements
   - Beats
   - Handler references

3. **Topics** - From `src/topics/*.ts`
   - Topic name
   - Subscribers
   - Publishers

4. **Components** - From `src/components/*.tsx`
   - Component type
   - Props
   - Event handlers

5. **Plugin Registration** - From `src/index.ts`
   - Plugin ID
   - Exported handlers
   - Exported sequences
   - Exported topics

## Phase 3: Comparison (Catalog vs IR)

```
Catalog says:        IR extracted:        Status:
53 sequences    vs   ? sequences      →   ✅ Match or ❌ Gap
84 handlers     vs   ? handlers       →   ✅ Match or ❌ Gap
8 topics        vs   ? topics         →   ✅ Match or ❌ Gap
10 components   vs   ? components     →   ✅ Match or ❌ Gap
```

## Key Insight

**Catalog is the SOURCE OF TRUTH**
- Phase 1 extracts what SHOULD exist (catalog)
- Phase 2 extracts what ACTUALLY exists (IR from source)
- Phase 3 compares them to find gaps

This prevents confusion because:
- Catalog is declarative (JSON)
- IR is extracted (code analysis)
- Comparison is objective (catalog vs IR)

