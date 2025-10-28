# AI Chatbot Architecture - Visual Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          RenderX Canvas Plugin                               │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Canvas Header (UI)                             │   │
│  │  [Select] [Move] [Draw] │ [Export] [Import] │ [Zoom] │ [🤖 AI]     │   │
│  └────────────────────────────────┬──────────────────────────────────────┘   │
│                                   │                                           │
│                                   │ onClick                                   │
│                                   ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     AI Chat Window (Floating)                        │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │  🤖 AI Component Assistant                      [─] [□] [✕]    │ │   │
│  │  ├────────────────────────────────────────────────────────────────┤ │   │
│  │  │  [Assistant]: Hello! Describe a component...                   │ │   │
│  │  │                                                                 │ │   │
│  │  │  [You]: Create a purple gradient button                        │ │   │
│  │  │        ▼                                                        │ │   │
│  │  │  [Processing...]  ───────────┐                                 │ │   │
│  │  │                               │                                 │ │   │
│  │  │  [Assistant]: Here's your component:                           │ │   │
│  │  │  ┌─────────────────────────────────┐                          │ │   │
│  │  │  │ [Preview Render]                │                          │ │   │
│  │  │  └─────────────────────────────────┘                          │ │   │
│  │  │  [Insert to Canvas] [Refine] [Cancel]                         │ │   │
│  │  ├────────────────────────────────────────────────────────────────┤ │   │
│  │  │  Type your message...                                  [Send]  │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────┬──────────────────────────────────────────────────────┘   │
│                    │                                                          │
│                    │ User sends message                                       │
│                    ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       AIService.ts                                   │   │
│  │  ┌────────────────────────────────────────────────────────────┐    │   │
│  │  │  async generateComponent(userPrompt: string)               │    │   │
│  │  │    1. Build system prompt (component schema + rules)       │    │   │
│  │  │    2. Add conversation context (last 3-5 messages)        │    │   │
│  │  │    3. Call OpenAI API ─────────────────────────┐          │    │   │
│  │  │    4. Parse JSON response                      │          │    │   │
│  │  │    5. Return ComponentDefinition               │          │    │   │
│  │  └────────────────────────────────────────────────┼──────────┘    │   │
│  └───────────────────────────────────────────────────┼───────────────┘   │
│                                                       │                       │
└───────────────────────────────────────────────────────┼───────────────────────┘
                                                        │
                                                        │ HTTPS POST
                                                        │
┌───────────────────────────────────────────────────────▼───────────────────────┐
│                          OpenAI API (External)                                │
│                                                                                │
│  Model: GPT-3.5-turbo or GPT-4                                               │
│  Endpoint: https://api.openai.com/v1/chat/completions                        │
│                                                                                │
│  Request:                                │  Response:                         │
│  {                                       │  {                                 │
│    "model": "gpt-3.5-turbo",             │    "choices": [{                   │
│    "messages": [                         │      "message": {                  │
│      { "role": "system", "content": ... },│        "content": "{              │
│      { "role": "user", "content": ... }  │          \"id\": \"custom-btn\", │
│    ],                                    │          \"metadata\": {...},     │
│    "temperature": 0.7,                   │          \"template\": {...}      │
│    "max_tokens": 1000                    │        }"                          │
│  }                                       │      }                             │
│                                          │    }]                              │
│                                          │  }                                 │
└──────────────────────────────────────────┼────────────────────────────────────┘
                                           │
                                           │ JSON Component Definition
                                           │
┌──────────────────────────────────────────▼────────────────────────────────────┐
│                        Validation Pipeline                                    │
│                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  ComponentValidator.validate(rawJSON)                               │    │
│  │    1. JSON Schema validation (structure check)                      │    │
│  │    2. HTML tag whitelist (only safe tags)                           │    │
│  │    3. CSS property sanitization (remove dangerous values)           │    │
│  │    4. DOMPurify.sanitize(markup) (XSS prevention)                   │    │
│  │    5. Size/complexity limits (prevent abuse)                        │    │
│  │    6. Return ValidationResult                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                                │
│  Output: { isValid: true, sanitizedComponent: {...} }                        │
└──────────────────────────────────────────┬────────────────────────────────────┘
                                           │
                                           │ Valid Component JSON
                                           │
