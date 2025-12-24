# RenderX Plugins Demo

A **thin-client host application** showcasing the RenderX plugin architecture. This demo provides a lightweight shell with manifest-driven plugin loading and orchestrated via the MusicalConductor engine.

## Overview

This repository is organized as a **monorepo** that consolidates all RenderX architecture components and dependencies. This structure:

- **Simplifies Development**: All code in one place, easier to make cross-cutting changes
- **Unifies Versioning**: Coordinate releases across all packages
- **Shares Tooling**: Single ESLint, TypeScript, and test configuration
- **Accelerates CI/CD**: Build and test all packages together

### Repository Contents

- **Host Application**: A minimal host app that initializes the RenderX plugin system
- **Packages**: Core infrastructure and plugins (see `packages/` directory)
- **Example Plugins**: Sandbox for testing orchestration flows, UI extension, and manifest-driven panel slots

For detailed monorepo development guidelines, see [MONOREPO.md](./MONOREPO.md).

## Related Resources

Check out these supporting projects for more detail on the underlying architecture:

- **MusicalConductor** — the orchestration engine powering plugin coordination (symphonies, movements, beats):
  https://github.com/BPMSoftwareSolutions/MusicalConductor/blob/main/README.md

- **renderx-plugins** — core utilities, base interfaces, and manifest schema for RenderX-compatible plugins:
  https://github.com/BPMSoftwareSolutions/renderx-plugins/blob/main/README.md

## 📊 Domain Registry Overview

> **Auto-generated on 2025-12-24T21:06:30.167Z**
> This section is automatically maintained. To update: `npm run generate:readme`

**Total Domains**: 31 (28 active, 1 deprecated, 1 experimental)

### By Type
- orchestration: 23
- capability: 7
- workflow: 1

### By Ownership
- **Platform-Orchestration**: 17 domains
- **RenderX-Web**: 6 domains
- **Platform-Infrastructure**: 4 domains
- **Platform-Observability**: 1 domains
- **Platform-DevEx**: 1 domains
- **Platform Reliability**: 1 domains
- **Platform Observability**: 1 domains

### 🎼 Key Orchestration Domains

