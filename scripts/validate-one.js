#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import AjvModule from 'ajv';
import { fileURLToPath } from 'url';

const Ajv = (AjvModule && AjvModule.default) || AjvModule;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const SCHEMA_PATH = path.join(repoRoot, 'docs', 'schemas', 'musical-sequence.schema.json');

async function main(){
  const argv = process.argv.slice(2);
  if(argv.length === 0){
    console.error('Usage: node validate-one.js <relative-json-path>');
    process.exit(2);
  }
  const rel = argv[0];
  const file = path.resolve(repoRoot, rel);
  try{
    const [schemaRaw, fileRaw] = await Promise.all([
      fs.readFile(SCHEMA_PATH,'utf8'),
      fs.readFile(file,'utf8')
    ]);
    const schema = JSON.parse(schemaRaw);
    const obj = JSON.parse(fileRaw);
    const candidate = obj.musicalSequence && typeof obj.musicalSequence === 'object' ? obj.musicalSequence : obj;
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validate = ajv.compile(schema);
    const ok = validate(candidate);
    if(ok){
      console.log(`${rel}: VALID`);
      process.exit(0);
    } else {
      console.log(`${rel}: INVALID`);
      const errs = (validate.errors||[]).map(e=>({path: e.instancePath||e.dataPath||'(root)', message: e.message}));
      console.log(JSON.stringify(errs, null, 2));
      process.exit(1);
    }
  }catch(err){
    console.error('Error:', err.message);
    process.exit(2);
  }
}

main();
