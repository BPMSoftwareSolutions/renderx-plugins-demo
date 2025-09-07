/**
 * ESLint rule: no-dynamic-import-ts-extension
 * Disallows dynamic import paths ending with .ts or .tsx
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow dynamic import paths ending with .ts or .tsx',
      category: 'Possible Errors',
      recommended: true
    },
    messages: {
      noTsImport: 'Dynamic import path should not end with .ts or .tsx. Use .js for runtime.'
    },
    schema: []
  },
  create(context) {
    return {
      ImportExpression(node) {
        if (
          node.source &&
          node.source.type === 'Literal' &&
          typeof node.source.value === 'string' &&
          /\.tsx?$/.test(node.source.value)
        ) {
          context.report({
            node,
            messageId: 'noTsImport'
          });
        }
      }
    };
  }
};
