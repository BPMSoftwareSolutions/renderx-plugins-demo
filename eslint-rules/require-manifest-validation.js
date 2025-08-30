export default {
  rules: {
    "require-manifest-validation": {
      meta: {
        type: "problem",
        docs: { description: "Require validateLayoutManifest to be called before using manifest in LayoutEngine" },
        schema: [],
        messages: {
          required: "validateLayoutManifest(manifest) must be called in LayoutEngine before use (issue #61)."
        }
      },
      create(context) {
        const filename = context.getFilename?.() || "";
        if (!/\/src\/layout\/LayoutEngine\.(t|j)sx?$/.test(filename)) return {};
        let sawValidateCall = false;
        return {
          CallExpression(node) {
            const src = context.sourceCode.getText(node);
            if (src.includes("validateLayoutManifest")) sawValidateCall = true;
          },
          'Program:exit'() {
            if (!sawValidateCall) {
              context.report({ loc: { line: 1, column: 0 }, messageId: "required" });
            }
          }
        };
      }
    }
  }
};

