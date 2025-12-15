# Contributing to @renderx-plugins/library-component

Thank you for your interest in contributing! This document provides guidelines for contributing to this package.

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/BPMSoftwareSolutions/renderx-plugin-library-component.git
   cd renderx-plugin-library-component
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

4. **Build the package:**
   ```bash
   npm run build
   ```

## Development Workflow

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the existing code style

3. **Add tests** for new functionality

4. **Run the test suite:**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

5. **Verify package contents:**
   ```bash
   npm run pack:verify
   ```

### Testing

- **Unit tests:** `npm test`
- **Watch mode:** `npm run test:watch`
- **Coverage:** `npm run test:coverage`
- **Linting:** `npm run lint`

### Code Style

- Follow existing TypeScript conventions
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**
4. **Update version** following semantic versioning
5. **Create a pull request** with a clear description

## Release Process

### Pre-releases (RC)
- Bump version to `x.y.z-rc.N`
- Push to main branch
- CI will automatically publish with `--tag rc`

### Stable releases
- Create a GitHub release with tag `vx.y.z`
- CI will automatically publish to npm

## Package Structure

```
├── src/                    # Source code
│   ├── index.ts           # Main entry point
│   └── symphonies/        # Symphony handlers
├── json-sequences/        # Sequence definitions
│   └── library-component/ # Component sequences
├── __tests__/             # Test files
├── dist/                  # Built output (generated)
└── .github/               # CI/CD workflows
```

## Questions?

Feel free to open an issue for any questions or concerns.
