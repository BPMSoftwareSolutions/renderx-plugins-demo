# Host Configuration Service - Setup Guide

## Overview

The Host Configuration Service provides a secure way to manage API keys and configuration secrets for RenderX plugins. This guide covers setup for administrators, developers, and CI/CD environments.

## Table of Contents

- [Quick Start](#quick-start)
- [Local Development Setup](#local-development-setup)
- [CI/CD Setup (GitHub Actions)](#cicd-setup-github-actions)
- [Production Deployment](#production-deployment)
- [Supported Configuration Keys](#supported-configuration-keys)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### For Administrators

1. **Get an API Key** from your service provider (e.g., OpenAI)
2. **Set Environment Variable** before starting the application:
   ```bash
   export OPENAI_API_KEY="sk-your-api-key-here"
   export OPENAI_MODEL="gpt-3.5-turbo"  # Optional, defaults to gpt-3.5-turbo
   ```
3. **Start the Application**:
   ```bash
   npm run dev
   ```

### For Developers

1. **Create `.env.local`** file in the project root:
   ```bash
   # .env.local (DO NOT COMMIT THIS FILE)
   OPENAI_API_KEY=sk-your-api-key-here
   OPENAI_MODEL=gpt-4-turbo-preview
   ```

2. **Add to `.gitignore`** (already included):
   ```
   .env.local
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## Local Development Setup

### Step 1: Get API Keys

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. **Important**: Save it securely - you won't see it again!

### Step 2: Configure Environment Variables

#### Option A: Using `.env.local` (Recommended for Development)

Create a `.env.local` file in the project root:

```bash
# .env.local
# This file is gitignored and safe for local development

# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-3.5-turbo

# Future: Add other service keys as needed
# ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Security Notes:**
- ✅ `.env.local` is automatically gitignored
- ✅ Never commit API keys to version control
- ✅ Each developer should have their own API key
- ⚠️ Keys are visible in bundled JavaScript (dev only)

#### Option B: Using System Environment Variables

**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY="sk-your-api-key-here"
$env:OPENAI_MODEL="gpt-3.5-turbo"
npm run dev
```

**Windows (Command Prompt):**
```cmd
set OPENAI_API_KEY=sk-your-api-key-here
set OPENAI_MODEL=gpt-3.5-turbo
npm run dev
```

**macOS/Linux (Bash/Zsh):**
```bash
export OPENAI_API_KEY="sk-your-api-key-here"
export OPENAI_MODEL="gpt-3.5-turbo"
npm run dev
```

### Step 3: Verify Configuration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open browser console and check:
   ```javascript
   // Should return true if configured
   window.RenderX.config.has('OPENAI_API_KEY')
   
   // Should return the model name
   window.RenderX.config.get('OPENAI_MODEL')
   ```

3. **Security Check**: The API key value should NOT be visible in:
   - Browser console logs
   - DOM/HTML source
   - Network tab (unless making API calls)

---

## CI/CD Setup (GitHub Actions)

### Step 1: Add GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

   | Name | Value | Description |
   |------|-------|-------------|
   | `OPENAI_API_KEY` | `sk-...` | Your OpenAI API key |
   | `OPENAI_MODEL` | `gpt-3.5-turbo` | (Optional) Model to use |

### Step 2: Update GitHub Actions Workflow

Your workflow should already be configured, but verify it includes:

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          OPENAI_MODEL: ${{ secrets.OPENAI_MODEL }}
        run: npm test
      
      - name: Run E2E tests
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          OPENAI_MODEL: ${{ secrets.OPENAI_MODEL }}
        run: npm run e2e
```

### Step 3: Verify CI Configuration

1. Push a commit to trigger the workflow
2. Check the Actions tab on GitHub
3. Verify tests pass with configuration service

---

## Production Deployment

### ⚠️ Security Warning

**Phase 1 (Current)**: Environment variables are bundled into JavaScript
- ✅ Acceptable for E2E/CI with spending limits
- ⚠️ Keys are visible in bundled code
- ❌ NOT recommended for production with real user data

**Phase 2 (Recommended for Production)**: Backend Proxy
- ✅ Keys never sent to browser
- ✅ Centralized rate limiting
- ✅ Usage monitoring and analytics
- ✅ Per-user spending limits

### Phase 1 Deployment (Current)

If you must deploy with Phase 1:

1. **Set Environment Variables** on your hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Build & Deploy → Environment
   - AWS: Lambda environment variables
   - Docker: Use `--env` flag or `.env` file

2. **Set Spending Limits** on OpenAI:
   - Go to [OpenAI Usage Limits](https://platform.openai.com/account/limits)
   - Set monthly spending limit (e.g., $10)
   - Enable email alerts

3. **Monitor Usage**:
   - Check [OpenAI Usage Dashboard](https://platform.openai.com/usage)
   - Set up alerts for unusual activity

### Phase 2 Deployment (Recommended)

For production, implement a backend proxy:

```
Plugin → Host Config → Backend Proxy → OpenAI API
```

See `docs/CONFIG_SERVICE_BACKEND_PROXY.md` for implementation guide.

---

## Supported Configuration Keys

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `OPENAI_API_KEY` | `string` | `undefined` | OpenAI API key (starts with `sk-`) |
| `OPENAI_MODEL` | `string` | `gpt-3.5-turbo` | OpenAI model to use |
| `ANTHROPIC_API_KEY` | `string` | `undefined` | (Future) Anthropic Claude API key |

### Adding New Configuration Keys

1. **Update `vite.config.js`**:
   ```javascript
   define: {
     '__CONFIG_OPENAI_API_KEY__': JSON.stringify(process.env.OPENAI_API_KEY || ''),
     '__CONFIG_NEW_KEY__': JSON.stringify(process.env.NEW_KEY || ''),
   }
   ```

2. **Update `src/index.tsx`**:
   ```typescript
   declare const __CONFIG_NEW_KEY__: string | undefined;
   
   // In window.RenderX.config.get():
   case 'NEW_KEY':
     return typeof __CONFIG_NEW_KEY__ !== 'undefined' 
       ? __CONFIG_NEW_KEY__ 
       : undefined;
   ```

3. **Update Documentation**: Add to this file and `CONFIG_SERVICE_API.md`

---

## Troubleshooting

### Issue: `window.RenderX.config` is undefined

**Cause**: Application not fully initialized

**Solution**:
```javascript
// Wait for RenderX to be ready
window.addEventListener('renderx:ready', () => {
  console.log('Config available:', window.RenderX.config.has('OPENAI_API_KEY'));
});
```

### Issue: `config.has('OPENAI_API_KEY')` returns false

**Possible Causes**:
1. Environment variable not set
2. Environment variable is empty string
3. Vite not picking up `.env.local` changes

**Solutions**:
1. Verify environment variable is set:
   ```bash
   echo $OPENAI_API_KEY  # macOS/Linux
   echo %OPENAI_API_KEY%  # Windows CMD
   $env:OPENAI_API_KEY    # Windows PowerShell
   ```

2. Restart development server after changing `.env.local`

3. Check Vite is loading environment variables:
   ```javascript
   // In browser console
   console.log(import.meta.env)
   ```

### Issue: API key visible in browser

**Expected Behavior**: In Phase 1, keys ARE visible in bundled JavaScript

**Mitigation**:
- Use spending limits on OpenAI
- Rotate keys regularly
- Upgrade to Phase 2 (backend proxy) for production

### Issue: Tests failing in CI

**Possible Causes**:
1. GitHub Secrets not configured
2. Secrets not passed to workflow
3. Test environment not loading config

**Solutions**:
1. Verify secrets are set in GitHub repository settings
2. Check workflow YAML includes `env:` section
3. Review test logs for configuration errors

---

## Best Practices

### ✅ Do

- Use `.env.local` for local development
- Set spending limits on API providers
- Rotate API keys regularly (every 90 days)
- Use separate keys for dev/staging/production
- Monitor API usage and costs
- Implement backend proxy for production

### ❌ Don't

- Commit API keys to version control
- Share API keys between developers
- Use production keys in development
- Expose keys in client-side code (production)
- Ignore spending alerts
- Log API keys to console

---

## Next Steps

- **For Plugin Developers**: See `docs/CONFIG_SERVICE_API.md`
- **For Security Review**: See `docs/CONFIG_SERVICE_SECURITY.md`
- **For Backend Proxy**: See `docs/CONFIG_SERVICE_BACKEND_PROXY.md`

---

## Support

- **Issues**: [GitHub Issues](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/issues)
- **Documentation**: `docs/` directory
- **Security Concerns**: Contact security@bpmsoftwaresolutions.com

