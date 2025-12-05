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

// Discover all sequence files from all packages
function discoverSequenceFiles() {
  const allFiles = [];
  const packagesDir = path.join(__dirname, '../packages');

  const packages = [
    'canvas-component',
    'control-panel',
    'header',
    'library',
    'library-component',
    'orchestration',
    'real-estate-analyzer',
    'self-healing',
    'slo-dashboard'
  ];

  for (const pkg of packages) {
    const seqDir = path.join(packagesDir, pkg, 'json-sequences');
    if (fs.existsSync(seqDir)) {
      // Recursively find all .json files
      function walkDir(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walkDir(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.json') &&
                     entry.name !== 'index.json' && entry.name !== 'rules.config.json') {
            allFiles.push(fullPath);
          }
        }
      }
      walkDir(seqDir);
    }
  }

  return allFiles;
}

const files = discoverSequenceFiles();
console.log(`Processing ${files.length} sequence files from all packages\n`);

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

