// ESLint custom rule: disallow logical fallback to console.* (e.g., (__MC_LOG || console.log))
// This prevents reintroduction of provenance-breaking patterns.

export default {
  rules: {
    'no-console-fallbacks': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow logical fallbacks to console.*',
          recommended: true,
        },
        schema: [],
        messages: {
          fallback: 'Do not use logical fallbacks to console.*; route logs through ConductorLogger shims instead.',
        },
      },
      create(context) {
        return {
          LogicalExpression(node) {
            if (node.operator !== '||') return;
            // Look for any MemberExpression on the right side with object named 'console'
            const right = node.right;
            if (
              right &&
              right.type === 'MemberExpression' &&
              right.object &&
              right.object.type === 'Identifier' &&
              right.object.name === 'console'
            ) {
              context.report({ node, messageId: 'fallback' });
            }
          },
        };
      },
    },
  },
};
