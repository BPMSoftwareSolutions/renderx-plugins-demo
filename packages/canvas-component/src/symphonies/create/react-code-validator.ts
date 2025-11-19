/**
 * React Code Validator
 * Validates React component code before compilation to catch syntax errors early
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates React component code for common syntax errors
 * This catches issues that would otherwise fail silently during compilation
 */
export function validateReactCode(code: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!code || typeof code !== 'string') {
    errors.push('React code must be a non-empty string');
    return { valid: false, errors, warnings };
  }

  // Check for unmatched braces/brackets (excluding those in strings)
  // Simple heuristic: count unescaped braces/brackets/parens
  const braceCount = (code.match(/{/g) || []).length - (code.match(/}/g) || []).length;
  const bracketCount = (code.match(/\[/g) || []).length - (code.match(/\]/g) || []).length;

  // For parentheses, be more lenient - they're often used in function calls
  // Only flag if there's a significant imbalance (more than 2)
  const parenCount = Math.abs((code.match(/\(/g) || []).length - (code.match(/\)/g) || []).length);
  const hasSignificantParenMismatch = parenCount > 2;

  if (braceCount !== 0) {
    errors.push(`Unmatched braces: ${braceCount > 0 ? 'missing' : 'extra'} closing braces`);
  }
  if (bracketCount !== 0) {
    errors.push(`Unmatched brackets: ${bracketCount > 0 ? 'missing' : 'extra'} closing brackets`);
  }
  if (hasSignificantParenMismatch) {
    errors.push(`Unmatched parentheses: significant mismatch detected`);
  }

  // Check for unclosed template literals (backticks)
  const backtickCount = (code.match(/`/g) || []).length;
  if (backtickCount % 2 !== 0) {
    errors.push('Unclosed template literal (backtick)');
  }

  // Check for unclosed strings
  const singleQuoteCount = (code.match(/(?<!\\)'/g) || []).length;
  const doubleQuoteCount = (code.match(/(?<!\\)"/g) || []).length;

  if (singleQuoteCount % 2 !== 0) {
    errors.push('Unclosed single-quoted string');
  }
  if (doubleQuoteCount % 2 !== 0) {
    errors.push('Unclosed double-quoted string');
  }

  // Check for common JSX issues
  if (code.includes('<') && code.includes('>')) {
    // Check for unclosed JSX tags
    const jsxTagRegex = /<([A-Z][a-zA-Z0-9]*|[a-z]+)(?:\s[^>]*)?\s*\/?\s*>/g;
    const openTags = code.match(/<([A-Z][a-zA-Z0-9]*|[a-z]+)(?:\s[^>]*)?\s*(?<!\/)\s*>/g) || [];
    const closeTags = code.match(/<\/([A-Z][a-zA-Z0-9]*|[a-z]+)\s*>/g) || [];
    
    if (openTags.length !== closeTags.length) {
      warnings.push('Possible unclosed JSX tags detected');
    }
  }

  // Check for invalid arrow function syntax
  if (code.includes('=>')) {
    const arrowFunctionRegex = /\([^)]*\)\s*=>\s*{/g;
    const invalidArrowRegex = /=>\s*(?!{|\(|[a-zA-Z_$])/g;
    
    if (invalidArrowRegex.test(code)) {
      warnings.push('Possible invalid arrow function syntax');
    }
  }

  // Check for React.createElement vs JSX consistency
  if (code.includes('React.createElement') && code.includes('<')) {
    warnings.push('Code mixes React.createElement and JSX syntax');
  }

  // Check for missing return statement in function
  const funcMatch = code.match(/function\s+\w+\s*\([^)]*\)\s*{([^}]*)}/);
  if (funcMatch && !funcMatch[1].includes('return')) {
    warnings.push('Function may be missing a return statement');
  }

  // Check for common typos (but not if it's part of createElement)
  if (code.includes('React.createElemen') && !code.includes('React.createElement')) {
    errors.push('Typo detected: "React.createElemen" should be "React.createElement"');
  }
  if (code.includes('useState(')) {
    if (!code.includes('React.useState') && !code.includes('import')) {
      warnings.push('useState used but React may not be in scope');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates React component code and throws if invalid
 * @throws Error if validation fails
 */
export function validateReactCodeOrThrow(code: string): void {
  const result = validateReactCode(code);
  if (!result.valid) {
    throw new Error(`React code validation failed:\n${result.errors.join('\n')}`);
  }
}

