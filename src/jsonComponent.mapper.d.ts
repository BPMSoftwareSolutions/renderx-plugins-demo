export type RuntimeTemplate = {
    tag: string;
    text?: string;
    classes: string[];
    css?: string;
    cssVariables?: Record<string, string | number>;
    cssLibrary?: string;
    cssVariablesLibrary?: Record<string, string | number>;
    attributes?: Record<string, string>;
    dimensions?: {
        width?: number;
        height?: number;
    };
    style?: Record<string, string>;
};
export declare function mapJsonComponentToTemplate(json: any): RuntimeTemplate;
//# sourceMappingURL=jsonComponent.mapper.d.ts.map