┌──────────────────────────────────────────▼────────────────────────────────────┐
│                    Event Router Integration                                   │
│                                                                                │
│  EventRouter.publish("ai.component.insert.requested", {                      │
│    component: {                                                               │
│      id: "custom-button",                                                     │
│      metadata: { name: "Purple Button", category: "interactive" },           │
│      template: {                                                              │
│        type: "html",                                                          │
│        tag: "button",                                                         │
│        markup: "<button>Click Me</button>",                                   │
│        classes: ["rx-comp", "rx-button", "gradient-purple"],                 │
│        dimensions: { width: 120, height: 40 }                                │
│      },                                                                       │
│      defaultStyles: {                                                         │
│        background: "linear-gradient(to right, #9333ea, #ec4899)",            │
│        color: "#ffffff",                                                      │
│        borderRadius: "8px",                                                   │
│        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"                                │
│      }                                                                        │
│    },                                                                         │
│    position: { x: centerX, y: centerY },                                     │
│    onComponentCreated: (node) => { /* callback */ }                          │
│  }, conductor);                                                               │
│                                                                                │
└──────────────────────────────────────────┬────────────────────────────────────┘
                                           │
                                           │ Routes to existing flow
                                           │
┌──────────────────────────────────────────▼────────────────────────────────────┐
│                  Existing Canvas Drop Flow (Reused!)                          │
│                                                                                │
│  EventRouter.publish("library.component.drop.requested", ...)                │
│    ▼                                                                           │
│  LibraryComponentDropPlugin (existing)                                       │
│    ▼                                                                           │
│  library-component-drop-symphony (existing)                                  │
│    ▼                                                                           │
│  Stage-Crew Rendering                                                        │
│    ▼                                                                           │
│  DOM node rendered in #rx-canvas                                             │
│                                                                                │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────┐
│  User Types  │
│  "Create a   │
│   button"    │
└──────┬───────┘
       │
       ▼
┌────────────────────────┐
│  1. Capture Message    │
│     + Context          │
└────────┬───────────────┘
         │
         ▼
┌───────────────────────────────┐
│  2. Build OpenAI Request      │
│     - System prompt            │
│     - User prompt              │
│     - Conversation history     │
└────────┬──────────────────────┘
         │
         ▼
┌───────────────────────────────┐
│  3. Call OpenAI API            │
│     (2-4 seconds latency)      │
└────────┬──────────────────────┘
         │
         ▼
┌───────────────────────────────┐
│  4. Parse JSON Response        │
│     Extract component def      │
└────────┬──────────────────────┘
         │
         ▼
┌───────────────────────────────┐
│  5. Validate & Sanitize        │
│     - Schema check             │
│     - XSS prevention           │
│     - Whitelist validation     │
└────────┬──────────────────────┘
         │
         ├─── Valid? ───┐
         │              │
     ✅ Yes          ❌ No
         │              │
         ▼              ▼
┌─────────────────┐  ┌──────────────────┐
│ 6. Show Preview │  │ 7. Show Error +  │
│    in Chat      │  │    Retry Option  │
└────────┬────────┘  └──────────────────┘
         │
         ▼
┌───────────────────────────────┐
│  8. User Clicks "Insert"      │
└────────┬──────────────────────┘
         │
         ▼
┌───────────────────────────────┐
│  9. Publish Event              │
│     ai.component.insert.       │
│     requested                  │
└────────┬──────────────────────┘
         │
         ▼
┌───────────────────────────────┐
│  10. Existing Drop Flow        │
│      (library.component.drop)  │
└────────┬──────────────────────┘
         │
         ▼
┌───────────────────────────────┐
│  11. Stage-Crew Renders        │
│      Component in #rx-canvas   │
└───────────────────────────────┘
```

## Component Validation Pipeline (Security)

```
Raw AI Output (JSON string)
         │
         ▼
