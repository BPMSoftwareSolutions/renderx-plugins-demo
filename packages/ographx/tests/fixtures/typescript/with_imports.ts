/**
 * TypeScript fixture with imports and cross-file references
 */

import { Calculator } from './simple';
import { processData } from './simple';
import { greet as sayHello } from './simple';

// Function using imported types
export function orchestrate(calc: Calculator, data: string[]): number {
  const result = calc.compute(5, 3);
  
  processData(data, (item) => {
    console.log(sayHello(item));
  });
  
  return result;
}

// Function with generic types
export function transform<T, U>(
  items: T[],
  mapper: (item: T) => U
): U[] {
  return items.map(mapper);
}

// Function with union types
export function handle(value: string | number | boolean): void {
  if (typeof value === 'string') {
    console.log(value.toUpperCase());
  } else if (typeof value === 'number') {
    console.log(value * 2);
  } else {
    console.log(!value);
  }
}

// Complex nested calls
export function pipeline(input: string): number {
  const calc = new Calculator();
  const greeting = sayHello(input);
  const data = [greeting];
  const orchestrated = orchestrate(calc, data);
  return orchestrated;
}

