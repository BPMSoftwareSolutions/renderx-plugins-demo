# 🔐 Add Secure Configuration Service to Host SDK

## 📝 Summary
Add a secure configuration service to the Host SDK that allows plugins to access environment-specific secrets and configuration values without exposing them in browser storage or plugin code.

**User Story:** As a plugin developer, I want to access API keys and configuration secrets securely so that I can integrate with external services without compromising security.

**Example Flow:**
```typescript
// In plugin code
import { getConfigValue } from '@renderx-plugins/host-sdk';

const apiKey = getConfigValue('OPENAI_API_KEY');
if (apiKey) {
  // Use the key to call external service
  const client = new OpenAIClient(apiKey);
}
```

---

## 🎯 Motivation

### Current State
- Plugins have no secure way to access API keys or secrets
- Current options: localStorage (insecure), hardcoded (worse), or undefined
- Each plugin must implement its own insecure solution
- No centralized way to manage secrets across plugins

### Desired State
- Host provides secure configuration service via `window.RenderX.config`
- Plugins access via Host SDK helpers
- Environment variables work seamlessly in E2E/CI
- Clear upgrade path to backend proxy for production
- Respects thin host + plugin architecture boundaries

### Benefits
- **Security:** Centralized secret management with clear security model
- **DX:** Simple API for plugin developers
- **E2E:** Works with CI/CD environment variables
- **Architecture:** Respects plugin boundaries via SDK
- **Scalability:** Easy to upgrade to backend proxy later

---

## ✨ Features

### 1. Host Configuration Service
- Exposed via `window.RenderX.config` global API
- Provides `get(key)` and `has(key)` methods
- Sources from environment variables (E2E/dev) or backend (production)
- Never logs or exposes keys in console/DOM

### 2. Host SDK Exports
- `getConfigValue(key: string): string | undefined`
- `hasConfigValue(key: string): boolean`
- `getConfigProxy(): ConfigProxy | undefined` (Phase 2)
- TypeScript types for all methods

### 3. E2E/CI Support
- Read from `process.env` at build time
- Support for Vite `define` for compile-time injection
- GitHub Secrets integration documented
- Local `.env.local` support for development

### 4. Security Features
- Keys never exposed in DOM or console
- Warning system when keys accessed in insecure contexts
- Audit logging (optional, dev mode only)
- Clear documentation of security model

### 5. Backend Proxy Preparation (Phase 2)
- Config service abstracts implementation
- Easy migration from env vars to backend proxy
- No plugin code changes required

---

## 🏗️ Technical Implementation

### New Files
```
packages/host-sdk/
  ├── core/
  │   └── environment/
  │       ├── config.ts                    # Config service implementation
  │       ├── config.types.ts              # TypeScript interfaces
  │       └── config.security.ts           # Security helpers

src/
  ├── core/
  │   └── environment/
  │       └── config-bootstrap.ts          # Host-side initialization

docs/
  └── host-sdk/
      ├── CONFIG_SERVICE.md                # Usage documentation
      └── CONFIG_SECURITY.md               # Security best practices

__tests__/
  ├── config.service.spec.ts               # Unit tests
  └── config.integration.spec.ts           # Integration tests
```

### Modified Files
```
src/index.tsx                              # Add config to window.RenderX
packages/host-sdk/index.ts                 # Export config helpers
packages/host-sdk/public-api.ts            # Add to public API
vite.config.js                             # Add define for env vars
README.md                                  # Document config service
```

---

## 🔒 Security Model

### Development/E2E Mode
**Flow:** Environment Variable → Vite Define → window.RenderX.config → Plugin

```typescript
// vite.config.js
export default {
  define: {
    '__CONFIG_OPENAI_API_KEY__': JSON.stringify(process.env.OPENAI_API_KEY || ''),
  }
}

// src/index.tsx
(window as any).RenderX.config = {
  get: (key: string) => {
    if (key === 'OPENAI_API_KEY') {
      return typeof __CONFIG_OPENAI_API_KEY__ !== 'undefined' 
        ? __CONFIG_OPENAI_API_KEY__ 
        : undefined;
    }
    return undefined;
  }
};
```

