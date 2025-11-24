# 🤖 AI-Powered Component Generator Chatbot

## Summary
Add a floating, draggable AI chatbot powered by OpenAI (OPENAI_API_KEY) that allows users to generate custom component styling and create entirely new components through natural language prompts.

## Problem
Users are currently limited to components in the `@renderx-plugins/components` library and must manually edit JSON to customize styling or create new components. This creates friction for:
- Rapid prototyping and iteration
- Users unfamiliar with JSON component structure  
- Creating unique components not in the standard library

## Proposed Solution
Implement a floating chat window that:
- ✨ Generates component JSON from natural language (e.g., "create a purple gradient button")
- 🎨 Modifies existing component styling (e.g., "make this button bigger with rounded corners")
- 🔧 Creates custom components matching the library format
- 👁️ Previews components before insertion
- 💬 Supports multi-turn conversations for refinement

## Key Features

### Phase 1: MVP (2-3 weeks)
- [ ] Floating, draggable chat window (movable, minimizable)
- [ ] OpenAI API integration (GPT-3.5-turbo)
- [ ] Component generation from text prompts
- [ ] JSON validation & XSS sanitization
- [ ] Insert to canvas (reuse existing drop flow)
- [ ] Error handling & retry logic

### Phase 2: Enhanced (1-2 weeks)
- [ ] Component preview before insertion
- [ ] Style modification for existing selected components
- [ ] Multi-turn conversations (context awareness)
- [ ] Component variation suggestions
- [ ] Template gallery from successful generations

### Phase 3: Advanced (2-3 weeks)
- [ ] Context awareness (analyze selected component automatically)
- [ ] Batch component generation
- [ ] Export AI-generated components to library
- [ ] Accessibility audit suggestions
- [ ] Code explanation mode

## Technical Details

### Architecture
```
User Input → OpenAI API (GPT-3.5/4) → JSON Component Definition 
  → Validation & Sanitization → Preview → EventRouter.publish("ai.component.insert.requested") 
  → Existing Library Drop Flow → Stage-Crew Rendering
```

### Component JSON Format (from `@renderx-plugins/components`)
```json
{
  "id": "unique-id",
  "metadata": { "name": "Display Name", "category": "..." },
  "template": { 
    "type": "html", 
    "tag": "button", 
    "markup": "<button>Click</button>",
    "classes": ["rx-comp", "rx-button"],
    "dimensions": { "width": 100, "height": 40 }
  },
  "defaultStyles": {
    "backgroundColor": "#007bff",
    "color": "#ffffff"
  }
}
```

### Dependencies
```json
{
  "openai": "^4.0.0",
  "dompurify": "^3.0.0",
  "react-draggable": "^4.0.0",
  "zod": "^3.0.0"
}
```

### Files to Create
```
src/ai/
  ├── AIChat.tsx              # Main chat window
  ├── AIChatButton.tsx        # Header button
  ├── AIService.ts            # OpenAI integration
  ├── ComponentValidator.ts   # Validation & sanitization
  ├── PromptTemplates.ts      # System prompts
  └── types.ts                # TypeScript interfaces
```

### Files to Modify
```
src/ui/
  ├── CanvasHeader.tsx        # Add 🤖 AI button
  └── CanvasPage.tsx          # Mount chat window
```

### Integration with Canvas
Add AI button to `CanvasHeader.tsx`:
```tsx
<div className="canvas-control" onClick={handleOpenAIChat} title="AI Assistant">
  <span>🤖</span>
</div>
```

Publish to existing event system:
```typescript
EventRouter.publish("ai.component.insert.requested", {
  component: aiGeneratedComponent,
  position: { x: centerX, y: centerY },
  // Reuse existing drop flow
}, conductor);
```

## Security & Privacy

### Critical Safeguards
- ✅ Store API key in environment variables (never commit)
- ✅ Sanitize all generated markup with DOMPurify
- ✅ Validate against whitelist of HTML tags & CSS properties
- ✅ Rate limiting (1 request per 2 seconds client-side)
- ✅ Inform users data is sent to OpenAI
- ✅ XSS prevention via strict validation pipeline

### For Production
- Consider backend proxy to hide API key
- Implement server-side rate limiting & cost monitoring
- Set monthly budget alerts

## Cost Analysis

**GPT-3.5-turbo** (Recommended for MVP):
- Per generation: ~$0.0015 (less than a penny)
- 100 users × 20 generations/month = 2,000 generations
- **Monthly cost: ~$3** ✅ Very affordable

**GPT-4** (Higher quality option):
- Per generation: ~$0.03
- Same usage: **~$60/month**

## Example User Flows

### Flow 1: Generate New Component
1. User clicks 🤖 button in header
2. Chat opens in bottom-right corner
3. User types: *"Create a card component with an image at the top, a title, and a description"*
4. AI generates JSON (2-3 seconds)
5. Preview shows in chat with visual render
6. User clicks "Insert to Canvas"
7. Component appears at center of canvas

### Flow 2: Modify Existing Component
1. User selects button on canvas
2. Opens AI chat
3. Types: *"Make this button have a gradient from purple to pink with a shadow"*
4. AI understands context (selected component)
5. Generates modified version
6. User previews and inserts
7. Selected button updates with new styling

