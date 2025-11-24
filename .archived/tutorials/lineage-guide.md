# Source Lineage Guide

## Complete Traceability: Logs → Telemetry → Analysis

This guide shows the complete chain from original log files through telemetry extraction to analysis and recommendations.

### Data Sources

**Log Files (87 files):**
```
- cli-drop-localhost-1763232728659.log (229 lines, ~25.3KB)
- component-resize-component-resize.cy.ts-1763013957380.log (1781 lines, ~248.3KB)
- component-resize-component-resize.cy.ts-1763041201297.log (1785 lines, ~248.7KB)
- component-resize-component-resize.cy.ts-1763308050772.log (2238 lines, ~315.9KB)
- component-resize-component-resize.cy.ts-1763308603886.log (2238 lines, ~315.9KB)
- component-resize-component-resize.cy.ts-1763355664826.log (2238 lines, ~315.8KB)
- component-resize-component-resize.cy.ts-1763355981477.log (2238 lines, ~315.9KB)
- component-resize-component-resize.cy.ts-1763356070875.log (2594 lines, ~380.5KB)
- component-resize-component-resize.cy.ts-1763390535371.log (2594 lines, ~380.4KB)
- component-resize-component-resize.cy.ts-1763396455894.log (2238 lines, ~316.0KB)
- component-resize-component-resize.cy.ts-1763397648436.log (2238 lines, ~315.9KB)
- drop-canvas-component-create-delay-localhost-1763132417203.log (1390 lines, ~111.6KB)
- drop-canvas-component-create-delay-localhost-1763156363510.log (1626 lines, ~179.4KB)
- drop-canvas-component-create-delay-localhost-1763156363511.log (300 lines, ~30.4KB)
- drop-create-delay-localhost-1763169652387.log (185 lines, ~18.8KB)
- drop-create-delay-localhost-1763170188940.log (223 lines, ~16.5KB)
- library-drop-library-drop.cy.ts-1763014004157.log (1991 lines, ~267.5KB)
- library-drop-library-drop.cy.ts-1763041252198.log (1989 lines, ~266.9KB)
- library-drop-library-drop.cy.ts-1763308138297.log (2143 lines, ~293.8KB)
- library-drop-library-drop.cy.ts-1763308681576.log (2143 lines, ~293.6KB)
- library-drop-library-drop.cy.ts-1763355712525.log (2143 lines, ~293.7KB)
- library-drop-library-drop.cy.ts-1763356033278.log (2143 lines, ~293.7KB)
- library-drop-library-drop.cy.ts-1763356112218.log (2834 lines, ~400.7KB)
- library-drop-library-drop.cy.ts-1763390579533.log (2834 lines, ~400.7KB)
- library-drop-library-drop.cy.ts-1763396537410.log (2143 lines, ~293.7KB)
- localhost-1762347999964.log (3387 lines, ~264.5KB)
- localhost-1762795664660.log (1425 lines, ~157.9KB)
- localhost-1762795904218.log (1425 lines, ~136.1KB)
- localhost-1762795928203.log (1959 lines, ~193.3KB)
- localhost-1762809274834.log (1612 lines, ~156.2KB)
- localhost-1762867906291.log (6146 lines, ~331.2KB)
- localhost-1763015552776.log (976 lines, ~70.9KB)
- localhost-1763016562923.log (978 lines, ~73.5KB)
- localhost-1763017364944.log (978 lines, ~73.8KB)
- localhost-1763039998976.log (979 lines, ~74.4KB)
- localhost-1763041026581.log (1108 lines, ~87.2KB)
- localhost-1763065262897.log (1676 lines, ~130.6KB)
- localhost-1763066101802.log (1040 lines, ~98.4KB)
- localhost-1763071713843.log (47 lines, ~3.6KB)
- localhost-1763163204443.log (950 lines, ~80.6KB)
- localhost-1763172753447.log (1861 lines, ~217.5KB)
- localhost-1763223010818.log (212 lines, ~24.6KB)
- localhost-1763223354812.log (300 lines, ~33.8KB)
- localhost-1763224136471.log (289 lines, ~32.4KB)
- localhost-1763224422789.log (289 lines, ~32.7KB)
- localhost-1763231390550.log (232 lines, ~24.7KB)
- localhost-1763232132631.log (385 lines, ~29.7KB)
- localhost-1763232293945.log (229 lines, ~26.2KB)
- localhost-1763233859151.log (821 lines, ~91.1KB)
- localhost-1763235506386.log (293 lines, ~32.9KB)
- localhost-1763235831776.log (293 lines, ~33.0KB)
- localhost-1763243965730.log (272 lines, ~31.1KB)
- localhost-1763244591095.log (892 lines, ~102.0KB)
- localhost-1763245163181.log (346 lines, ~40.1KB)
- localhost-1763246118372.log (340 lines, ~38.2KB)
- localhost-1763301642568.log (7807 lines, ~798.5KB)
- localhost-1763301655370.log (2801 lines, ~315.2KB)
- localhost-1763302861689.log (354 lines, ~39.9KB)
- localhost-1763305108559.log (77 lines, ~8.7KB)
- localhost-1763410979726.log (7166 lines, ~479.5KB)
- manual-drop-localhost-1763232787527.log (289 lines, ~32.2KB)
- manual-drop-localhost-1763233405457.log (462 lines, ~50.9KB)
- manual-drop-localhost-1763235950046.log (293 lines, ~32.9KB)
- manual-drop-localhost.log (243 lines, ~26.8KB)
- slow-timing-between-timestamps.log (368 lines, ~28.0KB)
- startup-and-drop-create-delay-localhost-1763170296206.log (1855 lines, ~202.7KB)
- startup-plugins-1763013944147.log (4 lines, ~0.2KB)
- startup-plugins-1763041185332.log (4 lines, ~0.2KB)
- startup-plugins-1763308037689.log (2 lines, ~0.1KB)
- startup-plugins-1763308585903.log (2 lines, ~0.1KB)
- startup-plugins-1763355653928.log (2 lines, ~0.1KB)
- startup-plugins-1763355970724.log (2 lines, ~0.1KB)
- startup-plugins-1763356057459.log (5 lines, ~0.3KB)
- startup-plugins-1763390503670.log (5 lines, ~0.3KB)
- startup-plugins-1763396431628.log (2 lines, ~0.1KB)
- startup-plugins-1763397638826.log (2 lines, ~0.1KB)
- theme-toggle-theme-toggle.cy.ts-1763014011830.log (1466 lines, ~200.2KB)
- theme-toggle-theme-toggle.cy.ts-1763041260011.log (1478 lines, ~201.3KB)
- theme-toggle-theme-toggle.cy.ts-1763308150303.log (1903 lines, ~261.3KB)
- theme-toggle-theme-toggle.cy.ts-1763308701136.log (1903 lines, ~261.2KB)
- theme-toggle-theme-toggle.cy.ts-1763355718615.log (1903 lines, ~261.0KB)
- theme-toggle-theme-toggle.cy.ts-1763356046706.log (1903 lines, ~261.3KB)
- theme-toggle-theme-toggle.cy.ts-1763356119365.log (1900 lines, ~260.8KB)
- theme-toggle-theme-toggle.cy.ts-1763390586907.log (1900 lines, ~260.7KB)
- theme-toggle-theme-toggle.cy.ts-1763396548268.log (1903 lines, ~261.3KB)
- theme-toggle-theme-toggle.cy.ts-1763397666296.log (1903 lines, ~261.0KB)
- web-variant-localhost-1762811808902.log (2849 lines, ~233.6KB)
```

**Telemetry:** C:\source\repos\bpm\internal\renderx-plugins-demo\.generated\renderx-web-telemetry.json
- Hash: undefined
- Events Extracted: 12

### Event Distribution

By Component:
```
canvas-component: 3
control-panel: 3
library-component: 3
host-sdk: 2
theme: 1
```

By Severity:
```
critical: 2
high: 5
medium: 4
low: 1
```

### Traceability Chain

1. **Source Logs** (.logs/*.log)
   ↓ Extract events by component and severity
2. **Telemetry** (.generated/renderx-web-telemetry.json)
   ↓ Map to test coverage
3. **Test Mapping** (event-test-mapping.json)
   ↓ Analyze gaps
4. **Recommendations** (implementation-roadmap.md)
   ↓ Create audit trail
5. **Lineage** (source-lineage.json)
   ✓ Verified and auditable

### How to Trace an Event

1. Find an anomaly in `renderx-web-telemetry.json`
2. Note the component name
3. Look up the component in `component-lineage-breakdown.json`
4. Find the log file references
5. Open the log file and go to the line numbers listed

---

For complete details, see: source-lineage.json