┌─────────────────────────────┐
│  Step 1: JSON.parse()       │
│  - Check valid JSON syntax  │
│  - Catch parse errors       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Step 2: Schema Validation  │
│  - Required fields exist    │
│  - Correct data types       │
│  - Valid structure          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Step 3: HTML Tag Whitelist │
│  Allowed: button, div, span,│
│           img, p, h1-h6, etc│
│  Blocked: script, iframe,   │
│           object, embed      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Step 4: CSS Sanitization   │
│  - Remove dangerous props   │
│    (expression, -moz-binding)│
│  - Validate URLs            │
│  - Limit values             │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Step 5: DOMPurify          │
│  - Sanitize markup field    │
│  - Remove event handlers    │
│  - Strip javascript: URLs   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Step 6: Size Limits        │
│  - Max dimensions: 2000px   │
│  - Max markup length: 5KB   │
│  - Max styles: 50 props     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  ✅ SAFE Component Ready    │
│     for Insertion           │
└─────────────────────────────┘
```

## OpenAI Prompt Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                        System Prompt (Static)                    │
│                                                                   │
│  "You are an expert UI component designer for RenderX.          │
│   Generate valid JSON component definitions following this      │
│   exact structure:                                               │
│                                                                   │
│   { id, metadata, template, defaultStyles }                     │
│                                                                   │
│   Rules:                                                         │
│   - Valid HTML5 tags only                                        │
│   - Include rx-comp class prefix                                 │
│   - Dimensions in pixels                                         │
│   - CSS properties in camelCase                                  │
│   - No external dependencies                                     │
│   - Ensure accessibility                                         │
│   - Respond ONLY with valid JSON"                                │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Conversation Context (Dynamic)                │
│                                                                   │
│  [Previous messages for context, last 3-5 exchanges]            │
│                                                                   │
│  User: "Create a button"                                         │
│  Assistant: "{ ... button component ... }"                       │
│  User: "Make it bigger"                                          │
│  Assistant: "{ ... bigger button ... }"                          │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Current User Prompt                         │
│                                                                   │
│  "Add a shadow and round the corners more"                       │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       OpenAI Response                            │
│                                                                   │
│  {                                                                │
│    "id": "custom-button-v3",                                     │
│    "metadata": {                                                 │
│      "name": "Rounded Shadow Button",                            │
│      "category": "interactive"                                   │
│    },                                                             │
│    "template": {                                                 │
│      "type": "html",                                             │
│      "tag": "button",                                            │
│      "markup": "<button>Click Me</button>",                      │
│      "classes": ["rx-comp", "rx-button"],                        │
│      "dimensions": { "width": 150, "height": 50 }                │
│    },                                                             │
│    "defaultStyles": {                                            │
│      "borderRadius": "16px",                                     │
│      "boxShadow": "0 8px 16px rgba(0,0,0,0.2)",                 │
│      "backgroundColor": "#007bff",                               │
│      "color": "#ffffff"                                          │
│    }                                                              │
│  }                                                                │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure & Responsibilities

```
src/
├── ai/                          [NEW AI MODULE]
│   ├── AIChat.tsx              → Main chat window UI (draggable, messages)
│   ├── AIChatButton.tsx        → Header trigger button
│   ├── AIService.ts            → OpenAI API client wrapper
│   ├── ComponentValidator.ts   → Validation & sanitization pipeline
│   ├── PromptTemplates.ts      → System & user prompt builders
│   └── types.ts                → TypeScript interfaces (ChatMessage, etc.)
│
├── ui/                          [EXISTING, MODIFY]
│   ├── CanvasHeader.tsx        → ADD: 🤖 AI button
│   ├── CanvasPage.tsx          → ADD: Mount AIChat component
│   ├── CanvasPage.css          → (No changes needed)
│   └── AIChat.css              → NEW: Chat window styles
│
└── index.ts                     → (No changes needed)

