/**
 * Reformat canvas component sequence user stories to match CDP format
 *
 * CDP format:
 * - persona: concise role (e.g., "System Architect", "Product Owner")
 * - goal: concise action (e.g., "implement X", "enable Y")
 * - benefit: concise outcome (e.g., "improve performance", "reduce errors")
 *
 * Reformats at three levels: root, movement, and beat
 */

const fs = require('fs');
const path = require('path');

const sequencesDir = path.join(__dirname, '../packages/canvas-component/json-sequences/canvas-component');

// Helper function to reformat a user story object
function reformatUserStory(us) {
  if (!us || typeof us !== 'object') return false;

  const originalGoal = us.goal;
  const originalBenefit = us.benefit;

  // Extract concise goal from verbose narrative
  let goal = us.goal || '';

  // Remove "As a/an ... I want/need" prefix
  goal = goal.replace(/^As\s+(?:a|an)\s+[^,]+,?\s+I\s+(?:want|need)\s+/i, '');

  // Remove backticks and handler name prefix (e.g., "`resolveTemplate` to")
  goal = goal.replace(/^`[^`]+`\s+to\s+/i, '');
  goal = goal.replace(/^[A-Z][a-zA-Z]+\s+to\s+/i, '');

  // Remove "so that" clause and everything after
  goal = goal.split(/\s+so\s+that\s+/i)[0];

  // Remove trailing "." and clean up
  goal = goal.trim().replace(/\.$/, '');

  // Lowercase first letter for consistency with CDP
  goal = goal.charAt(0).toLowerCase() + goal.slice(1);

  // Extract concise benefit
  let benefit = us.benefit || '';

  // Remove verbose prefixes
  benefit = benefit.replace(/^Enables?\s+/i, '');
  benefit = benefit.replace(/^Improves?\s+/i, '');
  benefit = benefit.replace(/^Ensures?\s+/i, '');

  // Take first sentence only
  benefit = benefit.split(/[.;]/)[0].trim();

  // Lowercase first letter for consistency with CDP
  benefit = benefit.charAt(0).toLowerCase() + benefit.slice(1);

  if (goal !== originalGoal || benefit !== originalBenefit) {
    us.goal = goal;
    us.benefit = benefit;
    return true;
  }
  return false;
}

// Get all .json files except index.json and rules.config.json
const files = fs.readdirSync(sequencesDir)
  .filter(f => f.endsWith('.json') && f !== 'index.json' && f !== 'rules.config.json')
  .map(f => path.join(sequencesDir, f));

console.log(`Processing ${files.length} sequence files\n`);

let fixed = 0;

for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    let modified = false;

    // Convert and reformat root-level userStory
    if (typeof data.userStory === 'string') {
      data.userStory = {
        persona: data.persona || 'system operator',
        goal: data.userStory,
        benefit: data.businessValue || ''
      };
      modified = true;
    }
    if (reformatUserStory(data.userStory)) {
      modified = true;
    }

    // Process movements and beats
    for (const movement of data.movements || []) {
      // Convert and reformat movement-level userStory
      if (typeof movement.userStory === 'string') {
        movement.userStory = {
          persona: movement.persona || data.persona || 'system operator',
          goal: movement.userStory,
          benefit: movement.businessValue || data.businessValue || ''
        };
        modified = true;
      }
      if (reformatUserStory(movement.userStory)) {
        modified = true;
      }

      // Convert and reformat beat-level userStory
      for (const beat of movement.beats || []) {
        if (typeof beat.userStory === 'string') {
          beat.userStory = {
            persona: beat.persona || movement.persona || data.persona || 'system operator',
            goal: beat.userStory,
            benefit: beat.businessValue || movement.businessValue || data.businessValue || ''
          };
          modified = true;
        }
        if (reformatUserStory(beat.userStory)) {
          modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
      fixed++;
      console.log(`✓ Reformatted: ${path.basename(file)}`);
    }
  } catch (err) {
    console.log(`✗ Error in ${path.basename(file)}: ${err.message}`);
  }
}

console.log(`\nDone! Reformatted: ${fixed}`);

