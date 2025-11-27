#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const registryPath = path.join(__dirname, '../orchestration-domains.json');

// Load registry
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));

// Wildcard and keyword matching utilities
const matchWildcard = (str, pattern) => {
  const regex = pattern
    .split('*').map(p => p.replace(/[.+^${}()|[\]\\]/g, '\\$&')).join('.*');
  return new RegExp(`^${regex}$`, 'i').test(str);
};

const matchKeywords = (text, keywords) => {
  return keywords.every(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
};

const filterDomains = (filter) => {
  return registry.domains.filter(d => {
    if (filter.category && d.category !== filter.category) return false;
    if (filter.status && d.status !== filter.status) return false;
    
    if (filter.wildcard) {
      if (!matchWildcard(d.id, filter.wildcard)) return false;
    }
    
    if (filter.keywords && filter.keywords.length > 0) {
      const searchText = `${d.id} ${d.name || ''} ${d.description || ''}`;
      if (!matchKeywords(searchText, filter.keywords)) return false;
    }
    
    return true;
  });
};

const commands = {
  list: (...args) => {
    const filter = parseFilterArgs(args);
    const results = filterDomains(filter);
    
    const label = filter.wildcard || filter.keywords?.join(' ') ? 
      `matching "${filter.wildcard || filter.keywords.join(' ')}"` : '';
    console.log(`\n📋 Registered Domains ${label}(${results.length} total)\n`);
    
    results.forEach(d => {
      const status = d.status || 'active';
      const icon = status === 'active' ? '✅' : '⏳';
      const hierarchy = d.parent ? ` ↳ [parent: ${d.parent}]` : '';
      const catIcon = d.category === 'orchestration' ? '🎭' : '🔌';
      console.log(`${icon} ${catIcon} ${d.id}${hierarchy}`);
      if (d.description) console.log(`   ${d.description}`);
      
      // Show tools/scripts
      if (d.npmScripts) {
        const scripts = typeof d.npmScripts === 'string' 
          ? d.npmScripts.split(',').map(s => s.trim())
          : Array.isArray(d.npmScripts) ? d.npmScripts : [d.npmScripts];
        if (scripts.length > 0) {
          console.log(`   🔧 Tools: ${scripts.join(', ')}`);
        }
      }
    });
  },

  search: (query, ...args) => {
    if (!query) {
      console.log('❌ Search requires a query\n');
      return;
    }
    
    const filter = parseFilterArgs([query, ...args]);
    const results = filterDomains(filter);
    
    console.log(`\n🔍 Search results for "${query}" (${results.length} found)\n`);
    results.forEach(d => {
      const catIcon = d.category === 'orchestration' ? '🎭' : '🔌';
      console.log(`✓ ${catIcon} ${d.id}`);
      if (d.name) console.log(`  Name: ${d.name}`);
      if (d.description) console.log(`  ${d.description}`);
      if (d.category) console.log(`  Category: ${d.category}`);
      
      // Show tools/scripts
      if (d.npmScripts) {
        const scripts = typeof d.npmScripts === 'string' 
          ? d.npmScripts.split(',').map(s => s.trim())
          : Array.isArray(d.npmScripts) ? d.npmScripts : [d.npmScripts];
        if (scripts.length > 0) {
          console.log(`  🔧 Tools: ${scripts.join(', ')}`);
        }
      }
    });
  },

  show: (id) => {
    if (!id) {
      console.log('❌ Show requires a domain ID\n');
      return;
    }
    const domain = registry.domains.find(d => d.id === id);
    if (!domain) {
      console.log(`\n❌ Domain "${id}" not found\n`);
      return;
    }
    console.log(`\n📌 Domain: ${domain.id}\n`);
    
    // Show category and hierarchy info
    if (domain.category) {
      const catIcon = domain.category === 'orchestration' ? '🎭' : '🔌';
      console.log(`${catIcon} Category: ${domain.category}`);
    }
    
    if (domain.parent) {
      const parentDomain = registry.domains.find(d => d.id === domain.parent);
      console.log(`📍 Hierarchy:`);
      console.log(`   Parent: ${domain.parent}${parentDomain ? ` (${parentDomain.name})` : ''}`);
    }
    const children = registry.domains.filter(d => d.parent === domain.id);
    if (children.length > 0) {
      console.log(`   Children: ${children.map(c => c.id).join(', ')}`);
    }
    if (domain.parent || children.length > 0) console.log();
    
    // Show tools/scripts prominently
    if (domain.npmScripts) {
      const scripts = typeof domain.npmScripts === 'string' 
        ? domain.npmScripts.split(',').map(s => s.trim())
        : Array.isArray(domain.npmScripts) ? domain.npmScripts : [domain.npmScripts];
      if (scripts.length > 0) {
        console.log(`🔧 Tools (${scripts.length}):`);
        scripts.forEach(script => console.log(`   • npm run ${script}`));
        console.log();
      }
    }
    
    Object.entries(domain).forEach(([key, value]) => {
      if (key === 'parent' || key === 'npmScripts' || key === 'category') return; // Already shown above
      if (key === 'movements' && Array.isArray(value)) {
        console.log(`${key}: ${value.length} items`);
      } else if (typeof value === 'object') {
        console.log(`${key}:`, JSON.stringify(value, null, 2));
      } else {
        console.log(`${key}: ${value}`);
      }
    });
  },

  filter: (...args) => {
    const filter = parseFilterArgs(args);
    const results = filterDomains(filter);
    
    console.log(`\n🔎 Filtered Results (${results.length} found)\n`);
    if (Object.keys(filter).length > 0) {
      console.log('Filters applied:');
      if (filter.wildcard) console.log(`  Wildcard: ${filter.wildcard}`);
      if (filter.keywords?.length) console.log(`  Keywords: ${filter.keywords.join(', ')}`);
      if (filter.category) console.log(`  Category: ${filter.category}`);
      if (filter.status) console.log(`  Status: ${filter.status}`);
      console.log('');
    }
    
    results.forEach(d => {
      const icon = d.category === 'orchestration' ? '🎭' : '🔌';
      const status = d.status === 'active' ? '✅' : '⏳';
      console.log(`${icon} ${status} ${d.id}`);
      if (d.description) console.log(`   ${d.description}`);
      if (d.movements) console.log(`   Movements: ${d.movements}`);
      
      // Show tools/scripts
      if (d.npmScripts) {
        const scripts = typeof d.npmScripts === 'string' 
          ? d.npmScripts.split(',').map(s => s.trim())
          : Array.isArray(d.npmScripts) ? d.npmScripts : [d.npmScripts];
        if (scripts.length > 0) {
          console.log(`   🔧 Tools: ${scripts.join(', ')}`);
        }
      }
    });
  },

  stats: (...args) => {
    const filter = args.length > 0 ? parseFilterArgs(args) : {};
    const results = args.length > 0 ? filterDomains(filter) : registry.domains;
    
    const active = results.filter(d => d.status !== 'planned').length;
    const planned = results.filter(d => d.status === 'planned').length;
    const categories = new Map();
    results.forEach(d => {
      const cat = d.category || 'unknown';
      categories.set(cat, (categories.get(cat) || 0) + 1);
    });
    
    const orchestrations = results.filter(d => d.category === 'orchestration');
    const topLevelOrch = orchestrations.filter(d => !d.parent);
    const subDomains = results.filter(d => d.parent);
    
    const totalScripts = orchestrations.reduce((sum, d) => {
      if (d.npmScripts) {
        return sum + d.npmScripts.split(',').length;
      }
      return sum;
    }, 0);
    
    console.log(`\n📊 Registry Statistics\n`);
    console.log(`Total domains: ${results.length}`);
    console.log(`Active: ${active}`);
    console.log(`Planned: ${planned}`);
    if (orchestrations.length > 0) {
      console.log(`Orchestrations: ${orchestrations.length}`);
      console.log(`  ↳ Top-level: ${topLevelOrch.length}`);
      console.log(`  ↳ Sub-domains: ${orchestrations.filter(d => d.parent).length}`);
      console.log(`Total NPM Scripts: ${totalScripts}`);
    }
    if (subDomains.length > 0) {
      console.log(`Total sub-domains: ${subDomains.length}`);
    }
    console.log(`\nBy category:`);
    categories.forEach((count, cat) => console.log(`  ${cat}: ${count}`));
  },

  help: () => {
    console.log(`
📚 Domain Query Tool with Wildcards & Keywords

Usage: node scripts/query-domains.js [command] [options]

Commands:
  list [filter...]          List domains with optional filters
  search <query> [filter]   Search domains by name or description
  show <id>                 Show details of a specific domain
  filter [filters...]       Advanced filtering with multiple options
  stats [filter...]         Show registry statistics
  help                      Show this help message

Filter Options:
  --wildcard=<pattern>      Match domain ID with wildcard (e.g., --wildcard=*symphony*)
  --keyword=<word>          Match domain or description by keyword
  --category=<cat>          Filter by category (orchestration or plugin)
  --status=<status>         Filter by status (active or planned)

Examples:
  # List all domains
  npm run query:domains -- list

  # Search for orchestration domains
  npm run query:domains -- search orchestration

  # Filter by wildcard pattern
  npm run query:domains -- list --wildcard=*symphony*
  npm run query:domains -- list --wildcard=build*

  # Filter by keywords (all must match)
  npm run query:domains -- list --keyword=code --keyword=analysis

  # Combine filters
  npm run query:domains -- list --category=orchestration --status=active

  # Advanced filtering
  npm run query:domains -- filter --wildcard=*pipeline* --category=orchestration

  # Get stats for matching domains
  npm run query:domains -- stats --category=orchestration

  # Show specific domain
  npm run query:domains -- show build-pipeline-symphony

  # Complex example: all active orchestration domains with "conformity" in name
  npm run query:domains -- filter --wildcard=*conformity* --category=orchestration --status=active

  # Show domain with hierarchy info
  npm run query:domains -- show build-pipeline-symphony

  # List all children of a domain
  npm run query:domains -- children safe-continuous-delivery-pipeline

  # Show hierarchical tree of all domains
  npm run query:domains -- tree
    `);
  },

  children: (parentId) => {
    if (!parentId) {
      console.log('❌ Children requires a parent domain ID\n');
      return;
    }
    const parent = registry.domains.find(d => d.id === parentId);
    if (!parent) {
      console.log(`\n❌ Parent domain "${parentId}" not found\n`);
      return;
    }
    const children = registry.domains.filter(d => d.parent === parentId);
    console.log(`\n👨‍👧‍👦 Children of "${parentId}" (${children.length} total)\n`);
    if (children.length === 0) {
      console.log('  (no children)');
      return;
    }
    children.forEach(c => {
      const status = c.status === 'active' ? '✅' : '⏳';
      console.log(`  ${status} ${c.id}`);
      if (c.name) console.log(`     Name: ${c.name}`);
      if (c.description) {
        const desc = c.description.substring(0, 80);
        console.log(`     ${desc}${c.description.length > 80 ? '...' : ''}`);
      }
    });
  },

  tree: () => {
    console.log(`\n🌳 Domain Hierarchy Tree\n`);
    
    // Find all top-level domains (no parent)
    const topLevel = registry.domains.filter(d => !d.parent);
    
    const indent = (level) => '  '.repeat(level);
    
    const printTree = (domain, level = 0) => {
      const emoji = domain.category === 'orchestration' ? '🎭' : '🔌';
      console.log(`${indent(level)}${emoji} ${domain.id}`);
      
      // Find and print children
      const children = registry.domains.filter(d => d.parent === domain.id);
      children.forEach(child => {
        printTree(child, level + 1);
      });
    };
    
    topLevel.forEach(domain => {
      printTree(domain);
    });
    
    // Show any orphaned domains with missing parents
    const allDomainIds = new Set(registry.domains.map(d => d.id));
    const orphaned = registry.domains.filter(d => d.parent && !allDomainIds.has(d.parent));
    if (orphaned.length > 0) {
      console.log(`\n⚠️  Orphaned domains (parent not found):`);
      orphaned.forEach(d => {
        const emoji = d.category === 'orchestration' ? '🎭' : '🔌';
        console.log(`  ${emoji} ${d.id} (parent: ${d.parent})`);
      });
    }
  }
};

const parseFilterArgs = (args) => {
  const filter = {};
  
  args.forEach(arg => {
    if (arg.startsWith('--wildcard=')) {
      filter.wildcard = arg.split('=')[1];
    } else if (arg.startsWith('--keyword=')) {
      if (!filter.keywords) filter.keywords = [];
      filter.keywords.push(arg.split('=')[1]);
    } else if (arg.startsWith('--category=')) {
      filter.category = arg.split('=')[1];
    } else if (arg.startsWith('--status=')) {
      filter.status = arg.split('=')[1];
    } else if (!arg.startsWith('--')) {
      // First positional arg is treated as wildcard if no wildcard specified
      if (!filter.wildcard && !filter.keywords) {
        filter.wildcard = `*${arg}*`;
      }
    }
  });
  
  return filter;
};

const [cmd, ...args] = process.argv.slice(2);
const command = cmd || 'help';

if (command in commands) {
  commands[command](...args);
} else {
  console.log(`❌ Unknown command: ${command}\n`);
  commands.help();
}
