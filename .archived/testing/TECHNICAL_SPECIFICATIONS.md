# RenderX RAG System - Technical Specifications

## Phase 7: Template Discovery & Synthesis

### 7.1 Exact Match Detection

**Interface:**
```typescript
interface ExactMatchResult {
  found: boolean;
  component: JsonComponent | null;
  confidence: number;  // 0-1
  reason: string;
}

class TemplateDiscoveryService {
  async detectExactMatch(prompt: string): Promise<ExactMatchResult>;
  async extractComponentType(prompt: string): Promise<string>;
  async findByType(type: string): Promise<JsonComponent | null>;
}
```

**Algorithm:**
1. Parse prompt to extract component type (e.g., "button" from "Create a button")
2. Query vector store for exact type match
3. Return component if found with 0.95 confidence
4. Return null if not found

**Test Cases:**
- "Create a button component" → returns button.json
- "I need an input field" → returns input.json
- "Make a custom widget" → returns null (no exact match)

### 7.2 Semantic Similarity with Ranking

**Interface:**
```typescript
interface RankedSearchResult {
  components: ComponentMetadata[];
  rankings: {
    id: string;
    similarity: number;      // 0-1 cosine similarity
    relevance: number;       // 0-1 multi-factor score
    reason: string;
  }[];
}

class SemanticSearchRanker {
  async searchWithRanking(
    prompt: string,
    limit?: number
  ): Promise<RankedSearchResult>;
  
  private calculateRelevance(
    prompt: string,
    metadata: ComponentMetadata
  ): number;
}
```

**Ranking Factors:**
- Cosine similarity (40%)
- Type match (20%)
- Category match (15%)
- Tag overlap (15%)
- Recency (10%)

**Test Cases:**
- "Create a clickable button" → ranks button.json first
- "Text input field" → ranks input.json first
- "Interactive element" → returns multiple with ranking

### 7.3 Template Synthesis Engine

**Interface:**
```typescript
interface SynthesizedComponent {
  metadata: ComponentMetadata;
  ui: ComponentTemplate;
  sourceComponents: string[];
  synthesisStrategy: 'combine' | 'extend' | 'adapt';
  confidence: number;
}

class TemplateSynthesisEngine {
  async synthesizeComponent(
    prompt: string,
    similarComponents: ComponentMetadata[]
  ): Promise<SynthesizedComponent>;
  
  private selectBaseTemplate(
    components: ComponentMetadata[],
    requirements: ParsedRequirements
  ): ComponentMetadata;
  
  private combinePatterns(
    base: ComponentMetadata,
    sources: ComponentMetadata[],
    requirements: ParsedRequirements
  ): ComponentTemplate;
}
```

**Synthesis Strategies:**
- **Combine:** Merge features from multiple components
- **Extend:** Add features to base component
- **Adapt:** Modify base component for new use case

**Test Cases:**
- Synthesize "button with icon" from button + image components
- Synthesize "input with validation" from input + validation patterns
- Synthesize "custom card" from container + heading + paragraph

### 7.4 Pattern Extraction

**Interface:**
```typescript
interface ExtractedPattern {
  name: string;
  description: string;
  components: string[];
  template: string;
  css: string;
  usage: string;
  frequency: number;  // How many components use this
}

class PatternExtractor {
  async extractPatterns(): Promise<ExtractedPattern[]>;
  async analyzePattern(patternType: string): Promise<ExtractedPattern>;
  async getPatternUsage(patternName: string): Promise<string[]>;
}
```

**Patterns to Extract:**
- Button variants (primary, secondary, danger, disabled)
- Input states (default, error, success, disabled, loading)
- Typography hierarchy (h1-h6 sizing and spacing)
- Spacing system (padding/margin consistency)
- Color scheme (CSS variables and inheritance)
- Responsive layout (mobile/tablet/desktop breakpoints)
- Accessibility attributes (ARIA, role, semantic HTML)

