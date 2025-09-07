export const ARTIFACT_SCHEMA_VERSION = '1.0.0';
export const MANIFEST_VERSION = '1.0.0';
export function withSchema(obj){ return { schemaVersion: ARTIFACT_SCHEMA_VERSION, ...obj }; }