### Flow 3: Iterative Refinement
1. User generates initial button
2. Types: *"Make it bigger"*
3. AI refines (uses conversation context)
4. Types: *"Add a hover effect"*
5. AI adds hover styles
6. Types: *"Perfect! Insert it"*
7. Final version inserted

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| AI generates invalid JSON | Strict schema validation + retry with error feedback |
| XSS vulnerabilities | DOMPurify + whitelist validation + security tests |
| Runaway API costs | Rate limiting + usage dashboard + monthly budget alerts |
| User expectations too high | Clear documentation + example prompts + limitations disclosure |
| API key exposure | Environment variables + backend proxy (production) |

## Success Metrics

**Adoption**:
- 30% of users try AI chat in first month
- 10% become regular users (5+ generations/month)

**Quality**:
- 60% of components inserted without modification
- < 2 refinement iterations average
- < 5% validation failure rate

**Technical**:
- 95%+ API success rate
- < 5 second response time (p95)
- Zero XSS incidents
- < $10/month API costs (first 3 months)

## Testing Strategy

### Unit Tests
- Mock OpenAI API responses
- Schema validation edge cases
- XSS attack vectors (sanitization)
- Chat UI interactions (drag, minimize)

### Integration Tests
- End-to-end generation → insertion flow
- API error handling
- Context management (multi-turn)

### E2E Tests
- User generates component via chat
- User refines through conversation
- User modifies existing component

## Acceptance Criteria

- [ ] User can open floating chat window from header
- [ ] User can drag window anywhere on screen
- [ ] User can minimize/maximize window
- [ ] User can send natural language prompts
- [ ] System generates valid JSON within 5 seconds
- [ ] Generated components pass validation (100%)
- [ ] User can preview component before insertion
- [ ] User can insert component with one click
- [ ] System handles API errors gracefully
- [ ] Chat maintains conversation context
- [ ] No XSS vulnerabilities (security audit passed)
- [ ] API costs < $0.01 per generation

## UI Mockup

```
Canvas Header: [...] [🤖 AI] [...]

Floating Chat Window:
┌─────────────────────────────────────────┐
│  🤖 AI Component Assistant        ─ □ ✕ │  ← Draggable
├─────────────────────────────────────────┤
│ [Assistant]: Hello! Describe a         │
│ component and I'll generate it.         │
│                                         │
│ [You]: Create a purple gradient button  │
│                                         │
│ [Assistant]: Here's your component:     │
│ ┌─────────────────────────────────────┐ │
│ │ [Preview Render]                    │ │
│ │ Purple Button                       │ │
│ └─────────────────────────────────────┘ │
│ [Insert to Canvas] [Refine] [Cancel]   │
├─────────────────────────────────────────┤
│ Type your message...            [Send]  │
└─────────────────────────────────────────┘
```

## Implementation Steps

1. **Environment Setup** (1 day)
   - Add dependencies (`openai`, `dompurify`, `react-draggable`)
   - Configure `OPENAI_API_KEY` in environment

2. **Create AI Service** (2 days)
   - OpenAI client wrapper
   - Prompt templates (system + user)
   - Response parsing & error handling

3. **Build Chat UI** (3 days)
   - Draggable window component
   - Message list with streaming
   - Input field + send button
   - Preview panel

4. **Validation Pipeline** (2 days)
   - JSON schema validation
   - DOMPurify sanitization
   - HTML tag whitelist
   - Security tests

5. **Canvas Integration** (2 days)
   - Add AI button to header
   - Wire EventRouter topics
   - Connect to drop flow

6. **Testing & Polish** (3 days)
   - Unit + integration tests
   - E2E user flows
   - Error handling refinement
   - Documentation

**Total: 13 days (~2-3 weeks)**

## References & Resources

- **OpenAI API**: https://platform.openai.com/docs/api-reference
- **Component Library**: https://github.com/BPMSoftwareSolutions/renderx-plugin-components
- **DOMPurify**: https://github.com/cure53/DOMPurify
- **React Draggable**: https://github.com/react-grid-layout/react-draggable
- **Similar Tools**: v0.dev (Vercel), Galileo AI, GitHub Copilot

## Alternative Approaches

If AI approach doesn't work out:

**Plan B**: Template-based generator with form inputs (color pickers, sliders)
- Pros: No API costs, deterministic, privacy-first
- Cons: Less flexible, limited creativity

**Plan C**: Community component marketplace
- Pros: User-generated, no AI costs
- Cons: Slow growth, quality inconsistent

## Next Steps

1. ✅ Stakeholder review & approval
2. ⏭️ 2-day spike: OpenAI integration POC
3. ⏭️ Design review: Finalize UI mockups
4. ⏭️ Create feature branch: `feature/ai-chatbot-mvp`
5. ⏭️ Begin Phase 1 implementation

---

**Labels**: `enhancement`, `ai`, `feature-request`, `high-value`, `needs-review`  
**Priority**: Medium  
**Complexity**: High  
**Value**: High  
**Estimated Effort**: 2-3 weeks (Phase 1)  
**Estimated Cost**: ~$3-5/month (testing), ~$10-30/month (production)

**Recommendation**: ✅ **Proceed with Phase 1 MVP** - Low risk, high value, affordable, aligns with product vision.
