#!/usr/bin/env node

/**
 * Archive Search Query Tool
 * 
 * Purpose: Query archived documents by topic, keyword, category, or full-text
 * 
 * Usage:
 *   npm run search:archive -- --query "orchestration"
 *   npm run search:archive -- --category "architecture"
 *   npm run search:archive -- --topic "testing"
 *   npm run search:archive -- --keyword "configuration"
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SEARCH_INDEX_PATH = path.join(ROOT, '.generated/archive-search-index.json');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    query: null,
    category: null,
    topic: null,
    keyword: null,
    limit: 20
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--query' && args[i + 1]) result.query = args[i + 1];
    if (args[i] === '--category' && args[i + 1]) result.category = args[i + 1];
    if (args[i] === '--topic' && args[i + 1]) result.topic = args[i + 1];
    if (args[i] === '--keyword' && args[i + 1]) result.keyword = args[i + 1];
    if (args[i] === '--limit' && args[i + 1]) result.limit = parseInt(args[i + 1]);
  }

  return result;
}

// Search by query term
function searchByQuery(index, term, limit) {
  const query = term.toLowerCase();
  const results = [];

  index.documents.forEach(doc => {
    let score = 0;

    // Exact title match: +100
    if (doc.title.toLowerCase() === query) score += 100;

    // Title contains term: +50
    if (doc.title.toLowerCase().includes(query)) score += 50;

    // Search term match: +10 per match
    const matches = doc.searchTerms.filter(t => t.includes(query) || query.includes(t));
    score += matches.length * 10;

    // Keyword match: +5 per match
    const keywordMatches = doc.keywords.filter(k => k.toLowerCase().includes(query));
    score += keywordMatches.length * 5;

    if (score > 0) {
      results.push({
        filename: doc.filename,
        title: doc.title,
        category: doc.category,
        score,
        keywords: doc.keywords.slice(0, 3),
        topics: doc.topics.slice(0, 3)
      });
    }
  });

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Search by category
function searchByCategory(index, category, limit) {
  return index.documents
    .filter(doc => doc.category.toLowerCase() === category.toLowerCase())
    .map(doc => ({
      filename: doc.filename,
      title: doc.title,
      category: doc.category,
      keywords: doc.keywords.slice(0, 3),
      topics: doc.topics.slice(0, 3)
    }))
    .slice(0, limit);
}

// Search by topic
function searchByTopic(index, topic, limit) {
  const query = topic.toLowerCase();
  const topicData = index.topicGraph[query];

  if (!topicData) {
    return [];
  }

  return topicData.documents
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

// Search by keyword
function searchByKeyword(index, keyword, limit) {
  const query = keyword.toLowerCase();
  return index.documents
    .filter(doc => doc.keywords.some(k => k.toLowerCase().includes(query)))
    .map(doc => ({
      filename: doc.filename,
      title: doc.title,
      category: doc.category,
      keywords: doc.keywords.filter(k => k.toLowerCase().includes(query)),
      topics: doc.topics.slice(0, 3)
    }))
    .slice(0, limit);
}

// Format results for display
function displayResults(results, searchType, searchTerm) {
  if (results.length === 0) {
    console.log(`\n❌ No documents found for ${searchType}: "${searchTerm}"`);
    return;
  }

  console.log(`\n✅ Found ${results.length} documents (${searchType}: "${searchTerm}")\n`);

  results.forEach((result, idx) => {
    console.log(`${idx + 1}. ${result.title}`);
    console.log(`   📄 ${result.filename}`);
    console.log(`   📁 Category: ${result.category}`);
    
    if (result.keywords?.length > 0) {
      console.log(`   🏷️  Keywords: ${result.keywords.join(', ')}`);
    }
    
    if (result.topics?.length > 0) {
      console.log(`   📌 Topics: ${result.topics.join(', ')}`);
    }

    if (result.score) {
      console.log(`   ⭐ Relevance: ${result.score}`);
    }

    console.log();
  });
}

function runSearch() {
  const args = parseArgs();

  if (!fs.existsSync(SEARCH_INDEX_PATH)) {
    console.error('❌ Search index not found. Build it first: npm run generate:archive:search');
    process.exit(1);
  }

  const searchIndex = JSON.parse(fs.readFileSync(SEARCH_INDEX_PATH, 'utf-8'));

  if (args.query) {
    const results = searchByQuery(searchIndex, args.query, args.limit);
    displayResults(results, 'query', args.query);
  } else if (args.category) {
    const results = searchByCategory(searchIndex, args.category, args.limit);
    displayResults(results, 'category', args.category);
  } else if (args.topic) {
    const results = searchByTopic(searchIndex, args.topic, args.limit);
    displayResults(results, 'topic', args.topic);
  } else if (args.keyword) {
    const results = searchByKeyword(searchIndex, args.keyword, args.limit);
    displayResults(results, 'keyword', args.keyword);
  } else {
    // Show available search options
    console.log('\n📚 Archive Search Tool\n');
    console.log('Usage:');
    console.log('  npm run search:archive -- --query "term"     # Search by keyword/term');
    console.log('  npm run search:archive -- --category "name"  # Browse by category');
    console.log('  npm run search:archive -- --topic "name"     # Browse by topic');
    console.log('  npm run search:archive -- --keyword "word"   # Search by keyword');
    console.log('  npm run search:archive -- --limit 50         # Limit results (default: 20)\n');

    console.log('📊 Index Statistics:');
    console.log(`  Total documents: ${searchIndex.totalDocuments}`);
    console.log(`  Total topics: ${searchIndex.statistics.totalTopics}`);
    console.log(`  Total keywords: ${searchIndex.statistics.totalKeywords}\n`);

    console.log('🔝 Top Categories:');
    Object.entries(searchIndex.searchSuggestions.byCategory).forEach(([cat, docs]) => {
      console.log(`  - ${cat}: ${docs.length} documents`);
    });

    console.log('\n🔝 Top Topics:');
    Object.entries(searchIndex.topicGraph)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .forEach(([topic, data]) => {
        console.log(`  - ${topic}: ${data.count} documents`);
      });

    console.log('\n🔝 Top Keywords:');
    Object.entries(searchIndex.searchSuggestions.byKeyword)
      .slice(0, 10)
      .forEach(([keyword, docs]) => {
        console.log(`  - ${keyword}: ${docs.length} documents`);
      });
  }
}

try {
  runSearch();
} catch (err) {
  console.error('❌ Search error:', err.message);
  process.exit(1);
}
