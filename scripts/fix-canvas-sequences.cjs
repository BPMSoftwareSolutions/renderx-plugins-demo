/**
 * Fix canvas component sequence files to conform to musical-sequence.schema.json
 * 
 * Issues to fix:
 * 1. Convert string userStory to object with persona/goal/benefit
 * 2. Ensure all beats have required fields: event, userStory, acceptanceCriteria, testFile
 */

const fs = require('fs');
const path = require('path');

const sequencesDir = path.join(__dirname, '../packages/canvas-component/json-sequences/canvas-component');

// Get all .json files except index.json and rules.config.json
const files = fs.readdirSync(sequencesDir)
  .filter(f => f.endsWith('.json') && f !== 'index.json' && f !== 'rules.config.json')
  .map(f => path.join(sequencesDir, f));

console.log(`Found ${files.length} sequence files to process\n`);

let fixed = 0;
let errors = 0;

for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    let modified = false;

    // Fix root-level userStory if it's a string
    if (typeof data.userStory === 'string') {
      data.userStory = {
        persona: data.persona || 'system operator',
        goal: data.userStory,
        benefit: data.businessValue || ''
      };
      modified = true;
    }

    // Fix movement-level userStory
    for (const movement of data.movements || []) {
      if (typeof movement.userStory === 'string') {
        movement.userStory = {
          persona: movement.persona || data.persona || 'system operator',
          goal: movement.userStory,
          benefit: movement.businessValue || data.businessValue || ''
        };
        modified = true;
      }

      // Fix beat-level userStory
      for (const beat of movement.beats || []) {
        if (typeof beat.userStory === 'string') {
          beat.userStory = {
            persona: beat.persona || movement.persona || data.persona || 'system operator',
            goal: beat.userStory,
            benefit: beat.businessValue || movement.businessValue || data.businessValue || ''
          };
          modified = true;
        }

        // Ensure acceptanceCriteria is an array
        if (!Array.isArray(beat.acceptanceCriteria)) {
          beat.acceptanceCriteria = [];
          modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
      fixed++;
      console.log(`✓ Fixed: ${path.basename(file)}`);
    }
  } catch (err) {
    errors++;
    console.log(`✗ Error in ${path.basename(file)}: ${err.message}`);
  }
}

console.log(`\nDone! Fixed: ${fixed}, Errors: ${errors}`);

