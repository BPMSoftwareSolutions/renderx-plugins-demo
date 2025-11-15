/**
 * ESLint rule to enforce timestamped logging in system files
 * System files should use the global __MC_* logging functions instead of direct console calls
 */

const rule = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce timestamped logging in system files - use global __MC_* functions instead of direct console calls",
      category: "Possible Errors",
      recommended: true,
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          files: {
            type: "array",
            items: { type: "string" },
            description: "File patterns that should use timestamped logging"
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      useTimestampedLogging: "Use timestamped logging: (globalThis as any).__MC_{{method.toUpperCase()}}?.(...) || console.{{method}}(...) instead of direct console.{{method}}(...)",
      useTimestampedGroup: "Use timestamped group logging: (globalThis as any).__MC_LOG?.(groupLabel) || console.log(groupLabel); before console.group(groupLabel)",
    },
  },
  create(context) {
    const filename = context.getFilename();
    const options = context.options[0] || {};
    const targetFiles = options.files || [
      "**/EventRouter.ts",
      "**/EventLogger.ts",
      "**/EventBus.ts"
    ];

    // Check if this file should use timestamped logging
    const shouldUseTimestampedLogging = targetFiles.some(pattern => {
      // Simple pattern matching - could be enhanced with glob matching
      const normalizedFilename = filename.replace(/\\/g, "/");
      const normalizedPattern = pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*");
      const regex = new RegExp(normalizedPattern + "$");
      return regex.test(normalizedFilename);
    });

    if (!shouldUseTimestampedLogging) {
      return {}; // Only apply to specified files
    }

    // Check if this console call is within a proper conditional guard (without else)
    function isInTimestampedOnlyGuard(node) {
      let parent = node.parent;
      while (parent) {
        if (parent.type === "IfStatement" && !parent.alternate) {
          const test = parent.test;
          // Check for if ((globalThis as any).__MC_*) pattern without else
          if (test && 
              test.type === "MemberExpression" &&
              test.object && 
              test.object.type === "TSAsExpression" &&
              test.object.expression &&
              test.object.expression.type === "Identifier" &&
              test.object.expression.name === "globalThis" &&
              test.property &&
              test.property.name &&
              test.property.name.startsWith("__MC_")) {
            // Check if this console call is in the if body (timestamped path)
            if (parent.consequent && isNodeInSubtree(node, parent.consequent)) {
              return true;
            }
          }
        }
        parent = parent.parent;
      }
      return false;
    }

    // Helper function to check if a node is within a subtree
    function isNodeInSubtree(targetNode, rootNode) {
      if (!rootNode) return false;
      
      function traverse(node) {
        if (node === targetNode) return true;
        
        for (const key in node) {
          if (key === 'parent') continue;
          const value = node[key];
          if (Array.isArray(value)) {
            for (const item of value) {
              if (item && typeof item === 'object' && traverse(item)) {
                return true;
              }
            }
          } else if (value && typeof value === 'object' && traverse(value)) {
            return true;
          }
        }
        return false;
      }
      
      return traverse(rootNode);
    }

    // Check if this is already using timestamped logging pattern
    function isAlreadyTimestamped(node) {
      let parent = node.parent;
      while (parent) {
        if (parent.type === "LogicalExpression" && parent.operator === "||") {
          const left = parent.left;
          if (left && left.type === "CallExpression" && left.callee && 
              left.callee.type === "MemberExpression" &&
              left.callee.object && left.callee.object.type === "MemberExpression" &&
              left.callee.object.property && left.callee.object.property.name === "__MC_LOG") {
            return true;
          }
          if (left && left.type === "CallExpression" && left.callee && 
              left.callee.type === "MemberExpression" &&
              left.callee.object && left.callee.object.type === "MemberExpression" &&
              left.callee.object.property && left.callee.object.property.name.startsWith("__MC_")) {
            return true;
          }
        }
        parent = parent.parent;
      }
      return false;
    }

    return {
      CallExpression(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.object.name === "console"
        ) {
          const method = node.callee.property.name;
          
          // Skip if this is already using the timestamped pattern
          if (isAlreadyTimestamped(node)) {
            return;
          }

          // Skip if this is within a timestamped-only guard (no fallback needed)
          if (isInTimestampedOnlyGuard(node)) {
            return;
          }

          if (method === "group" || method === "groupEnd") {
            // Allow console.group/groupEnd for dev tools grouping
            return;
          } else if (["log", "info", "warn", "error"].includes(method)) {
            context.report({
              node,
              messageId: "useTimestampedLogging",
              data: { method },
              fix(fixer) {
                const mcMethod = `__MC_${method.toUpperCase()}`;
                const sourceCode = context.getSourceCode();
                const nodeText = sourceCode.getText(node);
                
                // Extract the arguments
                const args = node.arguments;
                const argsText = args.map(arg => sourceCode.getText(arg)).join(", ");
                
                const replacement = `(globalThis as any).${mcMethod}?.(${argsText}) || ${nodeText}`;
                return fixer.replaceText(node, replacement);
              }
            });
          }
        }
      },
    };
  },
};

export default {
  rules: {
    'require-timestamped-logging': rule,
  },
};