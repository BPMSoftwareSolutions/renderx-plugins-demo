import { TemplateDiscoveryService } from '../ai/template-discovery';

describe('TemplateDiscoveryService', () => {
  it('should detect an exact match for a known component type', () => {
    const service = new TemplateDiscoveryService();
    // Simulate a library with a Button component
    service['componentLibrary'] = [
      { type: 'Button', name: 'PrimaryButton', tags: ['primary', 'action'] }
    ];
    const result = service.findExactMatch('Button');
    expect(result).not.toBeNull();
    expect(result?.component.type).toBe('Button');
    expect(result?.confidence).toBeGreaterThan(0.9);
  });

  it('should return null for a non-existent component type', () => {
    const service = new TemplateDiscoveryService();
    service['componentLibrary'] = [
      { type: 'Button', name: 'PrimaryButton', tags: ['primary', 'action'] }
    ];
    const result = service.findExactMatch('Input');
    expect(result).toBeNull();
  });

  it('should rank similar components by relevance', () => {
    const service = new TemplateDiscoveryService();
    service['componentLibrary'] = [
      { type: 'Button', name: 'PrimaryButton', tags: ['primary', 'action'] },
      { type: 'Button', name: 'SecondaryButton', tags: ['secondary'] },
      { type: 'Input', name: 'TextInput', tags: ['form', 'text'] }
    ];
    const results = service.rankSimilarComponents('button');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].component.type).toBe('Button');
    expect(results[0].score).toBeGreaterThanOrEqual(0.5);
    expect(typeof results[0].explanation).toBe('string');
  });
});
