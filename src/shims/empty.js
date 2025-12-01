// Empty shim for browser builds; used to alias Node-only modules.
export default {};
export const promises = {};
export const readFileSync = () => { throw new Error('Node-only API not available in browser'); };
export const writeFileSync = () => { throw new Error('Node-only API not available in browser'); };
export const existsSync = () => false;
