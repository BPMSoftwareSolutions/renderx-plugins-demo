#!/usr/bin/env node
/**
 * JSON Authority CRUD Helper
 * Purpose: Safe add/update/delete/list operations on large JSON authority files (e.g., orchestration-domains.json).
 * Design Goals:
 *  - Minimize accidental wholesale rewrites (backs up original before write)
 *  - Support dry-run to preview changes
 *  - Allow patch-style updates (merge a small JSON fragment into target entry by id)
 *  - Produce integrity metadata (simple SHA256 of modified collection) for optional downstream validation
 *  - Avoid repository formatting churn: preserves original indentation if detectable, otherwise 2 spaces
 *
 * Usage Examples:
 *  List domain ids:
 *    node scripts/manage-json-authority.js --file orchestration-domains.json --collection domains --operation list --select id
 *  Add new item from file:
 *    node scripts/manage-json-authority.js --file orchestration-domains.json --collection domains --operation add --item-file new-domain.json
 *  Update existing item by id with patch fragment:
 *    node scripts/manage-json-authority.js --file orchestration-domains.json --collection domains --operation update --id cag-agent-workflow --patch '{"status":"deprecated"}'
 *  Delete item by id (dry run):
 *    node scripts/manage-json-authority.js --file orchestration-domains.json --collection domains --operation delete --id obsolete-id --dry-run
 *  Generate integrity summary only:
 *    node scripts/manage-json-authority.js --file orchestration-domains.json --collection domains --operation integrity
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.replace(/^--/, '');
      const next = args[i + 1];
      if (!next || next.startsWith('--')) {
        out[key] = true; // boolean flag
      } else {
        out[key] = next;
        i++;
      }
    }
  }
  return out;
}

function sha256(v) {
  return crypto.createHash('sha256').update(v).digest('hex');
}

function loadJson(file) {
  const content = fs.readFileSync(file, 'utf-8');
  try {
    return { data: JSON.parse(content), raw: content };
  } catch (e) {
    console.error(`❌ Failed to parse JSON: ${file}`);
    throw e;
  }
}

function detectIndent(raw) {
  // naive: find first line with leading spaces before a quote
  const lines = raw.split(/\r?\n/);
  for (const l of lines) {
    const m = l.match(/^(\s+)["']/);
    if (m) return m[1];
  }
  return '  ';
}

function backupOriginal(file) {
  const dir = path.join(path.dirname(file), '.generated', 'backups');
  fs.mkdirSync(dir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:]/g, '-');
  const target = path.join(dir, path.basename(file) + '.' + ts + '.bak');
  fs.copyFileSync(file, target);
  return target;
}

function writeJson(file, obj, indent) {
  const serialized = JSON.stringify(obj, null, indent.length) + '\n';
  fs.writeFileSync(file, serialized, 'utf-8');
}

function ensureCollection(root, collectionPath) {
  if (!(collectionPath in root)) {
    throw new Error(`Collection '${collectionPath}' not found at root of JSON authority.`);
  }
  if (!Array.isArray(root[collectionPath])) {
    throw new Error(`Collection '${collectionPath}' is not an array.`);
  }
  return root[collectionPath];
}

function mergePatch(target, patch) {
  // shallow + nested merge
  for (const k of Object.keys(patch)) {
    if (patch[k] && typeof patch[k] === 'object' && !Array.isArray(patch[k]) && typeof target[k] === 'object') {
      target[k] = mergePatch({ ...target[k] }, patch[k]);
    } else {
      target[k] = patch[k];
    }
  }
  return target;
}

function main() {
  const args = parseArgs();
  const file = path.resolve(process.cwd(), args.file || 'orchestration-domains.json');
  const collectionName = args.collection || 'domains';
  const op = args.operation;
  const idKey = args.idKey || 'id';
  const dryRun = !!args['dry-run'] || !!args.dryRun;
  if (!op) {
    console.error('❌ --operation required (list | add | update | delete | integrity)');
    process.exit(1);
  }
  const { data, raw } = loadJson(file);
  const indent = detectIndent(raw);
  const collection = ensureCollection(data, collectionName);

  if (op === 'list') {
    const select = args.select ? args.select.split(',') : [idKey];
    collection.forEach(item => {
      const row = select.map(k => `${k}=${JSON.stringify(item[k])}`).join(' ');
      console.log(row);
    });
    console.log(`\n✅ Listed ${collection.length} items from '${collectionName}'.`);
    return;
  }

  if (op === 'integrity') {
    const hashes = collection.map(i => sha256(JSON.stringify(i)));
    const aggregate = sha256(hashes.join('::'));
    console.log(JSON.stringify({
      file: path.basename(file),
      collection: collectionName,
      items: collection.length,
      itemHashes: hashes.slice(0, 5), // preview
      aggregateHash: aggregate
    }, null, 2));
    console.log('\n✅ Integrity summary generated (showing first 5 item hashes).');
    return;
  }

  if (op === 'add') {
    let newItem;
    if (args['item-file']) {
      const itemPath = path.resolve(process.cwd(), args['item-file']);
      newItem = JSON.parse(fs.readFileSync(itemPath, 'utf-8'));
    } else if (args.item) {
      newItem = JSON.parse(args.item);
    } else {
      console.error('❌ --item-file or --item JSON string required for add operation');
      process.exit(1);
    }
    if (!newItem[idKey]) {
      console.error(`❌ New item must include '${idKey}' field.`);
      process.exit(1);
    }
    if (collection.some(i => i[idKey] === newItem[idKey])) {
      console.error(`❌ Item with ${idKey}='${newItem[idKey]}' already exists.`);
      process.exit(1);
    }
    console.log(`➕ Will add item ${idKey}='${newItem[idKey]}' to ${collectionName}.`);
    if (dryRun) {
      console.log('💡 Dry run: no writes performed.');
      return;
    }
    const backup = backupOriginal(file);
    collection.push(newItem);
    writeJson(file, data, indent);
    console.log(`✅ Added item. Backup stored at ${backup}`);
    return;
  }

  if (op === 'update') {
    const targetId = args.id;
    if (!targetId) {
      console.error('❌ --id required for update operation');
      process.exit(1);
    }
    const target = collection.find(i => i[idKey] === targetId);
    if (!target) {
      console.error(`❌ No item found with ${idKey}='${targetId}'`);
      process.exit(1);
    }
    let patchObj;
    if (args['patch-file']) {
      patchObj = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), args['patch-file']), 'utf-8'));
    } else if (args.patch) {
      patchObj = JSON.parse(args.patch);
    } else {
      console.error('❌ --patch-file or --patch JSON string required for update');
      process.exit(1);
    }
    console.log(`✳️ Will patch item ${idKey}='${targetId}' with keys: ${Object.keys(patchObj).join(', ')}`);
    if (dryRun) {
      const mergedPreview = mergePatch({ ...target }, patchObj);
      console.log(JSON.stringify(mergedPreview, null, 2));
      console.log('💡 Dry run: no writes performed.');
      return;
    }
    const backup = backupOriginal(file);
    mergePatch(target, patchObj);
    writeJson(file, data, indent);
    console.log(`✅ Updated item. Backup stored at ${backup}`);
    return;
  }

  if (op === 'delete') {
    const targetId = args.id;
    if (!targetId) {
      console.error('❌ --id required for delete operation');
      process.exit(1);
    }
    const idx = collection.findIndex(i => i[idKey] === targetId);
    if (idx === -1) {
      console.error(`❌ No item found with ${idKey}='${targetId}'`);
      process.exit(1);
    }
    console.log(`🗑️ Will delete item ${idKey}='${targetId}' from ${collectionName}.`);
    if (dryRun) {
      console.log('💡 Dry run: no writes performed.');
      return;
    }
    const backup = backupOriginal(file);
    collection.splice(idx, 1);
    writeJson(file, data, indent);
    console.log(`✅ Deleted item. Backup stored at ${backup}`);
    return;
  }

  console.error(`❌ Unknown operation '${op}'.`);
  process.exit(1);
}

try {
  main();
} catch (e) {
  console.error('❌ Operation failed:', e.message);
  process.exit(1);
}
