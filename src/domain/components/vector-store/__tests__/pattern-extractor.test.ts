import { PatternExtractor } from '../ai/pattern-extractor';

describe('PatternExtractor', () => {
  it('should extract button variant patterns from components', async () => {
    const extractor = new PatternExtractor();
    const components = [
      { type: 'Button', name: 'PrimaryButton', tags: ['primary'], styles: { color: 'blue' } },
      { type: 'Button', name: 'DangerButton', tags: ['danger'], styles: { color: 'red' } }
    ];
    const patterns = await extractor.extractPatterns(components);
    // Should find at least one pattern for button variants
    expect(patterns.some(p => p.name === 'Button Variant')).toBe(true);
  });

  it('should return an empty array if no patterns are found', async () => {
    const extractor = new PatternExtractor();
    const components = [
      { type: 'Label', name: 'InfoLabel', tags: ['info'], styles: { color: 'gray' } }
    ];
    const patterns = await extractor.extractPatterns(components);
    expect(patterns).toEqual([]);
  });
});
