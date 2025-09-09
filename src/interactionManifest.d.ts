type Route = {
    pluginId: string;
    sequenceId: string;
};
export declare function initInteractionManifest(): Promise<void>;
export declare function resolveInteraction(key: string): Route;
export declare function getInteractionManifestStats(): {
    loaded: boolean;
    routeCount: number;
};
export {};
//# sourceMappingURL=interactionManifest.d.ts.map