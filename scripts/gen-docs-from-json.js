#!/usr/bin/env node

/**
 * 📄 Generate Documentation from JSON
 * 
 * Generates all documentation from JSON sources.
 * JSON is authority. Markdown is reflection.
 * 
 * Usage:
 *   node scripts/gen-docs-from-json.js
 *   node scripts/gen-docs-from-json.js --doc "cag-system-overview"
 *   node scripts/gen-docs-from-json.js --verify
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

class DocGenerator {
  constructor() {
    this.docIndex = null;
    this.generatedDocs = [];
    this.verificationResults = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  /**
   * Load DOC_INDEX.json
   */
  loadDocIndex() {
    console.log('\n📚 Loading DOC_INDEX.json...');
    
    const indexPath = path.join(ROOT, 'DOC_INDEX.json');
    this.docIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    
    console.log(`✅ DOC_INDEX loaded`);
    console.log(`   • Docs: ${this.docIndex.docs.length}`);
    console.log(`   • Roles: ${Object.keys(this.docIndex.docRoles).length}`);
    console.log(`   • Templates: ${Object.keys(this.docIndex.templates).length}`);
    
    return this;
  }

  /**
   * Compute hash of JSON sources
   */
  computeSourceHash(sourceFiles) {
    console.log(`   Computing source hash for ${sourceFiles.length} files...`);
    
    let combined = '';
    for (const file of sourceFiles) {
      const filePath = path.join(ROOT, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        combined += content;
      }
    }

    const hash = crypto.createHash('sha256').update(combined).digest('hex');
    return hash.substring(0, 16);
  }

  /**
   * Generate context envelope for a doc
   */
  generateContextEnvelope(docDef) {
    const rcPath = path.join(ROOT, 'root-context.json');
    const rc = JSON.parse(fs.readFileSync(rcPath, 'utf-8'));

    return {
      rootContext: {
        goal: rc.rootGoal,
        principles: rc.principles
      },
      subContext: {
        docId: docDef.id,
        role: docDef.role,
        audience: docDef.audience
      },
      boundaries: docDef.context.boundaries,
      generation: {
        timestamp: new Date().toISOString(),
        sourceHash: this.computeSourceHash(docDef.sourceJson)
      }
    };
  }

  /**
   * Generate a single document
   */
  generateDoc(docDef) {
    console.log(`\n📝 Generating: ${docDef.title}`);
    
    const contextEnvelope = this.generateContextEnvelope(docDef);
    const sourceHash = contextEnvelope.generation.sourceHash;

    // Build markdown content
    let markdown = '';

    // Add context block
    markdown += `> **Context**\n`;
    markdown += `> Root Goal: *${contextEnvelope.rootContext.goal}*\n`;
    markdown += `> Role: \`${docDef.role}\`\n`;
    markdown += `> Audience: ${docDef.audience.join(', ')}\n`;
    markdown += `> In Scope: ${docDef.context.boundaries.inScopeTags.join(', ')}\n`;
    markdown += `> Out of Scope: ${docDef.context.boundaries.outOfScopeTags.join(', ')}\n`;
    markdown += `> Source Hash: \`${sourceHash}\`\n\n`;

    // Add generated warning
    markdown += `> ⚠️ **DO NOT EDIT — GENERATED**\n`;
    markdown += `> This document is generated from JSON sources.\n`;
    markdown += `> Modify the JSON and regenerate.\n\n`;

    // Add title
    markdown += `# ${docDef.title}\n\n`;

    // Add description
    markdown += `${docDef.description}\n\n`;

    // Add role-specific content
    markdown += this.generateRoleContent(docDef, contextEnvelope);

    // Add section map
    if (docDef.sectionMap && docDef.sectionMap.length > 0) {
      markdown += `\n## Section Map\n\n`;
      markdown += `| Section | JSON Source | Doc Anchors |\n`;
      markdown += `|---------|-------------|-------------|\n`;
      for (const section of docDef.sectionMap) {
        markdown += `| ${section.sectionId} | ${section.jsonSource} | ${section.docAnchors.join(', ')} |\n`;
      }
      markdown += `\n`;
    }

    // Add metadata footer
    markdown += `\n---\n\n`;
    markdown += `**Generated:** ${new Date().toISOString()}\n`;
    markdown += `**Source Hash:** \`${sourceHash}\`\n`;
    markdown += `**Role:** \`${docDef.role}\`\n`;

    // Determine output path
    const outputPath = path.join(ROOT, 'docs', 'generated', `${docDef.id}.md`);
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, markdown);

    console.log(`✅ Generated: ${outputPath}`);
    console.log(`   • Role: ${docDef.role}`);
    console.log(`   • Audience: ${docDef.audience.join(', ')}`);
    console.log(`   • Source Hash: ${sourceHash}`);

    this.generatedDocs.push({
      id: docDef.id,
      path: outputPath,
      sourceHash: sourceHash,
      role: docDef.role
    });

    return this;
  }

  /**
   * Generate role-specific content
   */
  generateRoleContent(docDef, contextEnvelope) {
    let content = '';

    switch (docDef.role) {
      case 'narrative-core':
        content += `## Overview\n\n`;
        content += `This document provides a high-level conceptual overview of ${docDef.title.toLowerCase()}.\n\n`;
        content += `### Key Concepts\n\n`;
        for (const tag of docDef.context.boundaries.inScopeTags) {
          content += `- **${tag}**: In scope for this document\n`;
        }
        content += `\n`;
        break;

      case 'operational-guide':
        content += `## Quick Start\n\n`;
        content += `Follow these steps to use this guide:\n\n`;
        content += `1. Understand the context above\n`;
        content += `2. Follow the procedures below\n`;
        content += `3. Verify results\n\n`;
        break;

      case 'spec-view':
        content += `## Specification\n\n`;
        content += `This is a human-readable view of the specification.\n\n`;
        content += `### Requirements\n\n`;
        for (const tag of docDef.context.boundaries.inScopeTags) {
          content += `- ${tag}\n`;
        }
        content += `\n`;
        break;

      case 'agent-brief':
        content += `## Instructions\n\n`;
        content += `**Audience:** Agents only\n\n`;
        content += `**Constraints:**\n`;
        if (docDef.generation.constraints) {
          content += `- Max Length: ${docDef.generation.constraints.maxLength} chars\n`;
          content += `- Style: ${docDef.generation.constraints.style}\n`;
          content += `- Machine Readable: ${docDef.generation.constraints.machineReadable}\n`;
        }
        content += `\n`;
        break;
    }

    return content;
  }

  /**
   * Verify generated docs
   */
  verifyDocs() {
    console.log('\n✅ Verifying generated documentation...');
    
    for (const docDef of this.docIndex.docs) {
      const outputPath = path.join(ROOT, 'docs', 'generated', `${docDef.id}.md`);
      
      if (!fs.existsSync(outputPath)) {
        this.verificationResults.failed.push({
          docId: docDef.id,
          reason: 'Generated file not found'
        });
        continue;
      }

      const currentHash = this.computeSourceHash(docDef.sourceJson);
      const storedHash = docDef.generation.lastGeneratedFromHash;

      if (currentHash !== storedHash) {
        this.verificationResults.warnings.push({
          docId: docDef.id,
          reason: 'Source JSON has changed since last generation',
          currentHash: currentHash,
          storedHash: storedHash
        });
      } else {
        this.verificationResults.passed.push({
          docId: docDef.id,
          status: 'verified'
        });
      }
    }

    console.log(`\n📊 Verification Results:`);
    console.log(`   ✅ Passed: ${this.verificationResults.passed.length}`);
    console.log(`   ⚠️ Warnings: ${this.verificationResults.warnings.length}`);
    console.log(`   ❌ Failed: ${this.verificationResults.failed.length}`);

    return this;
  }

  /**
   * Display summary
   */
  display() {
    console.log('\n' + '═'.repeat(70));
    console.log('📄 DOCUMENTATION GENERATION - COMPLETE');
    console.log('═'.repeat(70));
    
    console.log(`\n📝 Generated Docs: ${this.generatedDocs.length}`);
    for (const doc of this.generatedDocs) {
      console.log(`   ✅ ${doc.id} (${doc.role})`);
    }

    console.log(`\n📊 Verification:`);
    console.log(`   ✅ Passed: ${this.verificationResults.passed.length}`);
    console.log(`   ⚠️ Warnings: ${this.verificationResults.warnings.length}`);
    console.log(`   ❌ Failed: ${this.verificationResults.failed.length}`);

    console.log('\n' + '═'.repeat(70));
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    options[key] = value;
  }

  try {
    const generator = new DocGenerator();
    
    generator.loadDocIndex();

    if (options.verify) {
      generator.verifyDocs();
    } else {
      // Generate all docs
      for (const docDef of generator.docIndex.docs) {
        if (!options.doc || options.doc === docDef.id) {
          generator.generateDoc(docDef);
        }
      }
    }

    generator.display();

    console.log('\n✅ Documentation generation complete.\n');
  } catch (error) {
    console.error(`\n❌ Documentation generation failed: ${error.message}\n`);
    process.exit(1);
  }
}

main();