---

## Phase 8: Context-Aware Generation

### 8.1 Rich Context Building

**Interface:**
```typescript
interface GenerationContext {
  userPrompt: string;
  similarComponents: ComponentMetadata[];
  extractedPatterns: ExtractedPattern[];
  libraryStats: LibraryStats;
  bestPractices: string[];
  systemPrompt: string;
  examples: ComponentExample[];
}

class ContextBuilder {
  async buildGenerationContext(prompt: string): Promise<GenerationContext>;
  private generateSystemPrompt(
    similar: ComponentMetadata[],
    patterns: ExtractedPattern[],
    practices: string[]
  ): string;
}
```

**Context Components:**
- 5-10 similar components with explanations
- 3-5 extracted patterns with usage examples
- Library statistics (total components, categories, tags)
- 10 best practices specific to library
- System prompt with all context
- 3-5 complete component examples

**LLM Workload Reduction:**
- Without context: 2000+ tokens for generation
- With context: 600 tokens (70% reduction)

### 8.2 Multi-Component Examples

**Interface:**
```typescript
interface ComponentExample {
  component: JsonComponent;
  explanation: string;
  keyFeatures: string[];
  whenToUse: string;
  codeSnippet: string;
}

class ExampleGenerator {
  async prepareExamples(
    components: ComponentMetadata[]
  ): Promise<ComponentExample[]>;
}
```

### 8.3 Pattern Documentation

**Generated Documentation:**
```markdown
# Component Library Patterns

## Naming Conventions
- Components: PascalCase (Button, TextInput)
- CSS classes: kebab-case (rx-button, rx-button--primary)
- Variables: camelCase (bgColor, borderRadius)

## Template Structure
All components follow:
{
  "metadata": { type, name, description, category, tags },
  "ui": { template, styles: { css, variables, library } },
  "integration": { properties, canvasIntegration, events }
}

## CSS Patterns
[Extracted patterns with examples]

## Accessibility Requirements
- ARIA attributes for interactive elements
- WCAG AA color contrast
- Keyboard navigation support
- Semantic HTML usage
```

### 8.4 Best Practices Injection

**Best Practices List:**
1. Use CSS variables for theming
2. Support both default and library preview styles
3. Responsive design with mobile-first approach
4. Handlebars syntax for templates
5. Multiple variants (primary, secondary, danger)
6. Disabled and loading states
7. Semantic HTML (button, input, etc.)
8. ARIA attributes for accessibility
9. Icon support (emoji or SVG)
10. Document all properties in schema

---

## Phase 9: Template Adaptation Engine

### 9.1 Template Remixing

**Interface:**
```typescript
interface RemixResult {
  template: string;
  css: string;
  variables: Record<string, string>;
  sourceComponents: string[];
}

class TemplateRemixer {
  async remixTemplates(
    baseComponent: ComponentMetadata,
    sourceComponents: ComponentMetadata[],
    requirements: ParsedRequirements
  ): Promise<RemixResult>;
  
  private extractFeatures(component: ComponentMetadata): Feature[];
  private mergeFeatures(
    features: Feature[][],
    requirements: ParsedRequirements
  ): MergedFeatures;
}
```

### 9.2 Style Inheritance

**Interface:**
```typescript
interface CSSResult {
  variables: Record<string, string>;
  css: string;
  library: string;
}

class StyleInheritanceEngine {
  async inheritStyles(
    baseComponent: ComponentMetadata,
    sourceComponents: ComponentMetadata[]
  ): Promise<CSSResult>;
}
```

### 9.3 Property Mapping

**Interface:**
```typescript
interface PropertySchema {
  [key: string]: PropertyDefinition;
}

class PropertyMapper {
  async mapProperties(
    baseComponent: ComponentMetadata,
    sourceComponents: ComponentMetadata[],
    requirements: ParsedRequirements
  ): Promise<PropertySchema>;
}
```

### 9.4 Integration Patterns

