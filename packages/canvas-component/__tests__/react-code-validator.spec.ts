import { describe, it, expect } from 'vitest';
import { validateReactCode, validateReactCodeOrThrow } from '../src/symphonies/create/react-code-validator';

describe('React Code Validator', () => {
  let _ctx: any;
  beforeEach(() => {
    ctx = {
      handler: null, // TODO: Import handler
      mocks: {
        database: vi.fn(),
        fileSystem: vi.fn(),
        logger: vi.fn(),
        eventBus: vi.fn()
      },
      input: {},
      output: null,
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  describe('Valid React Code', () => {
    it('should validate simple React component', () => {
      const code = `function Hello() {
        return React.createElement('div', null, 'Hello');
      }`;
      const result = validateReactCode(code);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate JSX component', () => {
      const code = `export default function Hello() {
        return <div>Hello</div>;
      }`;
      const result = validateReactCode(code);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate component with hooks', () => {
      const code = `export default function Counter() {
        const [count, setCount] = React.useState(0);
        return <div>{count}</div>;
      }`;
      const result = validateReactCode(code);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate component with template literals', () => {
      const code = `export default function Styled() {
        const style = \`color: red;\`;
        return <div style={{color: 'red'}}>Text</div>;
      }`;
      const result = validateReactCode(code);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Invalid React Code - Syntax Errors', () => {
    it('should detect unmatched closing braces', () => {
      const code = `export default function Hello() {
        return <div>Hello</div>;
      }}`;
      const result = validateReactCode(code);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('braces'))).toBe(true);
    });

    it('should detect unmatched opening braces', () => {
      const code = `export default function Hello() {
        return <div>Hello</div>;`;
      const result = validateReactCode(code);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('braces'))).toBe(true);
    });

    it('should detect unclosed template literals', () => {
      const code = `export default function Hello() {
        const str = \`unclosed;
        return <div>Hello</div>;
      }`;
      const result = validateReactCode(code);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('template literal'))).toBe(true);
    });

    it('should detect unclosed single-quoted strings', () => {
      const code = `export default function Hello() {
        const str = 'unclosed;
        return <div>Hello</div>;
      }`;
      const result = validateReactCode(code);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('single-quoted'))).toBe(true);
    });

    it('should detect unclosed double-quoted strings', () => {
      const code = `export default function Hello() {
        const str = "unclosed;
        return <div>Hello</div>;
      }`;
      const result = validateReactCode(code);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('double-quoted'))).toBe(true);
    });

    it('should detect unmatched parentheses', () => {
      const code = `export default function Hello() {
        return <div onClick={(e => console.log(e)}>Hello</div>;
      }(((`;
      const result = validateReactCode(code);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('parentheses'))).toBe(true);
    });

    it('should detect typo in React.createElement', () => {
      const code = `export default function Hello() {
        return React.createElemen('div', null, 'Hello');
      }`;
      const result = validateReactCode(code);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Typo'))).toBe(true);
    });

    it('should detect unclosed JSX tags as invalid', () => {
      const code = `export default function Broken() {
        return <div><span>Missing close</div>;
      }`;
      const result = validateReactCode(code);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.toLowerCase().includes('jsx'))).toBe(true);
    });
  });

  describe('Invalid React Code - Empty/Invalid Input', () => {
    it('should reject empty string', () => {
      const result = validateReactCode('');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('non-empty'))).toBe(true);
    });

    it('should reject null', () => {
      const result = validateReactCode(null as any);
      expect(result.valid).toBe(false);
    });

    it('should reject undefined', () => {
      const result = validateReactCode(undefined as any);
      expect(result.valid).toBe(false);
    });
  });

  describe('Warnings', () => {
    it('should warn about mixed React.createElement and JSX', () => {
      const code = `export default function Hello() {
        return React.createElement('div', null, <span>Hello</span>);
      }`;
      const result = validateReactCode(code);
      expect(result.warnings.some(w => w.includes('mixes'))).toBe(true);
    });
  });

  describe('validateReactCodeOrThrow', () => {
    it('should throw on invalid code', () => {
      const code = `export default function Hello() {
        return <div>Hello</div>;
      }}`;
      expect(() => validateReactCodeOrThrow(code)).toThrow();
    });

    it('should not throw on valid code', () => {
      const code = `export default function Hello() {
        return <div>Hello</div>;
      }`;
      expect(() => validateReactCodeOrThrow(code)).not.toThrow();
    });
  });
});