**Security Level:** ⚠️ Medium
- Keys visible in bundled JavaScript
- Acceptable for E2E/CI with spending limits
- Not for production with real user keys

### Production Mode (Phase 2)
**Flow:** Plugin → Host Config → Backend Proxy → External Service

```typescript
// window.RenderX.config
{
  apiProxy: {
    post: async (endpoint: string, payload: any) => {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        body: JSON.stringify({ endpoint, payload })
      });
      return response.json();
    }
  }
}
```

**Security Level:** ✅ High
- Keys never sent to browser
- Backend handles authentication
- Rate limiting and monitoring
- Audit trail

---

## 📋 API Specification

### Host SDK Exports

```typescript
/**
 * Retrieves a configuration value by key.
 * Returns undefined if key does not exist or is empty.
 * 
 * @param key - Configuration key (e.g., 'OPENAI_API_KEY')
 * @returns Configuration value or undefined
 * 
 * @example
 * const apiKey = getConfigValue('OPENAI_API_KEY');
 * if (apiKey) {
 *   // Use the key
 * }
 */
export function getConfigValue(key: string): string | undefined;

/**
 * Checks if a configuration value exists without retrieving it.
 * Useful for feature detection.
 * 
 * @param key - Configuration key
 * @returns true if value exists and is non-empty
 * 
 * @example
 * if (hasConfigValue('OPENAI_API_KEY')) {
 *   // Show AI features
 * } else {
 *   // Show setup instructions
 * }
 */
export function hasConfigValue(key: string): boolean;

/**
 * Gets the list of available configuration keys.
 * Does not expose values, only key names.
 * 
 * @returns Array of configuration key names
 */
export function getConfigKeys(): string[];

/**
 * (Phase 2) Gets the API proxy for making secure requests.
 * 
 * @returns ConfigProxy instance or undefined
 */
export function getConfigProxy(): ConfigProxy | undefined;
```

### TypeScript Types

```typescript
export interface ConfigService {
  /** Get configuration value by key */
  get(key: string): string | undefined;
  
  /** Check if configuration key exists */
  has(key: string): boolean;
  
  /** Get list of available keys (not values) */
  keys(): string[];
}

export interface ConfigProxy {
  /** Make POST request via proxy */
  post(endpoint: string, payload: any): Promise<any>;
  
  /** Make GET request via proxy */
  get(endpoint: string): Promise<any>;
}

export type ConfigKey = 
  | 'OPENAI_API_KEY'
  | 'ANTHROPIC_API_KEY'
  | 'CUSTOM_API_KEY'
  | string; // Allow custom keys
```

---

## 📅 Implementation Plan

### Phase 1: MVP (1 week) - Environment Variables
**Goal:** Basic config service with environment variable support

- [x] **Day 1-2: Core Implementation**
  - [ ] Create `config.ts` in Host SDK
  - [ ] Add `window.RenderX.config` initialization in `src/index.tsx`
  - [ ] Export SDK helpers from public API
  - [ ] Add TypeScript types and interfaces

- [x] **Day 3-4: Vite Integration**
  - [ ] Add `define` configuration to `vite.config.js`
  - [ ] Support multiple config keys
  - [ ] Add `.env.local.example` template
  - [ ] Document environment variable naming

- [x] **Day 5: Testing & Documentation**
  - [ ] Unit tests for config service
  - [ ] Integration test with mock plugin
  - [ ] Write `CONFIG_SERVICE.md` documentation
  - [ ] Update README with config usage

### Phase 2: Backend Proxy (2-3 weeks)
**Goal:** Production-ready secure proxy

