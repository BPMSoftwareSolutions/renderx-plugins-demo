import { PatternExtractor, ExtractedPattern } from '../ai/pattern-extractor';

describe('PatternExtractor (async, spec-compliant)', () => {
  const components = [
    { type: 'Button', name: 'PrimaryButton', tags: ['primary'] },
    { type: 'Button', name: 'DangerButton', tags: ['danger'] },
    { type: 'Input', name: 'TextInput', tags: ['form', 'text'] },
  ];

  it('should extract button variant patterns', async () => {
    const extractor = new PatternExtractor();
    const patterns: ExtractedPattern[] = await extractor.extractPatterns(components);
    expect(patterns.some(p => p.name === 'Button Variant')).toBe(true);
    const buttonPattern = patterns.find(p => p.name === 'Button Variant');
    expect(buttonPattern?.components).toContain('PrimaryButton');
    expect(buttonPattern?.components).toContain('DangerButton');
    expect(buttonPattern?.frequency).toBe(2);
  });

  it('should return an empty array if no patterns are found', async () => {
    const extractor = new PatternExtractor();
    const patterns: ExtractedPattern[] = await extractor.extractPatterns([
      { type: 'Label', name: 'InfoLabel', tags: ['info'] }
    ]);
    expect(patterns).toEqual([]);
  });

  it('should analyze a pattern type', async () => {
    const extractor = new PatternExtractor();
    const pattern = await extractor.analyzePattern('Button Variant');
    expect(pattern.name).toBe('Button Variant');
    expect(pattern.description).toMatch(/Pattern for/);
  });

  it('should get pattern usage', async () => {
    const extractor = new PatternExtractor();
    const usage = await extractor.getPatternUsage('Button Variant');
    expect(Array.isArray(usage)).toBe(true);
  });
});
