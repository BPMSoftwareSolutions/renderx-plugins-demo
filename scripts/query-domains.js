#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const registryPath = path.join(__dirname, '../orchestration-domains.json');

// Load registry
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));

const commands = {
  list: () => {
    console.log(`\n📋 Registered Domains (${registry.domains.length} total)\n`);
    registry.domains.forEach(d => {
      const status = d.status || 'active';
      const icon = status === 'active' ? '✅' : '⏳';
      console.log(`${icon} ${d.id}`);
      if (d.description) console.log(`   ${d.description}`);
    });
  },

  search: (query) => {
    const q = query.toLowerCase();
    const results = registry.domains.filter(d => 
      d.id.toLowerCase().includes(q) || 
      (d.description && d.description.toLowerCase().includes(q))
    );
    console.log(`\n🔍 Search results for "${query}" (${results.length} found)\n`);
    results.forEach(d => {
      console.log(`✓ ${d.id}`);
      if (d.description) console.log(`  ${d.description}`);
    });
  },

  show: (id) => {
    const domain = registry.domains.find(d => d.id === id);
    if (!domain) {
      console.log(`\n❌ Domain "${id}" not found\n`);
      return;
    }
    console.log(`\n📌 Domain: ${domain.id}\n`);
    Object.entries(domain).forEach(([key, value]) => {
      if (key === 'movements' && Array.isArray(value)) {
        console.log(`${key}: ${value.length} items`);
      } else if (typeof value === 'object') {
        console.log(`${key}:`, JSON.stringify(value, null, 2));
      } else {
        console.log(`${key}: ${value}`);
      }
    });
  },

  stats: () => {
    const active = registry.domains.filter(d => d.status !== 'planned').length;
    const planned = registry.domains.filter(d => d.status === 'planned').length;
    const categories = new Map();
    registry.domains.forEach(d => {
      const cat = d.category || 'unknown';
      categories.set(cat, (categories.get(cat) || 0) + 1);
    });
    
    console.log(`\n📊 Registry Statistics\n`);
    console.log(`Total domains: ${registry.domains.length}`);
    console.log(`Active: ${active}`);
    console.log(`Planned: ${planned}`);
    console.log(`\nBy category:`);
    categories.forEach((count, cat) => console.log(`  ${cat}: ${count}`));
  },

  help: () => {
    console.log(`
📚 Domain Query Tool

Usage: node scripts/query-domains.js [command] [options]

Commands:
  list              List all registered domains
  search <query>    Search domains by name or description
  show <id>         Show details of a specific domain
  stats             Show registry statistics
  help              Show this help message

Examples:
  node scripts/query-domains.js list
  node scripts/query-domains.js search renderx
  node scripts/query-domains.js show renderx-web-orchestration
  node scripts/query-domains.js stats
    `);
  }
};

const [cmd, ...args] = process.argv.slice(2);
const command = cmd || 'help';

if (command in commands) {
  commands[command](...args);
} else {
  console.log(`❌ Unknown command: ${command}\n`);
  commands.help();
}