- **[orchestration-core](.generated/analysis/orchestration-core-rich-markdown-2025-12-04T00-28-24-587Z.md)** (529 handlers, 73.44% coverage, 87.5% conformity)
- **[build-pipeline-orchestration](.generated/analysis/build-pipeline-orchestration-rich-markdown-2025-12-04T00-28-24-587Z.md)** (529 handlers, 83.4% coverage, 87.5% conformity)
- **[renderx-web-orchestration](.generated/analysis/renderx-web/renderx-web-orchestration-rich-markdown.md)** (285 handlers, 77.26% coverage, 87.5% conformity)
- **[renderx-web-acs.generated](#)**: Auto-generated acceptance criteria, one per handler
- **[graphing-orchestration](.generated/analysis/graphing-orchestration-rich-markdown-2025-12-04T00-28-24-587Z.md)** (529 handlers, 74.94% coverage, 87.5% conformity): Orchestration domain: graphing-orchestration
- **[self_sequences](.generated/analysis/self_sequences-rich-markdown-2025-12-04T00-28-24-587Z.md)** (529 handlers, 72.1% coverage, 87.5% conformity): Orchestration domain: self_sequences
- **[musical-conductor-orchestration](.generated/analysis/musical-conductor-orchestration-rich-markdown-2025-12-04T00-28-24-587Z.md)** (529 handlers, 74.49% coverage, 87.5% conformity): High-level orchestration flow governing score loading, execution, adaptive dynamics, and session finalization for the musical-conductor subsystem.
- **[cag-agent-workflow](.generated/analysis/cag-agent-workflow-rich-markdown-2025-12-04T00-28-24-587Z.md)** (529 handlers, 82.56% coverage, 87.5% conformity): Complete workflow for an agent operating within the Context-Augmented Generation system. Captures complete context for every workload.


<details>
<summary>View all 23 orchestration domains</summary>

- **orchestration-core**: No description
- **build-pipeline-orchestration**: No description
- **renderx-web-orchestration**: No description
- **renderx-web-acs.generated**: Auto-generated acceptance criteria, one per handler
- **graphing-orchestration**: Orchestration domain: graphing-orchestration
- **self_sequences**: Orchestration domain: self_sequences
- **musical-conductor-orchestration**: High-level orchestration flow governing score loading, execution, adaptive dynamics, and session finalization for the musical-conductor subsystem.
- **cag-agent-workflow**: Complete workflow for an agent operating within the Context-Augmented Generation system. Captures complete context for every workload.
- **orchestration-audit-session**: Complete workflow for building JSON-first orchestration audit system with auto-generated documentation and diagrams
- **orchestration-audit-system**: System-level evolution sequence capturing anti-drift governance workflow for the orchestration audit system itself (meta orchestration).
- **safe-continuous-delivery-pipeline**: Master orchestrator implementing Scaled Agile Framework (SAFe) for continuous delivery. Coordinates all development team activities from idea to production.
- **symphony-report-pipeline**: Six-movement orchestration for generating comprehensive reports from symphony pipeline executions, metrics, and conformity audits.
- **renderx-web-ac-alignment-workflow**: Fractal workflow to implement and operationalize alignment between structured acceptance criteria (GWT) and automated tests for the renderx-web-orchestration domain.
- **renderx-web-ac-alignment-workflow-v2**: Fractal workflow to implement and operationalize alignment between structured acceptance criteria (GWT) and automated tests for the renderx-web-orchestration domain (v2).
- **ac-to-test-alignment.workflow.v3**: Fractal workflow to implement and operationalize alignment between structured acceptance criteria (GWT) and automated tests for the renderx-web-orchestration domain (v3).
- **product-owner-signoff-demo**: Gating orchestration for product owner validation and feature sign-off. Conducts guided demos in staging environment before production deployment.
- **build-pipeline-symphony**: DEPRECATED: Superseded by build-pipeline-orchestration. Legacy multi-movement orchestration for comprehensive, traceable, auditable build process with validation, package building, host building, artifact management, and verification.
- **symphonia-conformity-alignment-pipeline**: Three-movement orchestration for automated detection and remediation of orchestration architecture violations across domain definitions, sequences, and handlers.
- **architecture-governance-enforcement-symphony**: Multi-movement orchestration that enforces JSON as single source of truth through systematic validation, implementation verification, and auditability across the entire system.
- **symphonic-code-analysis-pipeline**: Multi-movement orchestration for comprehensive code analysis of symphonic orchestration codebases, measuring code metrics per beat, test coverage, complexity, and architectural conformity.
- **fractal-orchestration-domain-symphony**: Didactic orchestration that encodes the recursive pattern where orchestrated domains become systems and systems become domains in a fractal architecture.
- **symphonic-code-analysis-demo**: Demo and review gate for symphonic code analysis results. Presents analysis findings, metrics trends, and architectural conformity to stakeholders for review and approval before publication.
- **orchestration-registry-audit-pipeline**: Audit orchestration to validate that all registered orchestration domains have both JSON authority files and npm scripts defined. Produces completeness reports and governance compliance verification.
</details>


### ⚙️ Infrastructure Domains

- **host-sdk-infrastructure**: Core Host SDK providing the plugin hosting environment, manifest management, and integration APIs for all UI components
- **manifest-tools-infrastructure**: Manifest generation and validation tools for orchestration domain definitions, sequence specifications, and plugin registrations
- **components-library-infrastructure**: Foundational component library providing base UI components and utility wrappers for all RenderX plugins
- **digital-assets-infrastructure**: Asset management system for icons, themes, branding, and static resources used across all UI plugins

### 🔧 Capability Domains

**3 capability domains** providing UI features, plugin sequences, and user interactions.

- **self-healing**: Self-Healing capability domain
- **slo-dashboard**: SLO Dashboard capability domain
- **real-estate-analyzer-search-symphony**: Plugin sequence: Real Estate Analyzer Search

### 📈 Analysis Status

- **22** orchestration domains have analysis configuration
- **Latest Validation**: 2025-12-24T21:06:29.823Z
- **Analysis Reports**: [View all](.generated/analysis/)

## 📚 Documentation

### Core Documentation
- [Monorepo Guidelines](./MONOREPO.md)
- [Knowledge Layers Architecture](./KNOWLEDGE_LAYERS_ARCHITECTURE.md)
- [Complete Knowledge System Index](./COMPLETE_KNOWLEDGE_SYSTEM_INDEX.md)
- [Project Knowledge Query Guide](./PROJECT_KNOWLEDGE_QUERY_GUIDE.md)

### Governance & Tooling
- **Governance Tooling Registry**: `docs/governance/tools-registry.json`
- **Generated Registry Docs**: Auto-generated via `npm run generate:governance:registry`
- **Validation**: `npm run validate:governance:registry`

### Related Projects
- [MusicalConductor](https://github.com/BPMSoftwareSolutions/MusicalConductor/blob/main/README.md) - The orchestration engine powering plugin coordination (symphonies, movements, beats)
- [renderx-plugins](https://github.com/BPMSoftwareSolutions/renderx-plugins/blob/main/README.md) - Core utilities, base interfaces, and manifest schema for RenderX-compatible plugins

---

## 🧪 Testing & Quality

```bash
# Run all tests
npm test

# Generate test coverage
npm run test:coverage

# Run domain validation
npm run validate:domains

# Comprehensive audit
npm run audit:full
```

---

## 📦 Packages

This monorepo contains the following packages:

- `@renderx/host-sdk - Host SDK for plugin integration`
- `@renderx/musical-conductor - Orchestration engine`
- `@renderx/components - Shared UI components`
- `@renderx/manifest-tools - Manifest generation tools`
- `...and more in `packages/``

---

## 🔍 Domain Analysis

To analyze a specific domain:

```bash
# Analyze single domain
node scripts/analyze-domain.cjs <domain-id>

# Analyze all domains
node scripts/analyze-all-domains.cjs

# View analysis results
ls .generated/analysis/
```

---

## 🤝 Contributing

This is a demo repository showcasing the RenderX plugin architecture. For contribution guidelines, please see the main [renderx-plugins](https://github.com/BPMSoftwareSolutions/renderx-plugins) repository.

---

## 🔄 Auto-Generation

This README is automatically generated from:
- `DOMAIN_REGISTRY.json` - Single source of truth for all metadata
- `.generated/analysis/**` - Code analysis reports
- Domain analysis configuration

**Last Generated**: 2025-12-24T21:06:30.167Z

To update this README, run:
```bash
npm run generate:readme
```
