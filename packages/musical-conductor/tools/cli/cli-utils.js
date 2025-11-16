const fs = require('fs');
const path = require('path');

function parseArgs(args) {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      let value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      if (typeof value === 'string' && value.startsWith('{') && !value.endsWith('}')) {
        let j = i + 2;
        while (j < args.length && !args[j].includes('}')) j++;
        if (j < args.length) {
          const parts = [args[i + 1]];
          for (let k = i + 2; k <= j; k++) parts.push(args[k]);
          value = parts.join(' ');
          i = j;
        }
      }

      result[key] = value;
      if (value !== true) i++;
    }
  }
  return result;
}

function parseContextString(s) {
  if (!s || s === true) return {};
  try { return JSON.parse(s); } catch {
    try {
      const vm = require('vm');
      return vm.runInNewContext('(' + s + ')', {}, { timeout: 1000 });
    } catch {
      try {
        // First add quotes around keys (simple and safe)
        const quoteKeys = s.replace(/([,{]\s*)([A-Za-z_][A-Za-z0-9_-]*)\s*:/g, '$1"$2":');

        // We'll walk the string and quote bareword values safely, respecting nesting
        let out = '';
        let depth = 0;
        let inString = false;
        let stringQuote = '';

        for (let i = 0; i < quoteKeys.length; i++) {
          const ch = quoteKeys[i];
          out += ch;

          if (inString) {
            if (ch === stringQuote) {
              inString = false;
              stringQuote = '';
            } else if (ch === '\\') {
              // skip escaped quote
              i++; out += quoteKeys[i] || '';
            }
            continue;
          }

          if (ch === '"' || ch === "'") {
            inString = true;
            stringQuote = ch;
            continue;
          }

          if (ch === '{') {
            depth++;
            continue;
          }

          if (ch === '}') {
            depth = Math.max(0, depth - 1);
            continue;
          }

          // Handle colon at any depth - attempt to normalize following bareword token
          if (ch === ':') {
            // peek next non-space
            let j = i + 1;
            while (j < quoteKeys.length && /\s/.test(quoteKeys[j])) j++;
            if (j >= quoteKeys.length) continue;

            const next = quoteKeys[j];
            // if value starts with {, [, quote or number/true/false/null - skip
            if (next === '{' || next === '[' || next === '"' || next === "'" || /[0-9\-]/.test(next)) continue;
            const wordStart = j;

            // collect until comma or closing brace at same depth
            let k = j;
            let innerDepth = 0;
            while (k < quoteKeys.length) {
              const c = quoteKeys[k];
              if (c === '{') innerDepth++;
              if (c === '}') {
                if (innerDepth === 0) break;
                innerDepth--; }
              if (c === ',' && innerDepth === 0) break;
              k++;
            }

            const token = quoteKeys.slice(wordStart, k).trim();
            if (!token) continue;
            // if token is boolean/null/number leave alone
            if (token === 'true' || token === 'false' || token === 'null' || /^[0-9]+$/.test(token)) continue;
            // if already quoted, continue
            if (/^\".*\"$/.test(token) || /^\'.*\'$/.test(token)) continue;

            // otherwise, insert quotes around token in the output
            out = out.slice(0, out.length - 1); // remove ':' from out
            out += ':' + '"' + token.replace(/"/g, '\\"') + '"';
            // skip ahead in main loop
            i = k - 1;
          }
        }

        return JSON.parse(out);
      } catch (err3) {
        throw new Error('Failed to parse context JSON or object literal: ' + err3.message);
      }
    }
  }
}

function parseContextFile(file) {
  const fullPath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  const raw = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(raw);
}

module.exports = { parseArgs, parseContextString, parseContextFile };
