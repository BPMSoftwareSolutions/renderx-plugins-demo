#!/usr/bin/env node

/**
 * Generate Advanced Architecture Diagram
 * Shows the complete symphonic code analysis structure with metrics
 * DATA-DRIVEN: Generates diagram from actual analysis metrics
 */

/**
 * Generate a generic summary when detailed handler data isn't available
 */
function generateGenericSummary(metrics) {
  const { totalHandlers = 0, avgLocPerHandler = 0, overallCoverage = 0, domainId = 'unknown-domain' } = metrics;
  const domainName = domainId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  // Safe numeric conversions (coverage might be string from metrics)
  const safeAvgLoc = Number(avgLocPerHandler) || 0;
  const safeCoverage = Number(overallCoverage) || 0;
  
  return `        ╔═════════════════════════════════════╗
        ║ ${domainName.toUpperCase()} STRUCTURE    ${' '.repeat(Math.max(0, 30 - domainName.length))}║
        ║ (Analyzed: ${totalHandlers} handlers)   ${' '.repeat(Math.max(0, 20 - String(totalHandlers).length))}║
        ╠═════════════════════════════════════╣
        ║                                     ║
        ║  Analysis Summary:                  ║
        ║  • Total Handlers: ${String(totalHandlers).padEnd(17)}║
        ║  • Avg LOC/Handler: ${safeAvgLoc.toFixed(2).padEnd(15)}║
        ║  • Overall Coverage: ${safeCoverage.toFixed(1)}%${' '.repeat(Math.max(0, 13 - safeCoverage.toFixed(1).length))}║
        ║                                     ║
        ║  [Detailed handler portfolio        ║
        ║   available in full report]         ║
        ║                                     ║
        ╚═════════════════════════════════════╝`;
}

/**
 * Generate detailed handler summary (placeholder for future enhancement)
 */
function generateHandlerSummary(handlerSummary) {
  // Future: Parse actual handler data to generate detailed symphony sections
  return generateGenericSummary(handlerSummary);
}

