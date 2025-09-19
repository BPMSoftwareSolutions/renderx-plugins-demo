/**
 * ESLint rule to detect drag and drop operations that don't properly preserve component templates
 * This prevents "Missing component template" errors during library-to-canvas drag operations
 */

export default {
  rules: {
    "component-template-preservation": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Ensure drag and drop operations preserve component templates to prevent 'Missing component template' errors",
          category: "Possible Errors",
          recommended: true,
        },
        schema: [],
        messages: {
          missingTemplateCheck:
            "Drop handler must validate component.template exists before creating canvas component",
          incompleteComponentData:
            "Drag handler should include complete component data (including template) in dataTransfer",
          unsafeDataTransfer:
            "DataTransfer.setData should include component.template to prevent template loss during drag",
        },
      },
      create(context) {
        const filename = context.getFilename();

        // Only apply to files that might handle drag/drop operations
        const isRelevantFile =
          filename.includes("drag") ||
          filename.includes("drop") ||
          filename.includes("dnd") ||
          filename.includes("library") ||
          filename.includes("canvas") ||
          filename.includes("component");

        if (!isRelevantFile) {
          return {};
        }

        return {
          // Detect drag event handlers
          CallExpression(node) {
            // Check for dataTransfer.setData calls
            if (
              node.callee.type === "MemberExpression" &&
              node.callee.object.type === "Identifier" &&
              node.callee.object.name === "dataTransfer" &&
              node.callee.property.name === "setData"
            ) {
              const args = node.arguments;
              if (args.length >= 2) {
                const dataArg = args[1];

                // Check if the data being transferred includes component template
                if (
                  dataArg.type === "ObjectExpression" &&
                  !hasComponentTemplateProperty(dataArg)
                ) {
                  context.report({
                    node,
                    messageId: "incompleteComponentData",
                  });
                }
              }
            }

            // Check for drag event handlers that don't preserve component data
            if (
              node.callee.type === "MemberExpression" &&
              node.callee.property.name === "addEventListener" &&
              node.arguments.length >= 2
            ) {
              const eventType = node.arguments[0];
              const handler = node.arguments[1];

              if (
                eventType.type === "Literal" &&
                eventType.value === "dragstart"
              ) {
                // Check if handler accesses component data
                if (
                  handler.type === "FunctionExpression" ||
                  handler.type === "ArrowFunctionExpression"
                ) {
                  const body = handler.body;
                  if (!preservesComponentData(body)) {
                    context.report({
                      node: handler,
                      messageId: "incompleteComponentData",
                    });
                  }
                }
              }
            }
          },

          // Detect drop event handlers that don't validate templates
          FunctionDeclaration(node) {
            if (isDropHandler(node)) {
              const body = node.body;
              if (!validatesComponentTemplate(body)) {
                context.report({
                  node,
                  messageId: "missingTemplateCheck",
                });
              }
            }
          },

          // Detect arrow function drop handlers
          VariableDeclarator(node) {
            if (
              node.init &&
              (node.init.type === "ArrowFunctionExpression" ||
                node.init.type === "FunctionExpression") &&
              isDropHandler(node)
            ) {
              const body = node.init.body;
              if (!validatesComponentTemplate(body)) {
                context.report({
                  node: node.init,
                  messageId: "missingTemplateCheck",
                });
              }
            }
          },
        };

        // Helper functions
        function hasComponentTemplateProperty(objExpr) {
          if (!objExpr || !objExpr.properties) return false;
          return objExpr.properties.some(
            (prop) =>
              prop.type === "Property" &&
              prop.key.type === "Identifier" &&
              prop.key.name === "template"
          );
        }

        function preservesComponentData(body) {
          // Check if the function body accesses component properties
          let accessesComponent = false;
          let accessesTemplate = false;

          function checkNode(node, visited = new Set()) {
            if (!node || typeof node !== "object" || visited.has(node)) return;
            visited.add(node);

            // Look for component.template access
            if (
              node.type === "MemberExpression" &&
              node.object.type === "Identifier" &&
              node.object.name === "component"
            ) {
              accessesComponent = true;
              if (
                node.property.type === "Identifier" &&
                node.property.name === "template"
              ) {
                accessesTemplate = true;
              }
            }

            // Only traverse specific node types to avoid infinite recursion
            const traversableKeys = ["body", "expression", "consequent", "alternate", "test", "arguments", "elements"];

            for (const key of traversableKeys) {
              if (node[key]) {
                if (Array.isArray(node[key])) {
                  node[key].forEach(child => checkNode(child, visited));
                } else {
                  checkNode(node[key], visited);
                }
              }
            }

            visited.delete(node);
          }

          checkNode(body);
          return accessesComponent && accessesTemplate;
        }

        function isDropHandler(node) {
          const name = node.id ? node.id.name : node.id && node.id.name;
          return (
            name &&
            (name.includes("drop") ||
              name.includes("handleDrop") ||
              name.includes("onDrop"))
          );
        }

        function validatesComponentTemplate(body) {
          // Check if the function validates component.template exists
          let hasTemplateCheck = false;

          function checkNode(node, visited = new Set()) {
            if (!node || typeof node !== "object" || visited.has(node)) return;
            visited.add(node);

            // Look for checks like: component.template, component?.template, etc.
            if (
              node.type === "MemberExpression" &&
              node.object.type === "Identifier" &&
              node.object.name === "component" &&
              node.property.type === "Identifier" &&
              node.property.name === "template"
            ) {
              hasTemplateCheck = true;
            }

            // Look for conditional checks
            if (
              node.type === "IfStatement" ||
              node.type === "ConditionalExpression"
            ) {
              checkNode(node.test, visited);
            }

            // Only traverse specific node types to avoid infinite recursion
            const traversableKeys = ["body", "expression", "consequent", "alternate", "test", "arguments", "elements"];

            for (const key of traversableKeys) {
              if (node[key]) {
                if (Array.isArray(node[key])) {
                  node[key].forEach(child => checkNode(child, visited));
                } else {
                  checkNode(node[key], visited);
                }
              }
            }

            visited.delete(node);
          }

          checkNode(body);
          return hasTemplateCheck;
        }
      },
    },
  },
};