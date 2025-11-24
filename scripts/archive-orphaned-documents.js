#!/usr/bin/env node

/**
 * Archive Orphaned Documents System
 * 
 * Purpose: Move all orphaned/unclassified documents to .archived/ folder while
 *          preserving searchable metadata for future reference and retrieval
 * 
 * Process:
 *   1. Read document-governance-manifest.json to find all orphaned docs
 *   2. Extract metadata from each document (title, keywords, topics, summary)
 *   3. Move documents to .archived/{category}/ preserving original paths
 *   4. Generate archived-documents-index.json with full metadata
 *   5. Create ARCHIVE_INDEX.md for human browsing
 * 
 * Outputs:
 *   - .archived/{category}/{original-path} - Archived documents
 *   - .generated/archived-documents-index.json - Searchable index
 *   - .archived/ARCHIVE_INDEX.md - Human-readable archive catalog
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, '.generated/document-governance-manifest.json');
const DRIFT_AUDIT_PATH = path.join(ROOT, '.generated/documentation-drift-audit.json');
const ARCHIVE_INDEX_PATH = path.join(ROOT, '.generated/archived-documents-index.json');
const ARCHIVE_DIR = path.join(ROOT, '.archived');

// Extract metadata from document content
function extractMetadata(filename, filepath, content) {
  // Extract title (first # heading)
  const titleMatch = content.match(/^#+\s+(.+?)$/m);
  const title = titleMatch ? titleMatch[1].trim() : filename.replace(/\.md$/, '');

  // Extract first paragraph/summary (first ~200 chars of non-heading text)
  const paragraphMatch = content.match(/^#+.+?\n\n([\s\S]*?)(?:\n\n|\n#+|$)/);
  const summary = paragraphMatch 
    ? paragraphMatch[1].substring(0, 300).trim() + '...'
    : '';

  // Extract keywords from headers and code blocks
  const headers = content.match(/^#{1,6}\s+(.+?)$/gm) || [];
  const keywords = Array.from(new Set([
    ...headers.map(h => h.replace(/^#+\s+/, '').toLowerCase()),
    ...extractTopics(filename, content)
  ])).slice(0, 10);

  // Detect category from filename patterns
  const category = detectCategory(filename, filepath);

  // Count key metrics
  const wordCount = content.split(/\s+/).length;
  const codeBlocks = (content.match(/```/g) || []).length / 2;
  const links = (content.match(/\[.+?\]\(.+?\)/g) || []).length;
  const tables = (content.match(/\|.+?\|/g) || []).length / 2;

  return {
    title,
    summary,
    keywords,
    category,
    metrics: {
      wordCount,
      codeBlocks: Math.floor(codeBlocks),
      externalLinks: links,
      tables: Math.floor(tables)
    }
  };
}

// Detect document category from filename/path
function detectCategory(filename, filepath) {
  const lowerPath = filepath.toLowerCase();
  
  if (lowerPath.includes('readme')) return 'setup-guides';
  if (lowerPath.includes('architecture') || lowerPath.includes('design')) return 'architecture';
  if (lowerPath.includes('tutorial') || lowerPath.includes('guide') || lowerPath.includes('how-to')) return 'tutorials';
  if (lowerPath.includes('api') || lowerPath.includes('reference')) return 'api-reference';
  if (lowerPath.includes('test') || lowerPath.includes('spec')) return 'testing';
  if (lowerPath.includes('deploy') || lowerPath.includes('release') || lowerPath.includes('changelog')) return 'deployment';
  if (lowerPath.includes('issue') || lowerPath.includes('bug') || lowerPath.includes('fix')) return 'issue-tracking';
  if (lowerPath.includes('audit') || lowerPath.includes('report') || lowerPath.includes('analysis')) return 'reports';
  if (lowerPath.includes('dashboard') || lowerPath.includes('demo')) return 'dashboards';
  if (lowerPath.includes('bdd') || lowerPath.includes('feature') || lowerPath.includes('spec')) return 'specifications';
  
  return 'uncategorized';
}

// Extract topics/domains from content
function extractTopics(filename, content) {
  const topics = [];
  
  // Look for domain keywords
  const domainPatterns = [
    /orchestration/i, /audit/i, /telemetry/i, /governance/i,
    /plugin/i, /component/i, /api/i, /schema/i,
    /bdd/i, /test/i, /validation/i, /compliance/i,
    /dashboard/i, /ui/i, /react/i, /web/i,
    /performance/i, /scaling/i, /architecture/i,
    /deployment/i, /ci\/cd/i, /pipeline/i
  ];

  domainPatterns.forEach(pattern => {
    if (pattern.test(filename) || pattern.test(content.substring(0, 1000))) {
      topics.push(pattern.source.replace(/\\/g, ''));
    }
  });

  return topics;
}

// Archive documents
function archiveDocuments() {
  console.log('📦 Starting document archival process...\n');

  // Read manifest
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ Manifest not found. Run audit first: npm run audit:documentation:drift');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const orphanedDocs = manifest.documents.filter(d => d.generation_type === 'orphaned');

  console.log(`📋 Found ${orphanedDocs.length} orphaned documents to archive`);

  // Create archive directory structure
  if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
  }

  const archiveIndex = {
    version: '1.0.0',
    archivedAt: new Date().toISOString(),
    totalArchived: orphanedDocs.length,
    categories: {},
    documents: []
  };

  let archivedCount = 0;

  console.log('\n🔄 Archiving documents...');

  for (const doc of orphanedDocs) {
    try {
      const fullPath = path.join(ROOT, doc.filepath);
      
      if (!fs.existsSync(fullPath)) {
        console.warn(`⚠️  File not found: ${doc.filepath}`);
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      const metadata = extractMetadata(doc.filename, doc.filepath, content);

      // Create archive subdirectory for category
      const categoryDir = path.join(ARCHIVE_DIR, metadata.category);
      fs.mkdirSync(categoryDir, { recursive: true });

      // Create subdirectories to preserve original structure
      const archivePath = path.join(categoryDir, doc.filename);
      
      // Move file to archive
      fs.copyFileSync(fullPath, archivePath);
      
      // Add to index
      archiveIndex.documents.push({
        filename: doc.filename,
        originalPath: doc.filepath,
        archivePath: path.relative(ROOT, archivePath),
        category: metadata.category,
        title: metadata.title,
        summary: metadata.summary,
        keywords: metadata.keywords,
        topics: extractTopics(doc.filename, content),
        metrics: metadata.metrics,
        filesize: fs.statSync(archivePath).size,
        archivedDate: new Date().toISOString()
      });

      // Track categories
      if (!archiveIndex.categories[metadata.category]) {
        archiveIndex.categories[metadata.category] = 0;
      }
      archiveIndex.categories[metadata.category]++;

      archivedCount++;
      
      if (archivedCount % 50 === 0) {
        console.log(`  ✓ Archived ${archivedCount}/${orphanedDocs.length}`);
      }
    } catch (err) {
      console.warn(`⚠️  Error archiving ${doc.filename}: ${err.message}`);
    }
  }

  // Write archive index
  const indexPath = ARCHIVE_INDEX_PATH;
  fs.writeFileSync(indexPath, JSON.stringify(archiveIndex, null, 2));
  console.log(`\n✅ Archive index created: ${indexPath}`);

  // Generate summary
  console.log('\n📊 Archive Summary:');
  console.log(`  Total archived: ${archivedCount}`);
  console.log(`  Categories:`);
  Object.entries(archiveIndex.categories).forEach(([cat, count]) => {
    console.log(`    - ${cat}: ${count} documents`);
  });

  // Generate human-readable archive index
  generateArchiveIndexMarkdown(archiveIndex);

  return archiveIndex;
}

// Generate markdown index for human browsing
function generateArchiveIndexMarkdown(archiveIndex) {
  let md = `<!-- AUTO-GENERATED -->
<!-- Source: .generated/archived-documents-index.json -->
<!-- Generated: ${new Date().toISOString()} -->
<!-- DO NOT EDIT - Regenerate with: npm run archive:documents -->

# Document Archive Index

**Status**: All orphaned/unclassified documents archived  
**Archived At**: ${archiveIndex.archivedAt}  
**Total Documents**: ${archiveIndex.totalArchived}

---

## Overview

This archive contains ${archiveIndex.totalArchived} documents that were not part of the active documentation governance system. These documents are:

- ✅ Fully searchable via index
- ✅ Preserved with original metadata
- ✅ Organized by category for discovery
- ✅ Referenceable by agents and developers

## Categories

`;

  // List by category
  Object.entries(archiveIndex.categories).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    md += `### ${cat.replace(/-/g, ' ')} (${count} documents)\n\n`;
    
    const catDocs = archiveIndex.documents
      .filter(d => d.category === cat)
      .sort((a, b) => a.filename.localeCompare(b.filename));

    catDocs.slice(0, 10).forEach(doc => {
      md += `- **${doc.title}** (\`${doc.filename}\`)  \n`;
      md += `  Original: \`${doc.originalPath}\`  \n`;
      md += `  Keywords: ${doc.keywords.slice(0, 5).join(', ')}\n\n`;
    });

    if (catDocs.length > 10) {
      md += `... and ${catDocs.length - 10} more in ${cat}\n\n`;
    }
  });

  md += `---

## Finding Documents

### By Keyword
Use the searchable index at \`.generated/archived-documents-index.json\`:

\`\`\`bash
# Search for documents about "orchestration"
jq '.documents[] | select(.keywords[] | contains("orchestration"))' .generated/archived-documents-index.json
\`\`\`

### By Category
- \`setup-guides/\` - Setup, installation, getting started
- \`architecture/\` - Architecture decisions, design docs
- \`tutorials/\` - How-to guides and tutorials
- \`api-reference/\` - API documentation
- \`testing/\` - Test specs and coverage
- \`deployment/\` - Release notes, deployment guides
- \`issue-tracking/\` - Issue logs and bug reports
- \`reports/\` - Analysis and audit reports
- \`dashboards/\` - Demo dashboards and visualizations
- \`specifications/\` - BDD specs and requirements

### By File Properties
Each archived document has:
- **title**: Human-readable title
- **summary**: First 300 chars of content
- **keywords**: Extracted from headers and topics
- **topics**: Detected problem domains
- **metrics**: Word count, code blocks, links, tables

---

## Archival Status

All orphaned documents are now searchable through:

1. **Full Index** (\`.generated/archived-documents-index.json\`)
   - Machine-readable, complete metadata
   - Queryable by category, keywords, topics

2. **This Document** (\`.archived/ARCHIVE_INDEX.md\`)
   - Human-readable overview
   - Category listings with previews

3. **Original Files** (\`.archived/{category}/{filename}\`)
   - Full original content preserved
   - Readable for reference

---

## Querying the Archive

### Using jq

\`\`\`bash
# Find all documents about "test"
jq '.documents[] | select(.keywords[] | contains("test"))' .generated/archived-documents-index.json

# Find largest documents (most content)
jq '.documents | sort_by(.metrics.wordCount) | reverse | .[0:10]' .generated/archived-documents-index.json

# Find documents in a category
jq '.documents[] | select(.category == "architecture")' .generated/archived-documents-index.json
\`\`\`

### Using Node.js

\`\`\`javascript
const archiveIndex = require('./.generated/archived-documents-index.json');
const results = archiveIndex.documents.filter(d => 
  d.keywords.some(k => k.includes('governance'))
);
console.log(results);
\`\`\`

---

**Archive created: ${archiveIndex.archivedAt}**

<!-- DO NOT EDIT - Regenerate with: npm run archive:documents -->
`;

  const archiveMarkdownPath = path.join(ARCHIVE_DIR, 'ARCHIVE_INDEX.md');
  fs.writeFileSync(archiveMarkdownPath, md);
  console.log(`✅ Archive index markdown: ${archiveMarkdownPath}`);
}

// Run archival
try {
  const archiveIndex = archiveDocuments();
  console.log('\n✅ Document archival complete!');
} catch (err) {
  console.error('❌ Archival error:', err.message);
  process.exit(1);
}
