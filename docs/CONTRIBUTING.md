# Contributing to RenderX Plugins Demo

Thank you for your interest in contributing to the RenderX Plugins Demo! This document provides guidelines for contributing to this monorepo.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Message Standards](#commit-message-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Monorepo Guidelines](#monorepo-guidelines)

## Code of Conduct

Please be respectful and constructive in all interactions with other contributors.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/renderx-plugins-demo.git
   cd renderx-plugins-demo
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/BPMSoftwareSolutions/renderx-plugins-demo.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```

## Development Workflow

### Creating a Feature Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feat/your-feature-name
```

### Branch Naming Conventions

- `feat/` - New features
- `fix/` - Bug fixes
- `chore/` - Maintenance tasks
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

### Making Changes

1. **Make your changes** in the appropriate package or host code
2. **Run tests** to ensure nothing breaks:
   ```bash
   npm test
   ```
3. **Run linting** to check code style:
   ```bash
   npm run lint
   ```
4. **Build packages** if you modified any:
   ```bash
   npm run build:packages
   ```

## Commit Message Standards

Follow the conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding or updating tests
- `chore`: Changes to build process, dependencies, etc.

### Scope

The scope should specify which package or area is affected:
- `host-sdk`
- `manifest-tools`
- `canvas`
- `control-panel`
- etc.

### Examples

```
feat(canvas): add support for SVG rotation
fix(control-panel): resolve CSS class binding issue
docs(monorepo): update development guidelines
```

## Testing Requirements

### Before Submitting a PR

1. **Run all tests**:
   ```bash
   npm test
   ```

2. **Run package tests**:
   ```bash
   npm run packages:test
   ```

3. **Run linting**:
   ```bash
   npm run lint
   ```

4. **Build everything**:
   ```bash
   npm run build:all
   ```

### Writing Tests

- Write unit tests for new features
- Update existing tests when modifying behavior
- Aim for >80% code coverage
- Use descriptive test names

## Pull Request Process

1. **Push your branch** to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Reference to related issue (e.g., "Fixes #123")
   - Description of changes and rationale
   - Any breaking changes clearly noted

3. **Ensure CI passes**:
   - All tests pass
   - Linting passes
   - Build succeeds

4. **Request review** from maintainers

5. **Address feedback** and push updates

6. **Merge** once approved

## Monorepo Guidelines

### Working with Packages

- Each package in `packages/` is independently versioned
- Use `workspace:*` protocol for internal dependencies
- Build packages before testing: `npm run build:packages`
- Update package versions following semantic versioning

### Adding a New Package

See [MONOREPO.md - Adding New Packages](./MONOREPO.md#adding-new-packages) for detailed instructions.

### Dependency Management

- Use `npm install` to add dependencies (not manual editing)
- Keep dependencies minimal and well-justified
- Prefer workspace dependencies for internal packages
- Document why external dependencies are needed

### Cross-Package Changes

When making changes that affect multiple packages:

1. Update all affected packages
2. Run full test suite: `npm test`
3. Verify builds: `npm run build:all`
4. Document breaking changes in commit message

## Questions?

- Check [MONOREPO.md](./MONOREPO.md) for development guidelines
- Review [GitHub Issues](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/issues)
- Consult [Architecture Documentation](./docs/renderx-plugins-demo-adf.json)
- Read [ADRs](./docs/adr/) for architectural decisions

Thank you for contributing!

