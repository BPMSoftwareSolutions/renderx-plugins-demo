declare module "@babel/standalone" {
  export interface TransformResult {
    code: string;
    map?: unknown;
    ast?: unknown;
  }

  export function transform(
    code: string,
    options?: {
      presets?: (string | unknown)[];
      filename?: string;
      [key: string]: unknown;
    }
  ): TransformResult;
}

