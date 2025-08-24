/**
 * Pure function to build interaction manifest from catalogs and overrides.
 * Extracted from scripts/generate-interaction-manifest.js for easier testing.
 */

export function buildInteractionManifest(catalogs: any[], componentOverrideMaps: any[]) {
  const routes: Record<string, any> = {};
  
  // Add routes from catalogs
  for (const cat of catalogs || []) {
    const r = cat?.routes || {};
    for (const [key, val] of Object.entries(r)) {
      routes[key] = val;
    }
  }
  
  // Apply component overrides (later sources win)
  for (const o of componentOverrideMaps || []) {
    const r = o || {};
    for (const [key, val] of Object.entries(r)) {
      routes[key] = val;
    }
  }
  
  return { version: "1.0.0", routes };
}
