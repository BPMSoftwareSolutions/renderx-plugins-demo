#!/usr/bin/env node

/**
 * Generate business-focused BDD specifications for self-healing system
 * 
 * Creates user stories and realistic scenarios from the end-user perspective:
 * - DevOps Engineer: wants to detect and fix production issues automatically
 * - Platform Team: wants to reduce MTTR and improve system reliability
 * - Engineering Manager: wants to track effectiveness and learn from incidents
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const USER_STORIES = {
  'telemetry': {
    persona: 'DevOps Engineer',
    story: 'I want to parse production logs to understand system behavior',
    goal: 'so that I can identify issues before they impact users',
    scenarios: [
      {
        title: 'Parse valid production logs',
        given: [
          'production logs exist in the .logs directory',
          'logs contain beat execution events with timestamps',
          'logs include both successful and failed handler executions'
        ],
        when: [
          'the telemetry parsing sequence is triggered',
          'with the correct logs directory path'
        ],
        then: [
          'all log files should be read successfully',
          'telemetry events should be extracted and normalized',
          'metrics should be aggregated (p95, p99, error rates)',
          'data should be stored for anomaly detection',
          'the system should report parsing completion'
        ]
      },
      {
        title: 'Handle missing or corrupted logs gracefully',
        given: [
          'some log files are missing or corrupted',
          'the logs directory exists but contains invalid data'
        ],
        when: [
          'the telemetry parsing sequence is triggered'
        ],
        then: [
          'valid logs should be processed',
          'corrupted entries should be skipped with warnings',
          'partial results should be stored',
          'the system should not crash'
        ]
      }
    ]
  },
  'anomaly': {
    persona: 'DevOps Engineer',
    story: 'I want to automatically detect anomalies in production',
    goal: 'so that I can be alerted to issues before they become critical',
    scenarios: [
      {
        title: 'Detect performance degradation',
        given: [
          'telemetry shows handler latencies exceeding baseline',
          'p95 latency is 2x higher than historical average',
          'multiple handlers show similar degradation pattern'
        ],
        when: [
          'the anomaly detection sequence analyzes the telemetry'
        ],
        then: [
          'performance anomalies should be identified',
          'severity should be assessed (high/critical)',
          'affected handlers should be listed',
          'anomalies should be stored for diagnosis'
        ]
      },
      {
        title: 'Detect error rate spikes',
        given: [
          'error rate jumps from 0.1% to 5% in the last hour',
          'specific handlers show elevated error counts',
          'error patterns suggest a common root cause'
        ],
        when: [
          'the anomaly detection sequence analyzes the telemetry'
        ],
        then: [
          'error pattern anomalies should be detected',
          'affected handlers should be identified',
          'error types should be categorized',
          'anomalies should be flagged for investigation'
        ]
      }
    ]
  },
  'diagnosis': {
    persona: 'Platform Team',
    story: 'I want to understand root causes of production issues',
    goal: 'so that we can fix them permanently instead of applying band-aids',
    scenarios: [
      {
        title: 'Diagnose performance issue with code analysis',
        given: [
          'an anomaly indicates handler X is slow',
          'handler X calls database query Y',
          'query Y has no index on the filter column'
        ],
        when: [
          'the diagnosis sequence analyzes the anomaly',
          'with access to the codebase'
        ],
        then: [
          'root cause should be identified (missing index)',
          'impact should be assessed (affects 10k requests/hour)',
          'fix recommendation should be generated (add index)',
          'estimated effort should be provided (low)',
          'expected benefit should be quantified (50% latency reduction)'
        ]
      },
      {
        title: 'Diagnose behavioral issue',
        given: [
          'sequence execution order is incorrect',
          'handler B is executing before handler A',
          'this causes state inconsistency'
        ],
        when: [
          'the diagnosis sequence analyzes the anomaly'
        ],
        then: [
          'behavioral issue should be identified',
          'sequence dependency should be detected',
          'fix recommendation should suggest reordering',
          'risk assessment should be provided'
        ]
      }
    ]
  },
  'fix': {
    persona: 'Platform Team',
    story: 'I want to automatically generate fixes for identified issues',
    goal: 'so that we can reduce time from detection to resolution',
    scenarios: [
      {
        title: 'Generate code fix for performance issue',
        given: [
          'diagnosis recommends adding database index',
          'the codebase structure is known',
          'similar fixes exist in the codebase'
        ],
        when: [
          'the fix generation sequence creates a patch'
        ],
        then: [
          'code changes should be generated',
          'test cases should be created from production data',
          'documentation should be updated',
          'patch should be syntactically valid',
          'patch should be ready for validation'
        ]
      },
      {
        title: 'Generate test cases from production failures',
        given: [
          'production logs show specific failure scenarios',
          'error messages and stack traces are available'
        ],
        when: [
          'the fix generation sequence creates tests'
        ],
        then: [
          'test cases should reproduce the production failure',
          'tests should verify the fix resolves the issue',
          'tests should cover edge cases from production data'
        ]
      }
    ]
  },
  'validation': {
    persona: 'Engineering Manager',
    story: 'I want to validate fixes before deploying to production',
    goal: 'so that we maintain system reliability and don\'t introduce regressions',
    scenarios: [
      {
        title: 'Validate fix passes all tests',
        given: [
          'a patch has been generated',
          'the patch includes code, tests, and documentation changes'
        ],
        when: [
          'the validation sequence runs tests on the patched code'
        ],
        then: [
          'all tests should pass',
          'code coverage should meet minimum threshold (80%)',
          'performance should not regress',
          'documentation should be valid',
          'validation results should be stored'
        ]
      },
      {
        title: 'Reject fix that fails validation',
        given: [
          'a patch has been generated',
          'tests fail or coverage is below threshold'
        ],
        when: [
          'the validation sequence runs tests'
        ],
        then: [
          'validation should fail',
          'failure reasons should be documented',
          'fix should not proceed to deployment',
          'feedback should be provided for improvement'
        ]
      }
    ]
  },
  'deployment': {
    persona: 'DevOps Engineer',
    story: 'I want to safely deploy validated fixes to production',
    goal: 'so that issues are resolved with minimal risk',
    scenarios: [
      {
        title: 'Deploy fix through CI/CD pipeline',
        given: [
          'validation has passed',
          'fix is ready for deployment',
          'CI/CD pipeline is available'
        ],
        when: [
          'the deployment sequence creates a PR and deploys'
        ],
        then: [
          'feature branch should be created',
          'PR should be created with fix details',
          'CI checks should run and pass',
          'PR should be auto-merged',
          'fix should be deployed to production',
          'deployment should be verified'
        ]
      },
      {
        title: 'Rollback deployment if verification fails',
        given: [
          'deployment has been completed',
          'post-deployment verification detects issues'
        ],
        when: [
          'the deployment sequence verifies the fix'
        ],
        then: [
          'if verification fails, rollback should be triggered',
          'previous version should be restored',
          'incident should be logged for analysis'
        ]
      }
    ]
  },
  'learning': {
    persona: 'Engineering Manager',
    story: 'I want to track the effectiveness of fixes',
    goal: 'so that we can improve our self-healing system and learn from incidents',
    scenarios: [
      {
        title: 'Measure improvement after fix deployment',
        given: [
          'fix has been deployed to production',
          'post-deployment metrics are being collected',
          'baseline metrics from before deployment are available'
        ],
        when: [
          'the learning sequence compares before/after metrics'
        ],
        then: [
          'performance improvement should be calculated',
          'error rate reduction should be measured',
          'coverage improvement should be tracked',
          'success should be assessed',
          'insights should be generated',
          'learning models should be updated'
        ]
      },
      {
        title: 'Track failed fix for future learning',
        given: [
          'fix was deployed but did not resolve the issue',
          'post-deployment metrics show no improvement'
        ],
        when: [
          'the learning sequence analyzes the outcome'
        ],
        then: [
          'failure should be recorded',
          'root cause of failure should be analyzed',
          'learning models should be updated to avoid similar mistakes',
          'insights should inform future fix generation'
        ]
      }
    ]
  }
};

async function generateBusinessBddSpecs() {
  console.log('📖 Generating Business-Focused BDD Specifications');
  console.log('='.repeat(60));

  const outputDir = path.join(rootDir, 'packages', 'self-healing', '.generated');
  const outputFile = path.join(outputDir, 'business-bdd-specifications.json');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const features = [];
  let totalScenarios = 0;

  for (const [key, userStory] of Object.entries(USER_STORIES)) {
    const feature = {
      name: userStory.story,
      persona: userStory.persona,
      goal: userStory.goal,
      scenarios: userStory.scenarios
    };
    features.push(feature);
    totalScenarios += userStory.scenarios.length;
    console.log(`✅ ${userStory.persona}: ${userStory.story}`);
  }

  const bdd = {
    version: '1.0.0',
    type: 'Business BDD Specifications',
    plugin: 'SelfHealingPlugin',
    description: 'User story-driven BDD specifications from end-user perspective',
    timestamp: new Date().toISOString(),
    summary: {
      totalFeatures: features.length,
      totalScenarios,
      personas: ['DevOps Engineer', 'Platform Team', 'Engineering Manager']
    },
    features
  };

  fs.writeFileSync(outputFile, JSON.stringify(bdd, null, 2));
  console.log(`\n✅ Generated: ${outputFile}`);
  console.log(`   📊 Features: ${bdd.summary.totalFeatures}`);
  console.log(`   👥 Personas: ${bdd.summary.personas.join(', ')}`);
  console.log(`   📝 Scenarios: ${bdd.summary.totalScenarios}`);
}

generateBusinessBddSpecs().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

