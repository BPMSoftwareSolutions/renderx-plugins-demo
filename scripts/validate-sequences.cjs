/**
 * Validate sequence JSON files against musical-sequence.schema.json
 */

const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../docs/schemas/musical-sequence.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const ajv = new Ajv({ allErrors: true, verbose: true });
const validate = ajv.compile(schema);

const files = process.argv.slice(2);

if (files.length === 0) {
  console.log('Usage: node validate-sequences.cjs <file1.json> [file2.json] ...');
  process.exit(1);
}

let allValid = true;

for (const file of files) {
  const filePath = path.resolve(file);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Validating: ${path.relative(process.cwd(), filePath)}`);
  console.log('='.repeat(60));
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const valid = validate(data);
    
    if (valid) {
      console.log('✅ VALID');
      console.log(`   - ${data.movements?.length || 0} movement(s)`);
      const totalBeats = data.movements?.reduce((sum, m) => sum + (m.beats?.length || 0), 0) || 0;
      console.log(`   - ${totalBeats} beat(s) total`);
    } else {
      allValid = false;
      console.log('❌ INVALID\n');
      
      for (const error of validate.errors) {
        console.log(`   Path: ${error.instancePath || '(root)'}`);
        console.log(`   Error: ${error.message}`);
        if (error.params) {
          console.log(`   Params: ${JSON.stringify(error.params)}`);
        }
        console.log('');
      }
    }
  } catch (err) {
    allValid = false;
    console.log(`❌ ERROR: ${err.message}`);
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(allValid ? '✅ All files valid' : '❌ Some files invalid');
process.exit(allValid ? 0 : 1);

