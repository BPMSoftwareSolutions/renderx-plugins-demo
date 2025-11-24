# 🎵 Sequence Log Analysis - Quick Reference Card

**Keep this handy for fast analysis!**

---

## 🚀 One-Liners

```bash
# Single log
node scripts/generate-sequence-interpretation.js demo-logs/sequence.log

# All logs, individual reports
node scripts/generate-sequence-interpretation.js demo-logs/

# All logs, combined report
node scripts/generate-sequence-interpretation.js demo-logs/ --combine

# With verbose output
node scripts/generate-sequence-interpretation.js demo-logs/ --verbose

# Custom output directory
node scripts/generate-sequence-interpretation.js demo-logs/ --output=./analysis

# Organize logs
node scripts/sequence-log-utils.js organize

# Create dashboard
node scripts/sequence-log-utils.js dashboard

# Compare two logs
node scripts/sequence-log-utils.js compare log1.log log2.log

# Build timeline
node scripts/sequence-log-utils.js timeline
```

---

## 📊 Report Sections Explained

### Executive Summary
```
| Metric | What It Means |
|--------|--------------|
| Total Log Lines | Raw entries in file |
| Parsed Entries | Successfully parsed |
| Unique Sequences | Different events tracked |
| Average Duration | Typical execution time |
| Time Span | How long sequence ran |
| Anomalies | Issues detected |
```

### Health Status
```
⭐ Excellent  <10ms      Fast, no concerns
✅ Good       <50ms      Normal operation
⚠️ Warning    <100ms     Slow, monitor
❌ Critical   >250ms     Needs attention
```

### Anomalies
```
❌ zero-subscribers      No handler for event (critical)
⚠️ slow-execution        Handler too slow (high)
⚠️ multiple-subscribers  Race condition risk (medium)
```

---

## 🎯 Common Tasks

### "I want to find slow sequences"
```bash
node scripts/generate-sequence-interpretation.js demo-logs/ --combine
# Look for: Max Duration > 100ms
# Check:    Duration (Max) column in tables
```

### "Show me everything about one component"
```bash
node scripts/generate-sequence-interpretation.js demo-logs/canvas-component.log
# Read:    Sequence Details section
# Look for: Health status and execution times
```

### "Compare two versions"
```bash
node scripts/sequence-log-utils.js compare logs/v1.log logs/v2.log
# Look for: Δ (delta) columns
# Check:    Which version is faster
```

### "Show overall system health"
```bash
node scripts/generate-sequence-interpretation.js demo-logs/ --combine
node scripts/sequence-log-utils.js dashboard
# Read:    DASHBOARD.md file
```

### "Track performance over time"
```bash
node scripts/sequence-log-utils.js timeline --input=logs/
# Read:    TIMELINE.md file
# Look for: Degrading trends
```

---

## 📈 Performance Budget Quick Reference

| Metric | Excellent | Good | Warning | Critical |
|--------|-----------|------|---------|----------|
| Event Duration | <10ms | <50ms | <100ms | >250ms |
| Slow Events % | 0% | <1% | <5% | >10% |
| Anomalies | 0 | 0-1 | 2-3 | 4+ |
| Zero Subscribers | 0 | 0 | 0 | Any |

---

## 🔍 Reading Logs (Manually)

### Key Patterns to Look For

```
✅ Healthy Line:
[2025-11-17T16:40:45.063Z] LOG ... 🕐 Subscriber 0 sync execution took 6.80ms

⚠️ Warning Line:
[2025-11-17T16:40:45.063Z] LOG ... 🕐 Subscriber 0 sync execution took 234.50ms

❌ Problem Line:
[2025-11-17T16:40:45.063Z] LOG ... 🕐 [EVENTBUS] Found 0 subscriber(s)
```

### Key Emojis

```
🎵 Beat - Sequence started
🥁 MovementExecutor - Executing beat
⏱️ PerformanceTracker - Timing
🕐 EventBus - Event emission
✅ Completion - Finished
```

---

## 📁 Output Files

```
.generated/
├── sequence-interpretations/
│   ├── COMBINED_SEQUENCE_ANALYSIS.md      ← Start here
│   ├── DASHBOARD.md                        ← Overview
│   ├── control-panel_INTERPRETATION.md    ← Component details
│   └── canvas-component_INTERPRETATION.md
└── logs-organized/
    └── [Organized by component]
```

---

## ⚡ Workflow Quick Start

### 5-Minute Analysis
```bash
# 1. Generate report (2 min)
node scripts/generate-sequence-interpretation.js demo-logs/ --combine

# 2. Create dashboard (1 min)
node scripts/sequence-log-utils.js dashboard

# 3. Review results (2 min)
cat .generated/sequence-interpretations/DASHBOARD.md
```

### Detailed Investigation
```bash
# 1. Organize logs (1 min)
node scripts/sequence-log-utils.js organize

# 2. Generate all reports (2 min)
node scripts/generate-sequence-interpretation.js .generated/logs-organized/ --combine

# 3. Create timeline (1 min)
node scripts/sequence-log-utils.js timeline

# 4. Review findings (3 min)
cat .generated/sequence-interpretations/COMBINED_SEQUENCE_ANALYSIS.md
```

---

## 🐛 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| No logs found | Ensure files end in `.log` or `.txt` |
| Empty report | Check log format matches expected pattern |
| Reports look wrong | Use `--verbose` flag to debug parsing |
| Want more detail | Check individual component reports |
| Threshold too strict | Edit `CONFIG.performanceThresholds` in script |

---

## 📊 NPM Script Shortcuts

Add to `package.json`:
```json
{
  "scripts": {
    "logs:analyze": "node scripts/generate-sequence-interpretation.js demo-logs/ --combine",
    "logs:dashboard": "node scripts/sequence-log-utils.js dashboard",
    "logs:organize": "node scripts/sequence-log-utils.js organize",
    "logs:timeline": "node scripts/sequence-log-utils.js timeline"
  }
}
```

Then use:
```bash
npm run logs:analyze
npm run logs:dashboard
npm run logs:organize
npm run logs:timeline
```

---

## 💡 Pro Tips

1. **First-time analysis?** Start with combined report + dashboard
2. **Finding bottleneck?** Look at Max Duration column
3. **Comparing versions?** Use `sequence-log-utils compare`
4. **Tracking trends?** Use `timeline` command weekly
5. **Need details?** Check individual component reports

---

## 🎯 Questions & Answers

**Q: What should I look at first in a report?**
A: Executive Summary → Anomalies → Top slow sequences

**Q: Why is my event taking 234ms?**
A: Check `Sequence Details` section for that event's Max Duration

**Q: How do I know if performance is good?**
A: All durations < 50ms AND no anomalies = ✅ Good

**Q: Should I be concerned about "multiple subscribers"?**
A: Only if they conflict. Check the component code to verify.

**Q: Can I use this in CI/CD?**
A: Yes! See `SEQUENCE_LOG_EXAMPLES.md` for GitHub Actions workflow

---

## 🚀 Getting Started Right Now

```bash
# Step 1: Generate your first report
node scripts/generate-sequence-interpretation.js demo-logs/ --combine

# Step 2: Find the report
ls -la .generated/sequence-interpretations/

# Step 3: Open and review
cat .generated/sequence-interpretations/COMBINED_SEQUENCE_ANALYSIS.md

# Done! 🎉
```

---

**Print this page and keep nearby!**  
**Last Updated:** November 23, 2025  
**Version:** 1.0
