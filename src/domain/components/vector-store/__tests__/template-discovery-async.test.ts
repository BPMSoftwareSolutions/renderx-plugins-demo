import { TemplateDiscoveryService, JsonComponent, ExactMatchResult } from '../ai/template-discovery';

describe('TemplateDiscoveryService (async, spec-compliant)', () => {
  const componentLibrary: JsonComponent[] = [
    { type: 'Button', name: 'PrimaryButton', tags: ['primary', 'action'] },
    { type: 'Input', name: 'TextInput', tags: ['form', 'text'] },
  ];

  it('should detect an exact match for a button prompt', async () => {
    const service = new TemplateDiscoveryService();
    service.componentLibrary = componentLibrary;
    const result: ExactMatchResult = await service.detectExactMatch('Create a button component');
    expect(result.found).toBe(true);
    expect(result.component?.type).toBe('Button');
    expect(result.confidence).toBeGreaterThanOrEqual(0.95);
    expect(result.reason).toMatch(/Exact match/);
  });

  it('should detect an exact match for an input prompt', async () => {
    const service = new TemplateDiscoveryService();
    service.componentLibrary = componentLibrary;
    const result: ExactMatchResult = await service.detectExactMatch('I need an input field');
    expect(result.found).toBe(true);
    expect(result.component?.type).toBe('Input');
    expect(result.confidence).toBeGreaterThanOrEqual(0.95);
  });

  it('should return not found for a custom widget prompt', async () => {
    const service = new TemplateDiscoveryService();
    service.componentLibrary = componentLibrary;
    const result: ExactMatchResult = await service.detectExactMatch('Make a custom widget');
    expect(result.found).toBe(false);
    expect(result.component).toBeNull();
    expect(result.confidence).toBe(0);
    expect(result.reason).toMatch(/No exact match/);
  });
});
