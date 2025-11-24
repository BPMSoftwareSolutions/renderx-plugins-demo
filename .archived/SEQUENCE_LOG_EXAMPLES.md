# 🎵 Sequence Log Analysis - Usage Examples & Patterns

**Date:** November 23, 2025  
**Purpose:** Real-world examples and common workflows  
**Status:** ✅ Production Ready

---

## Table of Contents

1. [Quick Examples](#quick-examples)
2. [Development Workflow](#development-workflow)
3. [Performance Investigation](#performance-investigation)
4. [Multi-Component Analysis](#multi-component-analysis)
5. [Regression Testing](#regression-testing)
6. [Advanced Scenarios](#advanced-scenarios)

---

## Quick Examples

### Example 1: Analyze Single Component Log

```bash
$ cd /path/to/renderx-plugins-demo

$ node scripts/generate-sequence-interpretation.js demo-logs/control-panel-2025-11-23.log

✅ .generated/sequence-interpretations/control-panel-2025-11-23_INTERPRETATION.md
```

**Output Report:**
```markdown
# 🎵 Sequence Log Interpretation Report

## 📊 Executive Summary
- Total Log Lines: 450
- Parsed Entries: 380  
- Unique Sequences: 12
- Average Duration: 8.45ms
- Anomalies: 0

## 🎯 Sequence Details

### control:panel:ui:render
- Health: ⭐ Excellent
- Min Duration: 6.80ms
- Max Duration: 12.45ms
- Occurrences: 45

## ✅ Status: All sequences executing normally
```

---

### Example 2: Combine All Component Logs

```bash
$ node scripts/generate-sequence-interpretation.js demo-logs/ --combine

✅ .generated/sequence-interpretations/COMBINED_SEQUENCE_ANALYSIS.md
```

**Output Report:**
```markdown
# 🎵 Combined Sequence Log Analysis

## 📊 Summary
- Logs Analyzed: 3
- Total Lines: 1,245
- Unique Sequences: 34
- Total Anomalies: 1
- Max Duration: 234.50ms

## 🏆 Top Sequences
1. control:panel:ui:render (45 occurrences, 8.23ms avg)
2. canvas:component:redraw (38 occurrences, 15.67ms avg)
3. host:sdk:init (28 occurrences, 3.45ms avg)

## ⚠️ Anomalies
1. ❌ slow-execution in canvas-component (234.50ms)
```

---

### Example 3: Verbose Output for Debugging

```bash
$ node scripts/generate-sequence-interpretation.js demo-logs/ --verbose

🎵 Sequence Log Interpretation Generator

Input: demo-logs
Mode: Combined
Output: .generated/sequence-interpretations

📂 Found 3 log file(s)
  📄 Processing: control-panel.log
  📄 Processing: canvas-component.log
  📄 Processing: host-sdk.log

✅ Combined report generated: .generated/sequence-interpretations/COMBINED_SEQUENCE_ANALYSIS.md

⏱️ Completed in 342.15ms
```

---

## Development Workflow

### Workflow: Optimize Component Performance

**Scenario:** Control Panel UI is slower than expected. Need to identify bottleneck.

```bash
# Step 1: Capture log during issue
npm run demo:start 2>&1 | tee logs/control-panel-debug.log

# Step 2: Analyze the log
node scripts/generate-sequence-interpretation.js logs/control-panel-debug.log

# Step 3: Review report
cat .generated/sequence-interpretations/control-panel-debug_INTERPRETATION.md

# Report shows: canvas:component:redraw taking 234ms (3x slower than baseline)

# Step 4: Look at specific lines
grep "canvas:component:redraw" logs/control-panel-debug.log | head -20

# Step 5: Fix identified issue in canvas-component

# Step 6: Verify fix
node scripts/generate-sequence-interpretation.js logs/control-panel-fixed.log

# Now showing: canvas:component:redraw taking 45ms ✅
```

---

### Workflow: Daily Performance Check

```bash
#!/bin/bash
# scripts/daily-performance-check.sh

echo "🎵 Daily Performance Analysis"
echo ""

# Timestamp
DATE=$(date +%Y-%m-%d)
LOGDIR="logs/$DATE"

mkdir -p "$LOGDIR"

# Run demo for N minutes
echo "📊 Capturing logs..."
npm run demo:capture -- --duration=5 --output="$LOGDIR/demo.log"

# Analyze
echo "🔍 Analyzing..."
node scripts/generate-sequence-interpretation.js "$LOGDIR/demo.log"

# Check for regressions
echo "📈 Checking baseline..."
BASELINE=".generated/sequence-interpretations/baseline.json"
CURRENT=".generated/sequence-interpretations/${DATE}_analysis.json"

# Compare and report
if node scripts/sequence-log-utils.js compare "$BASELINE" "$CURRENT"; then
  echo "✅ All metrics within budget"
else
  echo "⚠️ Performance regression detected"
  cat ".generated/sequence-interpretations/REGRESSION_REPORT.md"
fi
```

---

## Performance Investigation

### Scenario: "System is slow on Fridays"

```bash
# Collect logs from all components on Friday
node scripts/generate-sequence-interpretation.js logs/friday-2025-11-22/ --combine --verbose

# Analyze all Friday logs together
cat .generated/sequence-interpretations/COMBINED_SEQUENCE_ANALYSIS.md

# Output shows:
# - Control Panel: Normal performance
# - Canvas Component: Degraded (20% slower than baseline)
# - Host SDK: Normal performance
# 
# Hypothesis: Canvas rendering under load
# Next step: Profile canvas component on Friday loads
```

---

### Scenario: "Why is control-panel-ui-render hanging?"

```bash
# Capture specific sequence
node scripts/generate-sequence-interpretation.js logs/hang-debug.log --verbose

# Report shows:
# ⚠️ Warning: Found 0 subscriber(s) for "control:panel:ui:render"
# Line: 145
# Message: No subscribers found for event

# Diagnosis: Render event has no handler
# Fix: Check Control Panel component's event registration

# After fix:
$ node scripts/generate-sequence-interpretation.js logs/hang-fixed.log

# Now shows:
# ✅ control:panel:ui:render
# Health: ⭐ Excellent
# Subscribers: 1
# Duration: 8.90ms
```

---

## Multi-Component Analysis

### Workflow: System-Wide Performance Report

```bash
# Organize logs by component
node scripts/sequence-log-utils.js organize --input=./logs --output=.generated/logs-organized

# Analysis each component
node scripts/generate-sequence-interpretation.js .generated/logs-organized/control-panel/
node scripts/generate-sequence-interpretation.js .generated/logs-organized/canvas-component/
node scripts/generate-sequence-interpretation.js .generated/logs-organized/host-sdk/

# Create dashboard
node scripts/sequence-log-utils.js dashboard --input=.generated/sequence-interpretations

# View results
cat .generated/sequence-interpretations/DASHBOARD.md
```

**Dashboard Output:**
```markdown
# 📊 Sequence Analysis Dashboard

## 📑 Analysis Reports

- ✅ control-panel_INTERPRETATION.md (0 issues)
- ⚠️ canvas-component_INTERPRETATION.md (1 issue)
- ✅ host-sdk_INTERPRETATION.md (0 issues)
- ⚠️ COMBINED_SEQUENCE_ANALYSIS.md (1 critical issue)

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total Reports | 4 |
| Total Issues | 1 |
| Critical | 1 |
| Healthy | 3 |

## Action Items

1. ❌ CRITICAL: Canvas component slow render (234.50ms)
   - File: canvas-component_INTERPRETATION.md
   - Action: Profile and optimize render handler
```

---

## Regression Testing

### Workflow: Pre-Release Performance Validation

```bash
#!/bin/bash
# scripts/pre-release-validation.sh

echo "🎵 Pre-Release Performance Validation"
echo ""

RELEASE_VERSION="v1.2.0"
BASELINE_DIR=".generated/baselines/$RELEASE_VERSION"

mkdir -p "$BASELINE_DIR"

# Capture baseline on main branch
echo "📊 Capturing baseline on main..."
git checkout main
npm run demo:capture -- --output="logs/baseline-$RELEASE_VERSION.log"
node scripts/generate-sequence-interpretation.js "logs/baseline-$RELEASE_VERSION.log"
cp .generated/sequence-interpretations/*_INTERPRETATION.md "$BASELINE_DIR/"

# Test on feature branch
echo "📊 Testing on feature branch..."
git checkout feature/my-optimization
npm run demo:capture -- --output="logs/feature-$RELEASE_VERSION.log"
node scripts/generate-sequence-interpretation.js "logs/feature-$RELEASE_VERSION.log"

# Compare
echo "📈 Comparing..."
node scripts/sequence-log-utils.js compare \
  "logs/baseline-$RELEASE_VERSION.log" \
  "logs/feature-$RELEASE_VERSION.log"

# Results in:
# COMPARISON_*.md showing improvements/regressions
```

---

### Workflow: Detecting Performance Regressions

```bash
# Generate reports for main and feature branches

# Main branch
git checkout main
node scripts/generate-sequence-interpretation.js logs/ --combine \
  --output=.generated/analysis-main

# Feature branch  
git checkout feature/new-feature
node scripts/generate-sequence-interpretation.js logs/ --combine \
  --output=.generated/analysis-feature

# Compare summaries
echo "Main branch average duration:"
grep "Average Duration" .generated/analysis-main/COMBINED_SEQUENCE_ANALYSIS.md

echo ""
echo "Feature branch average duration:"
grep "Average Duration" .generated/analysis-feature/COMBINED_SEQUENCE_ANALYSIS.md

# If feature > main, investigate regression
if [ $feature_duration -gt $main_duration ]; then
  echo "⚠️ Performance regression detected"
  echo "Regression: +${delta}ms"
fi
```

---

## Advanced Scenarios

### Scenario 1: Timeline Analysis - Spot Performance Degradation

```bash
# Create timeline from multiple daily runs
node scripts/sequence-log-utils.js timeline --input=logs/daily/

# Generated file: logs/daily/TIMELINE.md

cat logs/daily/TIMELINE.md
```

**Output:**
```markdown
# ⏱️ Performance Timeline

| Date | File | Performance | Status |
|------|------|-------------|--------|
| 2025-11-21 | sequence-2025-11-21.log | 🟢 Fast | ✅ Healthy |
| 2025-11-22 | sequence-2025-11-22.log | 🟡 Medium | ⚠️ Issues |
| 2025-11-23 | sequence-2025-11-23.log | 🔴 Slow | ⚠️ Issues |

Insight: Performance degrading over 3 days
Recommendation: Investigate memory leaks or state accumulation
```

---

### Scenario 2: Comparing Optimization Strategies

```bash
# Test Strategy A
git checkout strategy-a
npm run demo:capture -- --output=logs/strategy-a.log
node scripts/generate-sequence-interpretation.js logs/strategy-a.log

# Test Strategy B
git checkout strategy-b
npm run demo:capture -- --output=logs/strategy-b.log
node scripts/generate-sequence-interpretation.js logs/strategy-b.log

# Compare
node scripts/sequence-log-utils.js compare logs/strategy-a.log logs/strategy-b.log

# Output: COMPARISON_*.md
# Shows which strategy performs better with metrics
```

---

### Scenario 3: Building a Performance Dashboard

```bash
#!/bin/bash
# scripts/build-dashboard.sh

echo "📊 Building Performance Dashboard"

# Generate all reports
node scripts/generate-sequence-interpretation.js logs/ --combine

# Create organized analysis
node scripts/sequence-log-utils.js organize
node scripts/sequence-log-utils.js dashboard
node scripts/sequence-log-utils.js timeline

# Create index
cat > .generated/sequence-interpretations/INDEX.md << 'EOF'
# 🎵 Sequence Performance Dashboard

## 📑 Quick Links

- [Combined Analysis](./COMBINED_SEQUENCE_ANALYSIS.md)
- [Dashboard Overview](./DASHBOARD.md)
- [Performance Timeline](./TIMELINE.md)

## 📊 Component Reports

EOF

# List all component reports
for report in .generated/sequence-interpretations/*_INTERPRETATION.md; do
  component=$(basename "$report" _INTERPRETATION.md)
  echo "- [$component]($report)" >> .generated/sequence-interpretations/INDEX.md
done

echo ""
echo "✅ Dashboard created at: .generated/sequence-interpretations/INDEX.md"
echo ""
echo "📊 Quick view:"
cat .generated/sequence-interpretations/INDEX.md
```

---

### Scenario 4: CI/CD Integration with Automation

```yaml
# .github/workflows/performance-monitor.yml
name: 🎵 Performance Monitoring

on:
  schedule:
    # Run every 6 hours
    - cron: '0 */6 * * *'
  workflow_dispatch:

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Capture logs
        run: npm run demo:capture
      
      - name: Generate analysis
        run: |
          node scripts/generate-sequence-interpretation.js demo-logs/ --combine
          node scripts/sequence-log-utils.js organize
          node scripts/sequence-log-utils.js dashboard
      
      - name: Check for regressions
        run: |
          # Extract metrics
          CURRENT_AVG=$(grep "Average Duration" .generated/COMBINED_SEQUENCE_ANALYSIS.md | grep -o '[0-9.]*ms' | head -1)
          BASELINE_AVG=$(cat .performance-baseline.txt)
          
          # Compare (allow 10% variance)
          if [ "$(echo "$CURRENT_AVG > $BASELINE_AVG * 1.1" | bc)" -eq 1 ]; then
            echo "⚠️ Performance regression detected"
            exit 1
          fi
      
      - name: Create report
        run: |
          cat > report.md << 'EOF'
          # 📊 Performance Report
          
          Generated: $(date)
          
          EOF
          cat .generated/sequence-interpretations/DASHBOARD.md >> report.md
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v2
        with:
          name: performance-analysis
          path: .generated/sequence-interpretations/
      
      - name: Notify Slack
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "⚠️ Performance regression detected",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "Performance regression in ${{ github.repository }}\n\nReview analysis artifacts for details."
                  }
                }
              ]
            }
```

---

## 🎯 Recommended Workflow

### Daily Development

```bash
# Before pushing changes
node scripts/generate-sequence-interpretation.js demo-logs/ --combine

# Review report
cat .generated/sequence-interpretations/COMBINED_SEQUENCE_ANALYSIS.md

# If anomalies found, investigate
# If all good, commit and push
```

### Weekly Review

```bash
# Analyze full week
node scripts/sequence-log-utils.js organize --input=logs/week-1
node scripts/sequence-log-utils.js dashboard
node scripts/sequence-log-utils.js timeline

# Review trends
cat .generated/sequence-interpretations/DASHBOARD.md
cat logs/week-1/TIMELINE.md
```

### Pre-Release

```bash
# Full validation suite
node scripts/generate-sequence-interpretation.js logs/release-candidate/ --combine
node scripts/sequence-log-utils.js compare logs/baseline.log logs/rc.log

# Sign off if:
# - No high/critical anomalies
# - Performance stable vs baseline
# - All sequences in budget
```

---

## 📈 Metrics to Monitor

### Key Performance Indicators (KPIs)

1. **Average Event Duration**
   - Target: < 10ms
   - Warning: > 50ms
   - Critical: > 250ms

2. **Anomaly Count**
   - Target: 0
   - Warning: 1-2
   - Critical: 3+

3. **Zero Subscriber Events**
   - Target: 0
   - Action: Any occurrence requires investigation

4. **Slow Event Ratio**
   - Target: < 1%
   - Warning: > 5%
   - Critical: > 10%

---

**Last Updated:** November 23, 2025  
**Status:** ✅ Production Ready  
**Version:** 1.0
