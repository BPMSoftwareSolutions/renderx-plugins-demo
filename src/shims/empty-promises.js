// Empty shim for fs/promises in browser builds.
export const readFile = async () => { throw new Error('Node-only API not available in browser'); };
export const writeFile = async () => { throw new Error('Node-only API not available in browser'); };
export const access = async () => { throw new Error('Node-only API not available in browser'); };
export const mkdir = async () => { throw new Error('Node-only API not available in browser'); };
export default {};
