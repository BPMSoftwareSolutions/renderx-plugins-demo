export default {
  rules: {
    "no-hardcoded-layout-styles": {
      meta: {
        type: "problem",
        docs: { description: "Disallow inline grid template styles outside src/layout/**" },
        schema: [],
        messages: {
          hardcoded: "Hardcoded layout style detected outside src/layout/** (issue #61)."
        }
      },
      create(context) {
        const filename = context.getFilename?.() || "";
        const isLayoutFile = /\/src\/layout\//.test(filename);
        const isAppFallback = /\/src\/App\.(t|j)sx?$/.test(filename);
        return (isLayoutFile || isAppFallback) ? {} : {
          Property(node) {
            const key = node.key && node.key.name;
            if (key === "gridTemplateColumns" || key === "gridTemplateAreas" || key === "gridTemplateRows") {
              context.report({ node, messageId: "hardcoded" });
            }
          }
        };
      }
    }
  }
};

