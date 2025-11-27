# ⚠️ DEPRECATION NOTICE - System B Governance Files

**Effective Date**: 2025-11-24  
**Status**: DEPRECATED - Do not use  
**Replacement**: `docs/governance/UNIFIED_GOVERNANCE_AUTHORITY.json`  
**Reason**: Merged into unified governance framework (Option 1)  

---

## Deprecated Files

### ❌ `.generated/MASTER_GOVERNANCE_AUTHORITY.json`
- **Status**: DEPRECATED
- **Reason**: Content merged into unified framework
- **Use Instead**: `docs/governance/UNIFIED_GOVERNANCE_AUTHORITY.json`
- **What It Was**: Repository-wide policy definition (System B)
- **Where It Went**: Sections integrated into UNIFIED_GOVERNANCE_AUTHORITY.json

### ❌ `.generated/GOVERNANCE_FRAMEWORK.json`
- **Status**: DEPRECATED
- **Reason**: Enforcement layers merged into unified framework
- **Use Instead**: `docs/governance/UNIFIED_GOVERNANCE_AUTHORITY.json` section: `enforcement_layers_unified`
- **What It Was**: Technical enforcement specification (System B)
- **Where It Went**: 5 System B layers → 7 unified layers in UNIFIED_GOVERNANCE_AUTHORITY.json

### ❌ `.generated/GOVERNANCE_IMPLEMENTATION_PLAN.md`
- **Status**: DEPRECATED
- **Reason**: References outdated System B framework
- **Use Instead**: Updated plan will use unified authority
- **What It Was**: 6-phase implementation roadmap (System B)
- **What Changed**: Phases now reference unified authority

### ❌ `.generated/GOVERNANCE_DOCUMENT_INDEX.md`
- **Status**: DEPRECATED (for governance reference)
- **Reason**: References outdated System B files
- **Use Instead**: Navigation to unified governance files
- **What It Was**: Navigation guide for System B documentation

### ❌ `.generated/REPOSITORY_WIDE_GOVERNANCE_SUMMARY.md`
- **Status**: DEPRECATED (for governance reference)
- **Reason**: Summarized System B framework
- **Use Instead**: `docs/governance/GOVERNANCE_SYSTEM_MERGER_COMPLETE.md` (merger guide)

### ❌ `.generated/GOVERNANCE_QUICK_START.md`
- **Status**: DEPRECATED (for governance reference)
- **Reason**: Described System B framework
- **Use Instead**: Read UNIFIED_GOVERNANCE_AUTHORITY.json directly (simplified)

---

## What Happened (Why Deprecated)

### Original Problem
System A and System B developed independently:
- System A: Root file placement governance (docs/governance/)
- System B: JSON automation governance (.generated/)
- Result: Two competing authorities, potential conflicts

### Solution (Option 1)
Merge System B into System A:
- Preserved all System A rules
- Integrated all System B rules
- Created UNIFIED_GOVERNANCE_AUTHORITY.json
- Established clear hierarchy

### Why Now Deprecated
System B files are redundant:
- All content is now in UNIFIED_GOVERNANCE_AUTHORITY.json
- Using deprecated files causes confusion
- Single source of truth is more reliable
- Prevents drift (the original problem)

---

## Migration Path

### If You Reference These Files

#### ❌ Old Way
```javascript
// Import from System B files
const masterAuth = require('./.generated/MASTER_GOVERNANCE_AUTHORITY.json');
const framework = require('./.generated/GOVERNANCE_FRAMEWORK.json');
```

#### ✅ New Way
```javascript
// Import from unified authority
const unifiedAuth = require('./docs/governance/UNIFIED_GOVERNANCE_AUTHORITY.json');
// All information now in one place
```

#### ❌ Old Way (Docs)
```markdown
Reference: [MASTER_GOVERNANCE_AUTHORITY.json](./.generated/MASTER_GOVERNANCE_AUTHORITY.json)
Also see: [GOVERNANCE_FRAMEWORK.json](./.generated/GOVERNANCE_FRAMEWORK.json)
```

#### ✅ New Way (Docs)
```markdown
Reference: [UNIFIED_GOVERNANCE_AUTHORITY.json](./docs/governance/UNIFIED_GOVERNANCE_AUTHORITY.json)
For System A detail: [ROOT_FILE_PLACEMENT_RULES.json](./docs/governance/ROOT_FILE_PLACEMENT_RULES.json)
```