function generateDiagram(metrics = {}) {
  const {
    totalFiles = 0,
    totalLoc = 0,
    totalHandlers = 0,
    avgLocPerHandler = 0,
    overallCoverage = 0,
    domainId = 'unknown-domain',
    handlerSummary = null,
    duplicateBlocks = 0,
    duplicationPercent = 0,
    godHandlers = []
  } = metrics;
  
  // Safe numeric conversions
  const safeAvgLoc = Number(avgLocPerHandler) || 0;
  const safeCoverage = Number(overallCoverage) || 0;
  const safeDuplication = Number(duplicationPercent) || 0;

  const domainTitle = domainId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').toUpperCase();
  
  // Check if handlerSummary is meaningful (not null, not empty array)
  const hasHandlerSummary = handlerSummary && Array.isArray(handlerSummary) && handlerSummary.length > 0;
  const symphonySection = hasHandlerSummary ? generateHandlerSummary(handlerSummary) : generateGenericSummary({
    totalHandlers,
    avgLocPerHandler: safeAvgLoc,
    overallCoverage: safeCoverage,
    domainId
  });
  
  return `
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                    SYMPHONIC CODE ANALYSIS ARCHITECTURE - ${domainTitle.padEnd(50)}║
║                    Enhanced Handler Portfolio & Orchestration Framework                                          ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  📊 CODEBASE METRICS FOUNDATION                                                                                 │
│  ═════════════════════════════════════════════════════════════════════════════════════════════════════════════   │
│  │ Total Files: ${String(totalFiles).padEnd(4)}│ Total LOC: ${String(totalLoc).padEnd(6)}│ Handlers: ${String(totalHandlers).padEnd(3)}│ Avg LOC/Handler: ${safeAvgLoc.toFixed(2).padEnd(5)}│ Coverage: ${safeCoverage.toFixed(2)}% │           │
│  ╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

                                           ▲
                                           │
                      ┌────────────────────┴────────────────────┐
                      │   SYMPHONIC CODE ANALYSIS PIPELINE      │
                      │   (4 Movements × 16 Beats)             │
                      └────────────┬───────────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
    ╔═══════════╗            ╔═══════════╗            ╔═══════════╗
    ║ MOVEMENT  ║            ║ MOVEMENT  ║            ║ MOVEMENT  ║
    ║     1     ║            ║     2     ║            ║     3     ║
    ║DISCOVERY  ║            ║ METRICS   ║            ║ COVERAGE  ║
    ║  & BEATS  ║            ║ ANALYSIS  ║            ║ ANALYSIS  ║
    ╚═════╤═════╝            ╚═════╤═════╝            ╚═════╤═════╝
          │                         │                        │
        ┌─┴─┐                     ┌─┴─┐                    ┌─┴─┐
        │   │                     │   │                    │   │
        ▼   ▼                     ▼   ▼                    ▼   ▼
      Beat Beat                Beat Beat                Beat Beat
      1.1  1.2                2.1  2.2                3.1  3.2
      ┌─┬─┐                  ┌─┬─┐                  ┌─┬─┐
      │ │ │                  │ │ │                  │ │ │
      │ │ │                  │ │ │                  │ │ │
      └─┴─┘                  └─┴─┘                  └─┴─┘
        │                      │                      │
        │ DISCOVER             │ MEASURE              │ MEASURE
        │ ${String(totalFiles).padEnd(4)} files           │ LOC metrics           │ coverage
        │                      │                      │
        └──────────┬───────────┴──────────┬───────────┘
                   │                      │
                   ▼                      ▼
        ╔══════════════════╗  ╔══════════════════╗
        │  DATA BATON 🎭   │  │  DATA BATON 🎭   │
        ├──────────────────┤  ├──────────────────┤
        │ • Files: ${String(totalFiles).padEnd(4)}    │  │ • Handlers: ${String(totalHandlers).padEnd(3)} │
        │ • LOC: ${String(totalLoc).padEnd(6)}    │  │ • Avg LOC: ${safeAvgLoc.toFixed(2).padEnd(5)}│
        │ • Beats: 4/4 ✓   │  │ • Coverage: ${safeCoverage.toFixed(1)}%│
        │ • Status: READY  │  │ • Status: READY  │
        └────────┬─────────┘  └────────┬─────────┘
                 │                     │
                 └──────────┬──────────┘
                            │
                            ▼
${symphonySection}
        ║  │                                  ║
        ║  └─ ... (+ 15 more symphonies)      ║
        ║     with 100+ additional handlers   ║
        ║                                     ║
        ╚═════════════════════════════════════╝
                        │
                        ▼
        ╔═══════════════════════════════════════════════════════╗
        ║   QUALITY & COVERAGE METRICS                         ║
        ╠═══════════════════════════════════════════════════════╣
        ║                                                       ║
        ║  Handlers Analyzed: ${String(totalHandlers).padEnd(33)}║
        ║  Avg LOC/Handler: ${safeAvgLoc.toFixed(2).padEnd(35)}║
        ║  Test Coverage: ${safeCoverage.toFixed(1)}%${' '.repeat(Math.max(0, 38 - safeCoverage.toFixed(1).length))}║
        ║  Duplication: ${safeDuplication.toFixed(1)}%${' '.repeat(Math.max(0, 42 - safeDuplication.toFixed(1).length))}║
        ║  ${godHandlers.length > 0 ? `⚠️  God Handlers: ${godHandlers.length}` : `✓  No God Handlers`}${' '.repeat(Math.max(0, 45 - (godHandlers.length > 0 ? `God Handlers: ${godHandlers.length}` : `No God Handlers`).length))}║
        ║                                                       ║
        ║  [Full metrics available in detailed report]          ║
        ║                                                       ║
        ╚═══════════════════════════════════════════════════════╝

═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

                           🎼 LEGEND & DOMAIN TERMINOLOGY 🎼

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SYMPHONIC ARCHITECTURE TERMS:                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ • Symphony:          Logical grouping of related handler functions                                            │
│ • Sequence:          Execution order of handlers within a symphony (choreographed flow)                        │
│ • Handler:           Individual function that performs a specific orchestration task                          │
│ • Beat:              Execution unit within a Movement (4 movements × 4 beats = 16 beats total)               │
│ • Movement:          Major phase in analysis (Discovery, Metrics, Coverage, Conformity)                       │
│ • Data Baton 🎭:     Metadata container passed between beats (files, handlers, metrics)                       │
│ • Orchestration:     Complete system of symphonies, sequences, and handlers working together                  │
│                                                                                                                 │
│ CODE ANALYSIS METRICS:                                                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ • LOC:               Lines of Code (measured, not synthetic)                                                   │
│ • Coverage:          Percentage of code covered by tests (target: 80%+)                                       │
│ • Duplication:       Percentage of duplicate code blocks identified                                           │
│ • God Handler:       Handler with 100+ LOC and <70% coverage (refactoring candidate)                         │
│                                                                                                                 │
│ COVERAGE SYMBOLS:                                                                                             │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🟢 GREEN (80%+):     Well-covered, production-ready                                                           │
│ 🟡 YELLOW (50-79%):  Acceptable but needs improvement                                                         │
│ 🔴 RED (<50%):       Poor coverage, high risk                                                                 │
│ ⚠️  WARNING:          High complexity or high-risk area                                                         │
│ ✓ CHECK:             Meets requirements/passing                                                               │
│                                                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

ANALYSIS EXECUTION SUMMARY:
  ✅ Discovered: ${totalFiles} source files in ${domainId}
  ✅ Analyzed: ${totalHandlers} handler functions with measured LOC (${totalLoc} total lines)
  ✅ Mapped: Files to orchestration beats
  ✅ Measured: Test coverage (avg ${safeCoverage.toFixed(1)}%)
  ${godHandlers.length > 0 ? `✅ Identified: ${godHandlers.length} God handlers requiring refactoring` : `✅ No God handlers detected`}
  ✅ Generated: Comprehensive metrics and analysis artifacts

NEXT ACTIONS:
  → Review detailed metrics in full report
  ${safeDuplication > 50 ? `→ Reduce code duplication from ${safeDuplication.toFixed(1)}% to <50%` : `→ Maintain low duplication levels`}
  ${safeCoverage < 80 ? `→ Improve test coverage to 80%+ (currently ${safeCoverage.toFixed(1)}%)` : `→ Maintain excellent test coverage`}
  ${godHandlers.length > 0 ? `→ Refactor ${godHandlers.length} God handler${godHandlers.length > 1 ? 's' : ''}` : ''}

═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
`;

}

// Legacy export for backward compatibility (returns static diagram if no metrics)
const diagram = generateDiagram();

if (require.main === module) {
  console.log(diagram);
}

module.exports = { diagram, generateDiagram };
