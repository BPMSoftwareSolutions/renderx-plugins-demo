/**
 * Test what sequence names are being captured vs what they should be
 */

const testLines = [
  'EventBus.ts:56 2025-11-10T21:56:17.114Z ✅ SequenceRegistry: Sequence "Library Load" validation passed',
  'EventBus.ts:56 2025-11-10T21:56:17.114Z 🎼 SequenceRegistry: Registered sequence "Library Load" (id: library-load-symphony)',
  'EventBus.ts:56 2025-11-10T21:56:17.197Z 🎼 SequenceRegistry: Registered sequence "Header UI Theme Toggle" (id: header-ui-theme-toggle-symphony)',
  'EventBus.ts:56 2025-11-10T21:56:17.198Z 🎼 SequenceRegistry: Registered sequence "Canvas Component Create" (id: canvas-component-create-symphony)',
];

console.log('\n📊 SEQUENCE NAME EXTRACTION TEST\n');
console.log('='.repeat(80));

testLines.forEach((line, i) => {
  console.log(`\nLine ${i+1}:`);
  console.log('  Raw: ' + line.substring(0, 100) + '...');

  // Current pattern (WRONG)
  const currentMatch = line.match(/["']([^"']+)["']|sequence[\s:]*([a-zA-Z0-9\-_]+)/i);
  console.log('\n  Current pattern result:');
  console.log('    Captured: "' + (currentMatch?.[1] || currentMatch?.[2] || 'NOTHING') + '"');

  // Better pattern (CORRECT)
  const betterMatch = line.match(/Registered sequence "([^"]+)"/);
  console.log('\n  Better pattern result:');
  console.log('    Captured: "' + (betterMatch?.[1] || 'NOTHING') + '"');
});

console.log('\n' + '='.repeat(80));
console.log('\n✅ CONCLUSION:');
console.log('Current pattern captures first quoted string (validation status, etc.)');
console.log('Better pattern captures ACTUAL sequence name from "Registered sequence X"');
console.log('\n🔧 FIX NEEDED: Update LogAnalyzer.ts to use proper sequence extraction pattern');