- [ ] **Week 1: Backend Implementation**
  - [ ] Create Express/Fastify proxy server
  - [ ] Implement OpenAI proxy endpoint
  - [ ] Add rate limiting and auth
  - [ ] Deploy to development environment

- [ ] **Week 2: Host Integration**
  - [ ] Add `apiProxy` to `window.RenderX.config`
  - [ ] Update SDK with proxy helpers
  - [ ] Add environment detection (dev vs prod)
  - [ ] Implement fallback logic

- [ ] **Week 3: Testing & Hardening**
  - [ ] Security audit
  - [ ] Load testing
  - [ ] Error handling scenarios
  - [ ] Production deployment guide

---

## ✅ Acceptance Criteria

### Must Have (Phase 1)
- [ ] `window.RenderX.config` exposed with `get()` and `has()` methods
- [ ] Host SDK exports `getConfigValue()` and `hasConfigValue()`
- [ ] Environment variables read at build time via Vite `define`
- [ ] Keys never logged to console or exposed in DOM
- [ ] TypeScript types for all exports
- [ ] Unit tests with 90%+ coverage
- [ ] Documentation with examples
- [ ] Works in E2E tests with GitHub Secrets

### Should Have
- [ ] Support for multiple config keys (not just OpenAI)
- [ ] `.env.local` support for local development
- [ ] Warning when accessing config in insecure context
- [ ] `getConfigKeys()` for feature detection
- [ ] Example plugin using config service

