import { getConfigValue, hasConfigValue } from '../config';

describe('Config API', () => {
  beforeEach(() => {
    // Reset window.RenderX before each test
    delete (globalThis as any).window;
    vi.clearAllMocks();
  });

  describe('getConfigValue', () => {
    it('should return undefined when window is not defined (SSR)', () => {
      expect(getConfigValue('API_KEY')).toBeUndefined();
    });

    it('should return undefined when RenderX is not available', () => {
      (globalThis as any).window = {};
      expect(getConfigValue('API_KEY')).toBeUndefined();
    });

    it('should return undefined when config is not available', () => {
      (globalThis as any).window = {
        RenderX: {},
      };
      expect(getConfigValue('API_KEY')).toBeUndefined();
    });

    it('should delegate to host config when available', () => {
      const mockConfig = {
        getValue: vi.fn().mockReturnValue('test-api-key'),
        hasValue: vi.fn(),
      };

      (globalThis as any).window = {
        RenderX: { config: mockConfig },
      };

      const result = getConfigValue('API_KEY');
      expect(result).toBe('test-api-key');
      expect(mockConfig.getValue).toHaveBeenCalledWith('API_KEY');
    });

    it('should return undefined for non-existent keys', () => {
      const mockConfig = {
        getValue: vi.fn().mockReturnValue(undefined),
        hasValue: vi.fn(),
      };

      (globalThis as any).window = {
        RenderX: { config: mockConfig },
      };

      const result = getConfigValue('NON_EXISTENT');
      expect(result).toBeUndefined();
      expect(mockConfig.getValue).toHaveBeenCalledWith('NON_EXISTENT');
    });

    it('should handle multiple calls with different keys', () => {
      const mockConfig = {
        getValue: vi.fn((key: string) => {
          if (key === 'API_KEY') return 'key-123';
          if (key === 'API_URL') return 'https://api.example.com';
          return undefined;
        }),
        hasValue: vi.fn(),
      };

      (globalThis as any).window = {
        RenderX: { config: mockConfig },
      };

      expect(getConfigValue('API_KEY')).toBe('key-123');
      expect(getConfigValue('API_URL')).toBe('https://api.example.com');
      expect(getConfigValue('OTHER')).toBeUndefined();
      expect(mockConfig.getValue).toHaveBeenCalledTimes(3);
    });
  });

  describe('hasConfigValue', () => {
    it('should return false when window is not defined (SSR)', () => {
      expect(hasConfigValue('API_KEY')).toBe(false);
    });

    it('should return false when RenderX is not available', () => {
      (globalThis as any).window = {};
      expect(hasConfigValue('API_KEY')).toBe(false);
    });

    it('should return false when config is not available', () => {
      (globalThis as any).window = {
        RenderX: {},
      };
      expect(hasConfigValue('API_KEY')).toBe(false);
    });

    it('should delegate to host config when available', () => {
      const mockConfig = {
        getValue: vi.fn(),
        hasValue: vi.fn().mockReturnValue(true),
      };

      (globalThis as any).window = {
        RenderX: { config: mockConfig },
      };

      const result = hasConfigValue('API_KEY');
      expect(result).toBe(true);
      expect(mockConfig.hasValue).toHaveBeenCalledWith('API_KEY');
    });

    it('should return false for non-existent keys', () => {
      const mockConfig = {
        getValue: vi.fn(),
        hasValue: vi.fn().mockReturnValue(false),
      };

      (globalThis as any).window = {
        RenderX: { config: mockConfig },
      };

      const result = hasConfigValue('NON_EXISTENT');
      expect(result).toBe(false);
      expect(mockConfig.hasValue).toHaveBeenCalledWith('NON_EXISTENT');
    });

    it('should handle multiple calls with different keys', () => {
      const mockConfig = {
        getValue: vi.fn(),
        hasValue: vi.fn((key: string) => {
          return key === 'API_KEY' || key === 'API_URL';
        }),
      };

      (globalThis as any).window = {
        RenderX: { config: mockConfig },
      };

      expect(hasConfigValue('API_KEY')).toBe(true);
      expect(hasConfigValue('API_URL')).toBe(true);
      expect(hasConfigValue('OTHER')).toBe(false);
      expect(mockConfig.hasValue).toHaveBeenCalledTimes(3);
    });
  });

  describe('Integration scenarios', () => {
    it('should work together - check before get', () => {
      const mockConfig = {
        getValue: vi.fn((key: string) => key === 'API_KEY' ? 'secret-key' : undefined),
        hasValue: vi.fn((key: string) => key === 'API_KEY'),
      };

      (globalThis as any).window = {
        RenderX: { config: mockConfig },
      };

      if (hasConfigValue('API_KEY')) {
        const value = getConfigValue('API_KEY');
        expect(value).toBe('secret-key');
      }

      expect(mockConfig.hasValue).toHaveBeenCalledWith('API_KEY');
      expect(mockConfig.getValue).toHaveBeenCalledWith('API_KEY');
    });

    it('should handle missing config gracefully', () => {
      (globalThis as any).window = {
        RenderX: {},
      };

      // Should not throw, just return safe defaults
      expect(() => {
        const has = hasConfigValue('API_KEY');
        const value = getConfigValue('API_KEY');
        expect(has).toBe(false);
        expect(value).toBeUndefined();
      }).not.toThrow();
    });
  });
});

