# Quick Start: Using the Gap Analyzer

This guide shows you how to quickly analyze any plugin for web vs desktop gaps.

## 🚀 Quick Commands

### Analyze Library Plugin
```bash
python migration_tools/web_desktop_gap_analyzer.py \
  --plugin library \
  --quick-wins \
  --recommendations
```

### Analyze Canvas Plugin
```bash
python migration_tools/web_desktop_gap_analyzer.py \
  --plugin canvas \
  --quick-wins \
  --recommendations
```

### Analyze Control Panel Plugin
```bash
python migration_tools/web_desktop_gap_analyzer.py \
  --plugin control-panel \
  --quick-wins \
  --recommendations
```

### Full Analysis with All Details
```bash
python migration_tools/web_desktop_gap_analyzer.py \
  --plugin library \
  --show-css-gap \
  --show-component-gap \
  --show-feature-gap \
  --quick-wins \
  --recommendations \
  --output ./migration_tools/output/library_full_analysis.md
```

## 📊 Understanding the Output

### Executive Summary
Shows high-level metrics at a glance.

### Quick Win Opportunities
**Start here!** These are 1-2 hour fixes with high visual impact.

### Component Implementation Gaps
Missing components that need to be created.

### Feature Implementation Gaps
Features that exist in web but not desktop (drag-drop, animations, etc.).

### CSS & Styling Gaps
Visual polish differences (hover effects, gradients, animations).

## 🎯 Typical Workflow

### 1. Initial Analysis
```bash
python migration_tools/web_desktop_gap_analyzer.py --plugin library --quick-wins
```

**Action:** Review quick wins, implement low-hanging fruit.

### 2. Detailed Planning
```bash
python migration_tools/web_desktop_gap_analyzer.py \
  --plugin library \
  --show-css-gap \
  --show-component-gap \
  --show-feature-gap \
  --recommendations \
  --output ./reports/sprint_planning.md
```

**Action:** Use report for sprint planning and backlog prioritization.

### 3. Export for Tracking
```bash
python migration_tools/web_desktop_gap_analyzer.py \
  --plugin library \
  --format json \
  --output ./tracking/gaps_$(date +%Y%m%d).json
```

**Action:** Import into dashboard or tracking tool.

### 4. Progress Verification
After implementing fixes:
```bash
python migration_tools/web_desktop_gap_analyzer.py --plugin library --quick-wins
```

**Action:** Compare gap count to baseline, celebrate progress!

## 📁 Output Files

All reports saved to: `migration_tools/output/`

- `web_desktop_gap_report.md` - Default output
- `library_gap_analysis.md` - Library plugin analysis
- `canvas_gap_analysis.md` - Canvas plugin analysis
- `gaps_YYYYMMDD.json` - JSON export for tracking

## 🔍 Reading the Severity Levels

- 🔴 **Critical** - Blocking issue, implement immediately
- 🟠 **High** - Major feature missing, prioritize
- 🟡 **Medium** - Important but not blocking
- 🟢 **Low** - Nice to have, polish items

## ⚡ Effort Estimates

- **Quick** - 1-2 hours, usually styling
- **Medium** - 1-3 days, feature implementation
- **Large** - 1+ weeks, major component or complex feature

## 🎨 Common Gap Types

### Component Gaps
Entire components missing in desktop.
**Action:** Create the component from scratch.

### Feature Gaps
Component exists but missing specific features.
**Action:** Add the missing functionality.

### Style Gaps
Visual polish missing (hover, animations, gradients).
**Action:** Add styling enhancements.

## 💡 Tips

### Get Quick Wins First
Run with `--quick-wins` to see easy improvements.

### Filter by Severity
Use `--severity high` to focus on critical issues.

### Export JSON for Automation
Use `--format json` to integrate with tools.

### Rerun After Changes
Track progress by running analyzer regularly.

### Compare Across Plugins
Run for all plugins to see which need most work.

## 🐛 Troubleshooting

### No Gaps Found
- Check plugin name matches directory structure
- Verify paths: `--web-packages ./packages --desktop ./src`
- Ensure component files exist (`.tsx`, `.axaml`)

### Missing CSS Analysis
- Verify CSS files exist in `packages/<plugin>/src/ui/`
- Check CSS imports in components

### Wrong Desktop Components
- Script looks for `RenderX.Plugins.<PluginName>` directory
- Check capitalization (Library vs library)

## 📚 More Information

- **Full Tool Documentation:** `migration_tools/README_GAP_ANALYZER.md`
- **Library Analysis Summary:** `docs/LIBRARY_PLUGIN_GAP_ANALYSIS_SUMMARY.md`
- **Detailed Comparison:** `docs/LIBRARY_PLUGIN_UI_COMPARISON.md`
- **Tool Source Code:** `migration_tools/web_desktop_gap_analyzer.py`

---

**Need Help?** Check the README or review example output files.
