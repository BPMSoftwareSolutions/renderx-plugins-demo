# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [1.4.5] - 2025-09-17

### Fixed

- Removed JSON import assertion (`assert { type: 'json' }`) in `MusicalConductor.ts` to prevent `SyntaxError: Unexpected identifier 'assert'` when importing the package in certain ESM/test environments (e.g., Vitest / Node.js 22) that treat `assert` keyword differently during parsing.
- Replaced with safe runtime `require` of `package.json` wrapped in try/catch for broader compatibility.

### Notes

- No runtime API changes. Pure compatibility patch.

## [1.4.4]

- Previous release.