**Interface:**
```typescript
interface IntegrationConfig {
  properties: PropertySchema;
  canvasIntegration: CanvasIntegration;
  events: EventDefinition[];
}

class IntegrationPatternApplier {
  async applyIntegrationPatterns(
    baseComponent: ComponentMetadata,
    sourceComponents: ComponentMetadata[]
  ): Promise<IntegrationConfig>;
}
```

---

## Phase 10: Quality Assurance & Validation

### 10.1 Schema Validation

**Validation Rules:**
- metadata.type: required, string, non-empty
- metadata.name: required, string, non-empty
- ui.template: required, valid Handlebars
- ui.styles.css: optional, valid CSS
- integration.properties: optional, valid JSON schema

**Error Levels:**
- ERROR: Blocks component generation
- WARNING: Allows generation but flags issue
- INFO: Informational only

### 10.2 Consistency Checking

**Checks:**
- Naming conventions (PascalCase, kebab-case, camelCase)
- CSS class naming (kebab-case)
- Variable naming (camelCase)
- Pattern compliance (extracted patterns)
- Metadata completeness

### 10.3 Accessibility Audit

**WCAG AA Checks:**
- ARIA attributes on interactive elements
- Color contrast ratio ≥4.5:1
- Keyboard navigation support
- Focus indicators visible
- Semantic HTML usage
- Alt text for images

### 10.4 Performance Metrics

**Metrics:**
- Template size (target: <5KB)
- CSS size (target: <10KB)
- Render time estimate
- Memory usage estimate
- Complexity score

---

## Phase 11: Production Framework & Scaling

### 11.1 Haystack Pipeline

**Pipeline Structure:**
```
Query
  ↓
[Query Classifier] → Route to code/component/log search
  ↓
[Retriever] → Vector + BM25 hybrid search
  ↓
[Ranker] → Re-rank by relevance
  ↓
[Reader] → Extract answer from context
  ↓
[LLM] → Generate response
  ↓
Answer
```

### 11.2 Elasticsearch Integration

**Indices:**
- `components`: Component metadata + markup
- `code`: Source code chunks with metadata
- `logs`: Log entries with session grouping
- `patterns`: Extracted patterns

**Hybrid Retrieval:**
- BM25 for exact matches (error codes, identifiers)
- Vector search for semantic matching
- Merge results by relevance score

### 11.3 Code & Log Indexing

**Code Indexing:**
- AST-based splitting by function/class
- Metadata: file path, line range, function name
- Include docstrings with function chunks

**Log Indexing:**
- Session-window grouping (5-20 lines)
- Metadata: timestamp, service, log level, session ID
- Shard by time range (daily)

### 11.4 Incremental Updates

**Change Detection:**
- Git hooks for file changes
- Merkle trees for efficient tracking
- Re-index only changed files
- Update embeddings incrementally

---

## Testing Strategy

### Unit Tests (>90% coverage)
- Each class tested independently
- Mock dependencies
- Test happy path + error cases
- Verify return types and values

### Integration Tests
- End-to-end workflows
- Real component data
- Vector store + Elasticsearch
- LLM integration (with mocks)

### Performance Tests
- Search latency <500ms
- Embedding generation <1s per component
- Indexing throughput >100 components/min

### Accessibility Tests
- Automated WCAG AA checks
- Manual review of generated components
- Keyboard navigation testing

### E2E Tests
- User request → generated component
- Validation pipeline
- Quality metrics

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| LLM Workload Reduction | 70% | Token count comparison |
| Pattern Consistency | 95% | Generated vs. library patterns |
| Zero Manual Fixes | 80% | Components needing no changes |
| Search Latency | <500ms | Query response time |
| Validation Pass Rate | 100% | Components passing validation |
| A11y Compliance | 100% | WCAG AA audit results |
| Test Coverage | >90% | Code coverage percentage |
| Documentation | 100% | API docs + examples |

