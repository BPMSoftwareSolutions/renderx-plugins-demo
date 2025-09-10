export type ConductorClient = any;
export declare function initConductor(): Promise<ConductorClient>;
export declare function loadJsonSequenceCatalogs(conductor: ConductorClient, pluginIds?: string[]): Promise<void>;
export declare function registerAllSequences(conductor: ConductorClient): Promise<void>;
export declare function useConductor(): ConductorClient;
//# sourceMappingURL=conductor.d.ts.map