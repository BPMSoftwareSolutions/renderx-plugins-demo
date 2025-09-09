export type FlagStatus = "on" | "off" | "experiment";
export interface FlagMeta {
    status: FlagStatus;
    created: string;
    verified?: string;
    description?: string;
    owner?: string;
}
export declare function isFlagEnabled(id: string): boolean;
export declare function getFlagMeta(id: string): FlagMeta | undefined;
export declare function getAllFlags(): Record<string, FlagMeta>;
export declare function getUsageLog(): {
    id: string;
    when: number;
}[];
export declare function setFlagOverride(id: string, enabled: boolean): void;
export declare function clearFlagOverrides(): void;
//# sourceMappingURL=flags.d.ts.map