__tests__/
├── ai/                          [NEW TEST SUITE]
│   ├── AIService.spec.ts       → Test OpenAI integration (mocked)
│   ├── ComponentValidator.spec.ts → Test validation logic
│   └── AIChat.spec.ts          → Test UI component behavior
│
└── ...                          [EXISTING TESTS]
```

## Event Flow (New AI Events)

```
AI Chat Lifecycle:
  ┌─────────────────────────────┐
  │ ai.chat.opened              │ → User opens chat window
  │ ai.chat.closed              │ → User closes chat window
  │ ai.chat.minimized           │ → User minimizes chat window
  └─────────────────────────────┘

Component Generation:
  ┌─────────────────────────────┐
  │ ai.component.generation.    │
  │   started                   │ → Show loading state
  │                             │
  │ ai.component.generation.    │
  │   completed                 │ → Show preview
  │                             │
  │ ai.component.generation.    │
  │   failed                    │ → Show error + retry
  └─────────────────────────────┘

Component Insertion:
  ┌─────────────────────────────┐
  │ ai.component.insert.        │
  │   requested                 │ → User clicks "Insert"
  │         ▼                   │
  │ library.component.drop.     │
  │   requested                 │ → Reuse existing flow
  │         ▼                   │
  │ canvas.component.created    │ → Component in canvas
  └─────────────────────────────┘
```

## Technology Stack Summary

```
┌──────────────────────────────────────────────┐
│             Frontend (React)                 │
├──────────────────────────────────────────────┤
│  • React 19.1.1 (existing)                   │
│  • TypeScript 5.9.2 (existing)               │
│  • react-draggable ^4.0.0 (NEW)              │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│           AI & Validation                    │
├──────────────────────────────────────────────┤
│  • openai ^4.0.0 (NEW)                       │
│  • dompurify ^3.0.0 (NEW)                    │
│  • zod ^3.0.0 (NEW, optional)                │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│          RenderX SDK (Existing)              │
├──────────────────────────────────────────────┤
│  • @renderx-plugins/host-sdk ^1.0.4-rc.0     │
│    - useConductor() hook                     │
│    - EventRouter.publish()                   │
│    - resolveInteraction()                    │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│         External Services                    │
├──────────────────────────────────────────────┤
│  • OpenAI API (api.openai.com)               │
│    - GPT-3.5-turbo (MVP)                     │
│    - GPT-4 (future upgrade)                  │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│           Configuration                      │
├──────────────────────────────────────────────┤
│  • OPENAI_API_KEY (env var, required)        │
│  • OPENAI_MODEL (env var, optional)          │
│  • OPENAI_MAX_TOKENS (env var, optional)     │
│  • AI_CHAT_ENABLED (feature flag)            │
└──────────────────────────────────────────────┘
```

## Cost & Performance Metrics

```
┌─────────────────────────────────────────────┐
│              Cost Breakdown                 │
├─────────────────────────────────────────────┤
│  GPT-3.5-turbo:                             │
│    Input:  $0.0015 / 1K tokens              │
│    Output: $0.002 / 1K tokens               │
│                                             │
│  Per Generation (~750 tokens):              │
│    Cost: $0.0015                            │
│                                             │
│  Monthly (2000 generations):                │
│    Cost: ~$3                                │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│           Performance Targets               │
├─────────────────────────────────────────────┤
│  • OpenAI API latency: 2-4 seconds          │
│  • Chat window open: < 50ms                 │
│  • Validation pipeline: < 10ms              │
│  • Component insertion: < 100ms (existing)  │
│  • Total user wait time: 2-5 seconds        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│            Success Metrics                  │
├─────────────────────────────────────────────┤
│  • 30% user adoption in month 1             │
│  • 60% components inserted without refine   │
│  • < 5% validation failure rate             │
│  • 95%+ API success rate                    │
│  • < 2 refinement iterations average        │
└─────────────────────────────────────────────┘
```

---

**Visual Guide Version**: 1.0  
**Last Updated**: October 3, 2025  
**Status**: Ready for Implementation
