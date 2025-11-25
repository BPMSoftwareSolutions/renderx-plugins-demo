#!/usr/bin/env node
/**
 * Validates docs/governance/tools-registry.json against the workspace state.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'docs', 'governance', 'tools-registry.json');
const PKG_PATH = path.join(ROOT, 'package.json');

const GOVERNANCE_SCRIPT_PATTERNS = [
  /^generate:governance:/,
  /^validate:governance:/,
  /^audit:/,
  /^regenerate:ographx/,
  /^generate:telemetry:/,
  /^telemetry:/,
  /^artifacts:/,
  /^public-api:/,
  /^verify:root-cleanliness$/,
  /^verify:no-drift$/,
  /^enforce:pipeline$/,
  /^recover:feature$/,
  /^generate:context:session$/,
  /^docs:verify$/
];

const TOOL_FILENAME_PREFIXES = [
  'generate',
  'gen-',
  'verify',
  'audit',
  'hash',
  'validate',
  'telemetry',
  'rag',
  'auto',
  'pre',
  'enforce',
  'check',
  'pipeline',
  'context',
  'cag',
  'regenerate',
  'analyze'
];

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function normalizeRel(relPath) {
  return relPath.replace(/\\/g, '/');
}

function isLikelyToolFile(filePath) {
  const base = path.basename(filePath);
  return TOOL_FILENAME_PREFIXES.some((prefix) => base.startsWith(prefix));
}

function extractScriptFiles(scriptCommand) {
  if (typeof scriptCommand !== 'string') {
    return [];
  }
  const matches = scriptCommand.matchAll(/(?:(?:scripts|packages)\/[\w./-]+\.(?:js|cjs|py))/g);
  const files = [];
  for (const match of matches) {
    const candidate = normalizeRel(match[0]);
    if (isLikelyToolFile(candidate)) {
      files.push(candidate);
    }
  }
  return files;
}

function collectGovernanceScriptFiles(pkgScripts) {
  const referenced = new Set();
  for (const [name, command] of Object.entries(pkgScripts)) {
    if (!GOVERNANCE_SCRIPT_PATTERNS.some((pattern) => pattern.test(name))) {
      continue;
    }
    for (const filePath of extractScriptFiles(command)) {
      referenced.add(filePath);
    }
  }
  return referenced;
}

function validateRegistryStructure(registry, pkgScripts) {
  const errors = [];
  const warnings = [];
  const registeredFiles = new Set();

  for (const [domainId, domain] of Object.entries(registry.domains || {})) {
    const tools = domain.tools || [];
    tools.forEach((tool) => {
      if (!tool.id) {
        errors.push(`Tool in domain "${domainId}" is missing an id.`);
      }
      if (!tool.file) {
        errors.push(`Tool "${tool.id}" in domain "${domainId}" is missing a file path.`);
        return;
      }
      if (!tool.domain) {
        errors.push(`Tool "${tool.id}" must declare its domain.`);
      } else if (tool.domain !== domainId) {
        errors.push(`Tool "${tool.id}" declares domain "${tool.domain}" but lives under "${domainId}".`);
      }

      const normalized = normalizeRel(tool.file);
      registeredFiles.add(normalized);
      const resolved = path.resolve(ROOT, normalized);
      if (!fs.existsSync(resolved)) {
        errors.push(`Tool "${tool.id}" references missing file: ${tool.file}`);
      }

      if (tool.commands?.npmScript) {
        const scriptName = tool.commands.npmScript;
        const scriptCommand = pkgScripts[scriptName];
        if (!scriptCommand) {
          errors.push(`Tool "${tool.id}" expects npm script "${scriptName}" but it does not exist.`);
        } else if (!scriptCommand.includes(tool.file) && !scriptCommand.includes(path.basename(tool.file))) {
          warnings.push(`npm script "${scriptName}" does not mention ${tool.file}.`);
        }
      }
    });
  }

  const referencedFiles = collectGovernanceScriptFiles(pkgScripts);
  for (const filePath of referencedFiles) {
    if (!registeredFiles.has(filePath)) {
      warnings.push(`Governance script references ${filePath} but it is not in tools-registry.json.`);
    }
  }

  return { errors, warnings };
}

function main() {
  try {
    const registry = loadJson(REGISTRY_PATH);
    const pkg = loadJson(PKG_PATH);
    const pkgScripts = pkg.scripts || {};
    const { errors, warnings } = validateRegistryStructure(registry, pkgScripts);

    warnings.forEach((msg) => console.warn(`⚠️  ${msg}`));

    if (errors.length) {
      errors.forEach((msg) => console.error(`❌ ${msg}`));
      console.error(`\nTools registry validation failed with ${errors.length} error(s).`);
      process.exit(1);
    }

    console.log('✅ tools-registry.json is valid.');
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }
}

main();
