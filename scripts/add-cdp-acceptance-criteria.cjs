/**
 * Script to add acceptance criteria to all beats in CDP musical sequence
 * Uses Given/When/Then format based on beat content
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../docs/prototypes/CDP/cdp-musical-sequence.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Generate acceptance criteria based on beat content
function generateAcceptanceCriteria(beat, movement) {
  const name = beat.name;
  const fullDesc = beat.data?.fullDescription || beat.description || '';
  const persona = beat.userStory?.persona || 'team member';
  const activity = movement.name.toLowerCase();
  
  // Extract key concepts from description
  const concepts = extractConcepts(fullDesc, name);
  
  return [{
    given: [
      `the ${persona} is performing ${activity} activities`,
      `the team has access to necessary tools and environments`
    ],
    when: [
      `${name.toLowerCase()} practices are implemented`,
      concepts.action
    ],
    then: [
      concepts.outcome,
      `the practice is documented and repeatable`,
      `progress is measurable and visible`
    ]
  }];
}

function extractConcepts(desc, name) {
  const descLower = desc.toLowerCase();
  const nameLower = name.toLowerCase();
  
  // Default values
  let action = 'the defined process is followed';
  let outcome = 'the expected outcomes are achieved';
  
  // Architecture-related
  if (nameLower.includes('architect') || descLower.includes('architect')) {
    if (descLower.includes('release') || descLower.includes('releasab')) {
      action = 'the architecture supports multiple release strategies';
      outcome = 'components can be released independently based on business demand';
    } else if (descLower.includes('test')) {
      action = 'the system is designed with modular, testable components';
      outcome = 'continuous testing can be performed at all levels';
    } else if (descLower.includes('deploy')) {
      action = 'deployment mechanisms are decoupled from release decisions';
      outcome = 'features can be deployed to production without being released to users';
    } else if (descLower.includes('operation') || descLower.includes('telemetry')) {
      action = 'telemetry and logging capabilities are built into the solution';
      outcome = 'operational health can be monitored and issues can be quickly diagnosed';
    }
  }
  
  // Security-related
  if (descLower.includes('security') || descLower.includes('threat')) {
    action = 'security requirements are identified and documented';
    outcome = 'threats are mitigated through architectural decisions and NFRs';
  }
  
  // Collaboration/Research
  if (descLower.includes('collaborat') || descLower.includes('stakeholder')) {
    action = 'stakeholders are engaged in the discovery process';
    outcome = 'a shared understanding of customer needs is established';
  }
  if (descLower.includes('research') || descLower.includes('market')) {
    action = 'market research activities are conducted systematically';
    outcome = 'insights inform product decisions and backlog prioritization';
  }
  
  // Vision/Strategy
  if (descLower.includes('vision') || descLower.includes('roadmap')) {
    action = 'the vision is communicated to all stakeholders';
    outcome = 'teams are aligned on strategic direction and priorities';
  }
  
  // Backlog/Prioritization
  if (descLower.includes('backlog') || descLower.includes('priorit')) {
    action = 'backlog items are evaluated against business value criteria';
    outcome = 'the backlog reflects current priorities and is ready for planning';
  }
  
  // Testing
  if (descLower.includes('test') && !nameLower.includes('architect')) {
    if (descLower.includes('automat')) {
      action = 'automated tests are created and maintained';
      outcome = 'test results provide rapid feedback on code quality';
    } else if (descLower.includes('end-to-end') || descLower.includes('e2e')) {
      action = 'end-to-end test scenarios are executed';
      outcome = 'system behavior is validated across all integration points';
    } else {
      action = 'test coverage meets defined quality standards';
      outcome = 'defects are identified early in the development cycle';
    }
  }
  
  // Build/CI
  if (descLower.includes('build') || descLower.includes('continuous integration')) {
    action = 'code changes trigger automated build pipelines';
    outcome = 'build artifacts are produced consistently and reliably';
  }
  if (descLower.includes('version control') || descLower.includes('trunk')) {
    action = 'code is committed to the main branch frequently';
    outcome = 'integration issues are detected and resolved quickly';
  }
  
  // Deploy/CD
  if (descLower.includes('deploy') && !nameLower.includes('architect')) {
    if (descLower.includes('automat')) {
      action = 'deployment automation is configured and tested';
      outcome = 'deployments are executed without manual intervention';
    } else if (descLower.includes('environment')) {
      action = 'target environments are provisioned and configured';
      outcome = 'deployments are consistent across all environments';
    } else {
      action = 'deployment procedures are executed';
      outcome = 'changes are deployed safely to production';
    }
  }
  
  // Feature flags/toggles
  if (descLower.includes('feature') && (descLower.includes('flag') || descLower.includes('toggle'))) {
    action = 'feature flags control the visibility of new functionality';
    outcome = 'features can be enabled or disabled without code changes';
  }
  
  // Monitoring/Observability
  if (descLower.includes('monitor') || descLower.includes('observ')) {
    action = 'monitoring dashboards and alerts are configured';
    outcome = 'system health and performance are continuously tracked';
  }
  
  // Incident/Response
  if (descLower.includes('incident') || descLower.includes('respond') || descLower.includes('recovery')) {
    action = 'incident response procedures are followed';
    outcome = 'issues are resolved with minimal impact to users';
  }
  
  // Release
  if (descLower.includes('release') && !nameLower.includes('architect')) {
    if (descLower.includes('dark') || descLower.includes('canary')) {
      action = 'progressive release strategies are employed';
      outcome = 'risk is minimized through controlled feature exposure';
    } else {
      action = 'release criteria are verified before go-live';
      outcome = 'releases deliver value to customers reliably';
    }
  }
  
  // Learning/Improvement
  if (descLower.includes('learn') || descLower.includes('improv') || descLower.includes('retrospect')) {
    action = 'feedback and metrics are analyzed';
    outcome = 'actionable improvements are identified and implemented';
  }
  
  // Hypothesis/Experiment
  if (descLower.includes('hypothes') || descLower.includes('experiment') || descLower.includes('mvp')) {
    action = 'hypotheses are formulated with measurable outcomes';
    outcome = 'experiments validate or invalidate assumptions quickly';
  }
  
  return { action, outcome };
}

// Add acceptance criteria to all beats
data.movements.forEach(movement => {
  movement.beats.forEach(beat => {
    beat.acceptanceCriteria = generateAcceptanceCriteria(beat, movement);
  });
});

// Write updated file
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('Added acceptance criteria to all beats');
console.log(`Total beats updated: ${data.movements.reduce((sum, m) => sum + m.beats.length, 0)}`);