---

## What to Do Now

### If You Created These Files
Delete or archive them:
```bash
# Archive (don't delete yet, keep history)
mv .generated/MASTER_GOVERNANCE_AUTHORITY.json .generated/DEPRECATED_MASTER_GOVERNANCE_AUTHORITY.json.bak
mv .generated/GOVERNANCE_FRAMEWORK.json .generated/DEPRECATED_GOVERNANCE_FRAMEWORK.json.bak
# ... etc for other System B files
```

### If You Reference These Files
Update references:
```bash
# Find all references
grep -r "MASTER_GOVERNANCE_AUTHORITY" .
grep -r "GOVERNANCE_FRAMEWORK" .

# Update to point to unified authority
sed -i 's|\.generated/MASTER_GOVERNANCE_AUTHORITY|docs/governance/UNIFIED_GOVERNANCE_AUTHORITY|g' *
sed -i 's|\.generated/GOVERNANCE_FRAMEWORK|docs/governance/UNIFIED_GOVERNANCE_AUTHORITY|g' *
```

### If You Read These Files
Switch to reading:
- `docs/governance/UNIFIED_GOVERNANCE_AUTHORITY.json` (master)
- `docs/governance/ROOT_FILE_PLACEMENT_RULES.json` (System A detail)
- `docs/governance/GOVERNANCE_SYSTEM_MERGER_COMPLETE.md` (migration guide)

---

## Content Mapping

### Where Did It Go?

| Old File | Section | New Location |
|----------|---------|--------------|
| MASTER_GOVERNANCE_AUTHORITY.json | Core principles | UNIFIED_GOVERNANCE_AUTHORITY.json → core_principles |
| MASTER_GOVERNANCE_AUTHORITY.json | Cascade model | UNIFIED_GOVERNANCE_AUTHORITY.json → governance_authorities |
| GOVERNANCE_FRAMEWORK.json | Enforcement layers | UNIFIED_GOVERNANCE_AUTHORITY.json → enforcement_layers_unified |
| GOVERNANCE_FRAMEWORK.json | File governance matrix | UNIFIED_GOVERNANCE_AUTHORITY.json → file_governance_matrix |
| GOVERNANCE_FRAMEWORK.json | Generator specs | UNIFIED_GOVERNANCE_AUTHORITY.json → enforcement_layers_unified |

---

## Frequently Asked Questions

**Q: Should I still follow the rules in deprecated files?**  
A: Yes! The rules didn't change, only the file location. Follow the rules, just reference the new file.

**Q: Can I use deprecated files if I need to?**  
A: No. They're outdated and may contain incorrect information. Always use UNIFIED_GOVERNANCE_AUTHORITY.json.

**Q: Will deprecated files be deleted?**  
A: Not immediately. They'll be archived but kept for historical reference. New code must use unified authority.

**Q: What if I find a discrepancy between old and new?**  
A: Trust the new UNIFIED_GOVERNANCE_AUTHORITY.json. It's the source of truth. Report discrepancies as bugs.

**Q: When will the old files be completely removed?**  
A: After Phase 2 completion and verification that all systems work with unified framework.

**Q: What about my scripts that reference these files?**  
A: Update them now to reference UNIFIED_GOVERNANCE_AUTHORITY.json to avoid future issues.

---

## Enforcement

### Phase 2 Onward
- ✅ New packages inherit from UNIFIED_GOVERNANCE_AUTHORITY.json
- ✅ Old System B files must not be used as reference
- ✅ All documentation updated to reference unified authority
- ✅ Build system validates using unified framework

### Violations
If you find code or documentation still referencing deprecated files:
1. Update to use UNIFIED_GOVERNANCE_AUTHORITY.json
2. Report as issue (governance drift)
3. Escalate to avoid future conflicts

---

## Conclusion

**System B files are deprecated as of 2025-11-24.**

They've been successfully merged into:
- **Master Authority**: `docs/governance/UNIFIED_GOVERNANCE_AUTHORITY.json`
- **System A Detail**: `docs/governance/ROOT_FILE_PLACEMENT_RULES.json`

**Action Required**: Update all references to use unified authority.

**Result**: Single source of truth, no more drift, clear governance.

---

**Status**: DEPRECATED - Effective 2025-11-24  
**Replacement**: docs/governance/UNIFIED_GOVERNANCE_AUTHORITY.json  
**Archive Plan**: After Phase 2 verification, archive with historical marker  

