#!/usr/bin/env node

/**
 * Archive Search Index Generator
 * 
 * Purpose: Build full-text searchable index of archived documents with
 *          semantic tags, allowing agents to find information even when
 *          docs are archived
 * 
 * Generates: .generated/archive-search-index.json
 *   - Full-text search terms
 *   - Semantic topic mappings
 *   - Document relationships
 *   - Search suggestions
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ARCHIVE_INDEX_PATH = path.join(ROOT, '.generated/archived-documents-index.json');
const SEARCH_INDEX_PATH = path.join(ROOT, '.generated/archive-search-index.json');

// Extract searchable terms from document content
function extractSearchTerms(content) {
  // Get unique words (2+ chars), lowercase
  const words = content
    .toLowerCase()
    .match(/\b[a-z]{2,}\b/g) || [];
  
  // Count frequency
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Get top 50 most frequent meaningful words
  return Object.entries(frequency)
    .filter(([word]) => !isStopWord(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([word]) => word);
}

// Common stop words to exclude
function isStopWord(word) {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these',
    'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
    'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both',
    'as', 'if', 'so', 'than', 'then'
  ]);
  return stopWords.has(word);
}

// Build semantic topic graph
function buildTopicGraph(documents) {
  const topicGraph = {};

  // Collect all topics
  const allTopics = new Set();
  documents.forEach(doc => {
    doc.topics?.forEach(topic => allTopics.add(topic.toLowerCase()));
    doc.keywords?.forEach(kw => allTopics.add(kw.toLowerCase()));
  });

  // For each topic, find related documents
  allTopics.forEach(topic => {
    const related = documents.filter(doc => 
      doc.topics?.some(t => t.toLowerCase() === topic) ||
      doc.keywords?.some(k => k.toLowerCase() === topic)
    );

    if (related.length > 0) {
      topicGraph[topic] = {
        count: related.length,
        documents: related.map(d => ({
          filename: d.filename,
          title: d.title,
          relevance: calculateRelevance(d, topic)
        }))
      };
    }
  });

  return topicGraph;
}

// Calculate relevance score for a document to a topic
function calculateRelevance(doc, topic) {
  let score = 0;
  
  // Exact topic match: +10
  if (doc.topics?.some(t => t.toLowerCase() === topic)) score += 10;
  
  // Keyword match: +5
  if (doc.keywords?.some(k => k.toLowerCase() === topic)) score += 5;
  
  // Title contains topic: +3
  if (doc.title?.toLowerCase().includes(topic)) score += 3;
  
  return score;
}

// Generate search suggestions
function generateSearchSuggestions(documents, topicGraph) {
  const suggestions = {
    byCategory: {},
    byTopic: {},
    byKeyword: {}
  };

  // By category
  documents.forEach(doc => {
    if (!suggestions.byCategory[doc.category]) {
      suggestions.byCategory[doc.category] = [];
    }
    suggestions.byCategory[doc.category].push(doc.filename);
  });

  // By topic
  Object.entries(topicGraph).forEach(([topic, data]) => {
    suggestions.byTopic[topic] = data.documents.map(d => d.filename);
  });

  // By keyword (top 20 keywords)
  const keywordFreq = {};
  documents.forEach(doc => {
    doc.keywords?.forEach(kw => {
      keywordFreq[kw] = (keywordFreq[kw] || 0) + 1;
    });
  });

  Object.entries(keywordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([keyword, freq]) => {
      suggestions.byKeyword[keyword] = documents
        .filter(d => d.keywords?.includes(keyword))
        .map(d => d.filename);
    });

  return suggestions;
}

function buildSearchIndex() {
  console.log('🔍 Building archive search index...\n');

  if (!fs.existsSync(ARCHIVE_INDEX_PATH)) {
    console.error('❌ Archive index not found. Run archival first: npm run archive:documents');
    process.exit(1);
  }

  const archiveIndex = JSON.parse(fs.readFileSync(ARCHIVE_INDEX_PATH, 'utf-8'));
  const documents = archiveIndex.documents;

  console.log(`📊 Indexing ${documents.length} archived documents`);

  // Read original file content for full-text indexing (if in .archived)
  const searchIndex = {
    version: '1.0.0',
    builtAt: new Date().toISOString(),
    totalDocuments: documents.length,
    documents: [],
    topicGraph: {},
    searchSuggestions: {},
    statistics: {}
  };

  console.log('📝 Extracting search terms...');

  documents.forEach((doc, idx) => {
    try {
      const archivePath = path.join(ROOT, doc.archivePath);
      let searchTerms = [];

      // Extract search terms from actual file if it exists
      if (fs.existsSync(archivePath)) {
        const content = fs.readFileSync(archivePath, 'utf-8');
        searchTerms = extractSearchTerms(content);
      } else {
        // Fallback: use keywords and title
        searchTerms = [
          ...doc.keywords,
          ...doc.topics,
          ...doc.title.toLowerCase().split(/\s+/)
        ];
      }

      searchIndex.documents.push({
        filename: doc.filename,
        title: doc.title,
        archivePath: doc.archivePath,
        category: doc.category,
        searchTerms: Array.from(new Set(searchTerms)),
        keywords: doc.keywords,
        topics: doc.topics,
        metrics: doc.metrics,
        archivedDate: doc.archivedDate
      });

      if ((idx + 1) % 100 === 0) {
        console.log(`  ✓ Processed ${idx + 1}/${documents.length}`);
      }
    } catch (err) {
      console.warn(`⚠️  Error processing ${doc.filename}: ${err.message}`);
    }
  });

  console.log('\n🔗 Building topic graph...');
  searchIndex.topicGraph = buildTopicGraph(documents);

  console.log('💡 Generating search suggestions...');
  searchIndex.searchSuggestions = generateSearchSuggestions(documents, searchIndex.topicGraph);

  // Build statistics
  searchIndex.statistics = {
    averageWordCount: Math.round(
      documents.reduce((sum, d) => sum + (d.metrics?.wordCount || 0), 0) / documents.length
    ),
    documentsWithCodeBlocks: documents.filter(d => d.metrics?.codeBlocks > 0).length,
    documentsWithLinks: documents.filter(d => d.metrics?.externalLinks > 0).length,
    totalTopics: Object.keys(searchIndex.topicGraph).length,
    totalKeywords: new Set(documents.flatMap(d => d.keywords)).size
  };

  // Write search index
  fs.writeFileSync(SEARCH_INDEX_PATH, JSON.stringify(searchIndex, null, 2));
  console.log(`\n✅ Search index created: ${SEARCH_INDEX_PATH}`);

  // Print statistics
  console.log('\n📈 Search Index Statistics:');
  console.log(`  Total documents indexed: ${searchIndex.documents.length}`);
  console.log(`  Total topics identified: ${searchIndex.statistics.totalTopics}`);
  console.log(`  Total keywords: ${searchIndex.statistics.totalKeywords}`);
  console.log(`  Average document size: ${searchIndex.statistics.averageWordCount} words`);
  console.log(`  Documents with code: ${searchIndex.statistics.documentsWithCodeBlocks}`);
  console.log(`  Documents with links: ${searchIndex.statistics.documentsWithLinks}`);

  console.log('\n📑 Top Topics:');
  Object.entries(searchIndex.topicGraph)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .forEach(([topic, data]) => {
      console.log(`  - ${topic}: ${data.count} documents`);
    });

  return searchIndex;
}

try {
  buildSearchIndex();
  console.log('\n✅ Archive search index complete!');
} catch (err) {
  console.error('❌ Search index error:', err.message);
  process.exit(1);
}
