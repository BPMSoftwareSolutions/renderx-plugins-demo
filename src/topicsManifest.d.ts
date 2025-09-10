export interface TopicRoute {
    pluginId: string;
    sequenceId: string;
}
export interface TopicDef {
    routes: TopicRoute[];
    payloadSchema?: any;
    visibility?: 'public' | 'internal';
    correlationKeys?: string[];
    perf?: {
        throttleMs?: number;
        debounceMs?: number;
        dedupeWindowMs?: number;
    };
    notes?: string;
}
export declare function initTopicsManifest(): Promise<void>;
export declare function getTopicDef(key: string): TopicDef | undefined;
export declare function __setTopics(map: Record<string, TopicDef>): void;
export declare function getTopicsManifestStats(): {
    loaded: boolean;
    topicCount: number;
};
//# sourceMappingURL=topicsManifest.d.ts.map