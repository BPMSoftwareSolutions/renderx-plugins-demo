export type TagRule = {
    when?: string;
    tag: string;
} | {
    when?: string;
    tagFrom: {
        path: string;
        validateIn?: string[];
        fallback: string;
    };
} | {
    defaultTag: string;
};
export type MapperConfig = {
    version: string;
    defaults: {
        tagRules: TagRule[];
    };
};
export declare function loadConfigFromWindow(): void;
export declare function setConfig(cfg: MapperConfig): void;
export declare function getConfig(): MapperConfig;
export declare function getTagForType(type: string | undefined | null): string;
export declare function computeTagFromJson(json: any): string;
//# sourceMappingURL=mapper.d.ts.map