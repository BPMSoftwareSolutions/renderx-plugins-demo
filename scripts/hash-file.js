#!/usr/bin/env node
import fs from 'fs';import crypto from 'crypto';
const file=process.argv[2];if(!file){console.error('Usage: node scripts/hash-file.js <filePath>');process.exit(1);}if(!fs.existsSync(file)){console.error('File not found',file);process.exit(1);}const raw=fs.readFileSync(file,'utf-8');const hash=crypto.createHash('sha256').update(raw).digest('hex');console.log(hash);