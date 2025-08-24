/**
 * ESLint rule to prevent direct console usage in symphony handlers
 * Symphony handlers should use ctx.logger instead of console for proper orchestration
 */

const rule = {
  meta: {
    type: "problem",
    docs: {
      description: "Prevent direct console usage in symphony handlers - use ctx.logger instead",
      category: "Possible Errors",
      recommended: true,
    },
    fixable: "code",
    schema: [],
    messages: {
      noConsole: "Symphony handlers must not use console.{{method}} - use ctx.logger.{{method}} instead for proper orchestration",
    },
  },
  create(context) {
    const filename = context.getFilename();
    const isSymphonyFile = filename.includes('.symphony.') || filename.includes('/symphonies/');

    if (!isSymphonyFile) {
      return {}; // Only apply to symphony files
    }

    return {
      CallExpression(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.object.name === "console"
        ) {
          const method = node.callee.property.name;

          context.report({
            node,
            messageId: "noConsole",
            data: { method },
            fix(fixer) {
              // Auto-fix: replace console.method with ctx.logger?.method
              const sourceCode = context.getSourceCode();
              const consoleCall = sourceCode.getText(node.callee);
              const replacement = consoleCall.replace('console.', 'ctx.logger?.');

              return fixer.replaceText(node.callee, replacement);
            }
          });
        }
      },
    };
  },
};

export default {
  rules: {
    "no-console-in-symphonies": rule,
  },
};
