/**
 * Simple TypeScript fixture for testing basic extraction
 */

// Function declaration
function greet(name: string): string {
  return `Hello, ${name}!`;
}

// Arrow function
const add = (a: number, b: number): number => {
  return a + b;
};

// Exported function
export function multiply(x: number, y: number): number {
  return x * y;
}

// Class with methods
export class Calculator {
  public compute(a: number, b: number): number {
    const sum = add(a, b);
    const product = multiply(a, b);
    return sum + product;
  }

  private helper(value: number): number {
    return value * 2;
  }
}

// Const function
const divide = function(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Division by zero");
  }
  return a / b;
};

// Function with complex parameters
export function processData(
  data: string[],
  callback: (item: string) => void,
  options?: { verbose: boolean }
): void {
  data.forEach(callback);
}

