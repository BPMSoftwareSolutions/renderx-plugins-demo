/**
 * ESLint plugin: interaction-keys
 * - valid-keys: ensure resolveInteraction("<key>") uses a known key from the interaction manifest
 */
import fs from "node:fs";
import path from "node:path";

function loadManifestKeys(context) {
  try {
    const cwd = context.getCwd?.() || process.cwd();

    // Prefer public manifest if present; fallback to repo root
    const publicManifest = path.join(
      cwd,
      "public",
      "interaction-manifest.json"
    );
    const rootManifest = path.join(cwd, "interaction-manifest.json");

    let raw = "";
    if (fs.existsSync(publicManifest))
      raw = fs.readFileSync(publicManifest, "utf8");
    else raw = fs.readFileSync(rootManifest, "utf8");

    const json = JSON.parse(raw);
    const routes = json?.routes || {};
    return new Set(Object.keys(routes));
  } catch {
    return new Set();
  }
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function suggestClosest(key, keys) {
  const candidates = [];

  // First, look for keys that start with the same prefix
  const keyParts = key.split(".");
  const prefixMatches = [];

  for (const k of keys) {
    const kParts = k.split(".");
    let commonPrefix = 0;
    for (let i = 0; i < Math.min(keyParts.length, kParts.length); i++) {
      if (keyParts[i] === kParts[i]) {
        commonPrefix++;
      } else {
        break;
      }
    }

    const distance = levenshtein(key, k);
    candidates.push({
      key: k,
      distance,
      commonPrefix,
      isExtension: k.startsWith(key + "."), // e.g., "canvas.component.drag" -> "canvas.component.drag.move"
    });
  }

  // Sort by preference:
  // 1. Extensions first (key + suffix)
  // 2. Then by common prefix length (descending)
  // 3. Then by distance (ascending)
  candidates.sort((a, b) => {
    if (a.isExtension && !b.isExtension) return -1;
    if (!a.isExtension && b.isExtension) return 1;
    if (a.commonPrefix !== b.commonPrefix)
      return b.commonPrefix - a.commonPrefix;
    return a.distance - b.distance;
  });

  const best = candidates[0];
  if (best && best.distance <= 8) {
    // If there are multiple good extensions, show up to 3
    if (best.isExtension) {
      const extensions = candidates
        .filter((c) => c.isExtension && c.distance <= best.distance + 2)
        .slice(0, 3)
        .map((c) => c.key);

      if (extensions.length > 1) {
        return `${extensions.slice(0, -1).join("', '")}' or '${
          extensions[extensions.length - 1]
        }`;
      }
    }
    return best.key;
  }

  return null;
}

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Validate that resolveInteraction('<key>') uses a known interaction key from the manifest",
      recommended: true,
    },
    schema: [],
    messages: {
      nonLiteralKey: "resolveInteraction() requires a string literal key",
      unknownKey: "Unknown interaction key '{{key}}'.{{suggestion}}",
    },
  },

  create(context) {
    const filename = context.getFilename();

    // Only check code inside repo (ignore node_modules)
    if (filename.includes("node_modules")) {
      return {};
    }

    const keys = loadManifestKeys(context);

    function checkCallExpression(node) {
      // Match resolveInteraction("<key>")
      if (
        node.callee &&
        ((node.callee.type === "Identifier" &&
          node.callee.name === "resolveInteraction") ||
          (node.callee.type === "MemberExpression" &&
            node.callee.property &&
            node.callee.property.name === "resolveInteraction"))
      ) {
        const arg = node.arguments && node.arguments[0];
        if (!arg || arg.type !== "Literal" || typeof arg.value !== "string") {
          context.report({ node: arg || node, messageId: "nonLiteralKey" });
          return;
        }
        const key = arg.value;
        if (!keys.has(key)) {
          const suggestion = suggestClosest(key, keys);
          context.report({
            node: arg,
            messageId: "unknownKey",
            data: {
              key,
              suggestion: suggestion ? ` Did you mean '${suggestion}'?` : "",
            },
          });
        }
      }
    }

    return {
      CallExpression: checkCallExpression,
    };
  },
};

export default {
  rules: {
    "valid-keys": rule,
  },
};