### Nice to Have
- [ ] Audit logging in dev mode
- [ ] Config validation (key format, etc.)
- [ ] Encrypted storage option
- [ ] Config versioning/migration

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
describe('Config Service', () => {
  it('returns undefined for non-existent keys', () => {
    expect(getConfigValue('NON_EXISTENT')).toBeUndefined();
  });

  it('returns value for existing keys', () => {
    // Mock window.RenderX.config
    expect(getConfigValue('OPENAI_API_KEY')).toBe('sk-test...');
  });

  it('has() returns true for existing keys', () => {
    expect(hasConfigValue('OPENAI_API_KEY')).toBe(true);
  });

  it('has() returns false for missing keys', () => {
    expect(hasConfigValue('MISSING_KEY')).toBe(false);
  });
});
```

### Integration Tests
```typescript
describe('Config Service Integration', () => {
  it('plugin can access config via SDK', async () => {
    const plugin = await import('./test-plugin');
    expect(plugin.hasApiKey()).toBe(true);
  });

  it('config works in E2E with env vars', () => {
    cy.window().should((win) => {
      expect(win.RenderX.config.get('OPENAI_API_KEY')).to.exist;
    });
  });
});
```

### E2E Tests
- Test with real environment variable in CI
- Test fallback when key missing
- Test plugin using config to make API call
- Test security (no key leakage in logs/DOM)

---

## ⚠️ Security Considerations

### What This Solves
✅ No hardcoded API keys in plugin code  
✅ No insecure localStorage usage  
✅ Centralized secret management  
✅ Clear upgrade path to secure proxy  
✅ Works with CI/CD secrets  

### What This Doesn't Solve (Phase 1)
❌ Keys are visible in bundled JavaScript  
❌ Client-side keys can be extracted  
❌ No rate limiting per user  
❌ No spending controls  

### Migration to Phase 2
- Plugin code doesn't change
- Host swaps env vars for backend proxy
- Transparent upgrade path
- Zero plugin code changes

---

## 📊 Success Metrics

### Technical
- 90%+ test coverage
- Zero key leakage in logs/DOM
- <50ms config access time
- Works in E2E CI without issues

### Developer Experience
- Plugin can access config in <5 lines of code
- Clear documentation with examples
- No security gotchas or surprises
- Easy local development setup

### Security
- No keys in console/DOM inspector
- Audit log available for security review
- Clear security model documented
- Production path clearly defined

---

## 🎓 Key Decisions

### Why Environment Variables?
✅ Simple for E2E/CI integration  
✅ Standard practice in development  
✅ Works with GitHub Secrets  
✅ No infrastructure required  

### Why Not localStorage?
❌ Vulnerable to XSS attacks  
❌ Accessible to all JavaScript  
❌ No encryption  
❌ Persists across sessions  

### Why Window.RenderX.config?
✅ Fits existing architecture  
✅ Central point of control  
✅ Easy to swap implementation  
✅ Respects plugin boundaries  

---

## 🔗 Related Issues & Dependencies

### Depends On
- None (can be implemented immediately)

### Enables
- #XXX - AI Chatbot for Library Plugin (needs config service)
- Future features requiring API keys or secrets
- Third-party service integrations

### Related Documentation
- `docs/host-sdk/USING_HOST_SDK.md` - Host SDK overview
- `docs/adr/ADR-0023 — Host SDK and Plugin Decoupling.md` - Architecture decisions
- `docs/design-reviews/plugin-host-decoupling.md` - Decoupling strategy

---

## 💬 Open Questions

1. **Config Key Naming:** Prefix with `RENDERX_` or allow any key name?
   - Recommendation: Allow any, document conventions

2. **Multiple Plugins, Same Key:** Should keys be plugin-scoped?
   - Recommendation: Global keys, plugins share (backend proxy can scope later)

3. **Local Development:** Require `.env.local` or allow UI input?
   - Recommendation: `.env.local` for Phase 1, UI in Phase 2

4. **Key Validation:** Should config service validate key formats?
   - Recommendation: No validation in Phase 1, add in Phase 2

5. **Fallback Behavior:** What if key is missing?
   - Recommendation: Return `undefined`, let plugin handle

---

## 📦 Estimated Effort

| Task | Effort | Dependencies |
|------|--------|--------------|
| **Phase 1: Core Implementation** | 2-3 days | None |
| **Phase 1: Vite Integration** | 1-2 days | Core done |
| **Phase 1: Testing** | 1-2 days | Implementation done |
| **Phase 1: Documentation** | 1 day | Implementation done |
| **Phase 2: Backend Proxy** | 2-3 weeks | Phase 1 complete |
| **Total (Phase 1)** | **1 week** | **1 developer** |
| **Total (Phase 2)** | **3 weeks** | **1 developer** |

---

## 🏷️ Labels

`enhancement` `host-sdk` `security` `configuration` `architecture` `needs-discussion`

---

## 📖 Example Usage

### Plugin Code (Library AI Chatbot)
```typescript
// src/services/openai.service.ts
import { getConfigValue, hasConfigValue } from '@renderx-plugins/host-sdk';

export class OpenAIService {
  private apiKey?: string;

  constructor() {
    this.apiKey = getConfigValue('OPENAI_API_KEY');
  }

  isConfigured(): boolean {
    return hasConfigValue('OPENAI_API_KEY');
  }

  async generateComponent(prompt: string) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    return response.json();
  }
}
```

### E2E Test Setup
```yaml
# .github/workflows/e2e.yml
- name: Run E2E Tests
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  run: npm run e2e
```

### Local Development
```bash
# .env.local (gitignored)
OPENAI_API_KEY=sk-test-your-key-here
```

---

## 🚀 Rollout Plan

### Week 1: Phase 1 Implementation
- Implement core config service
- Add to Host SDK exports
- Write tests and documentation

### Week 2: Integration
- Integrate with Library plugin AI feature
- Test in E2E environment
- Gather feedback

### Week 3: Refinement
- Fix issues from integration
- Improve documentation
- Prepare Phase 2 RFC

### Future: Phase 2
- Build backend proxy
- Deploy to production
- Migrate from env vars to proxy

---

**Created:** October 4, 2025  
**Status:** 🟡 Proposal / Ready for Review  
**Priority:** 🔴 High (Blocks AI Chatbot Feature)  
**Complexity:** 🟢 Low (Phase 1) / 🟡 Medium (Phase 2)
