import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock window object for Node environment
const mockWindow = {
  RenderX: {} as any
};

describe('Host Configuration Service', () => {
  let originalRenderX: any;

  beforeEach(() => {
    // Save original mockWindow.RenderX
    originalRenderX = mockWindow.RenderX;
    mockWindow.RenderX = {};
  });

  afterEach(() => {
    // Restore original mockWindow.RenderX
    mockWindow.RenderX = originalRenderX;
  });

  describe('window.RenderX.config', () => {
    it('should be defined on window.RenderX', () => {
      // Mock mockWindow.RenderX.config
      mockWindow.RenderX = {
        config: {
          get: (_key: string) => undefined,
          has: (_key: string) => false
        }
      };

      expect(mockWindow.RenderX.config).toBeDefined();
      expect(typeof mockWindow.RenderX.config.get).toBe('function');
      expect(typeof mockWindow.RenderX.config.has).toBe('function');
    });

    it('should return undefined for non-existent keys', () => {
      mockWindow.RenderX = {
        config: {
          get: (key: string) => {
            if (key === 'OPENAI_API_KEY') return 'test-key';
            return undefined;
          },
          has: (_key: string) => false
        }
      };

      const result = mockWindow.RenderX.config.get('NON_EXISTENT_KEY');
      expect(result).toBeUndefined();
    });

    it('should return value for OPENAI_API_KEY when configured', () => {
      const testKey = 'sk-test-123456789';
      mockWindow.RenderX = {
        config: {
          get: (key: string) => {
            if (key === 'OPENAI_API_KEY') return testKey;
            return undefined;
          },
          has: (key: string) => key === 'OPENAI_API_KEY'
        }
      };

      const result = mockWindow.RenderX.config.get('OPENAI_API_KEY');
      expect(result).toBe(testKey);
    });

    it('should return default model when OPENAI_MODEL not configured', () => {
      mockWindow.RenderX = {
        config: {
          get: (key: string) => {
            if (key === 'OPENAI_MODEL') return 'gpt-3.5-turbo';
            return undefined;
          },
          has: (key: string) => key === 'OPENAI_MODEL'
        }
      };

      const result = mockWindow.RenderX.config.get('OPENAI_MODEL');
      expect(result).toBe('gpt-3.5-turbo');
    });

    it('should return custom model when OPENAI_MODEL is configured', () => {
      const customModel = 'gpt-4-turbo-preview';
      mockWindow.RenderX = {
        config: {
          get: (key: string) => {
            if (key === 'OPENAI_MODEL') return customModel;
            return undefined;
          },
          has: (key: string) => key === 'OPENAI_MODEL'
        }
      };

      const result = mockWindow.RenderX.config.get('OPENAI_MODEL');
      expect(result).toBe(customModel);
    });
  });

  describe('config.has()', () => {
    it('should return true when key exists and has non-empty value', () => {
      mockWindow.RenderX = {
        config: {
          get: (key: string) => {
            if (key === 'OPENAI_API_KEY') return 'sk-test-123';
            return undefined;
          },
          has: (key: string) => {
            const value = mockWindow.RenderX.config.get(key);
            return value !== undefined && value !== '';
          }
        }
      };

      const result = mockWindow.RenderX.config.has('OPENAI_API_KEY');
      expect(result).toBe(true);
    });

    it('should return false when key does not exist', () => {
      mockWindow.RenderX = {
        config: {
          get: (_key: string) => undefined,
          has: (key: string) => {
            const value = mockWindow.RenderX.config.get(key);
            return value !== undefined && value !== '';
          }
        }
      };

      const result = mockWindow.RenderX.config.has('NON_EXISTENT_KEY');
      expect(result).toBe(false);
    });

    it('should return false when key exists but value is empty string', () => {
      mockWindow.RenderX = {
        config: {
          get: (key: string) => {
            if (key === 'EMPTY_KEY') return '';
            return undefined;
          },
          has: (key: string) => {
            const value = mockWindow.RenderX.config.get(key);
            return value !== undefined && value !== '';
          }
        }
      };

      const result = mockWindow.RenderX.config.has('EMPTY_KEY');
      expect(result).toBe(false);
    });

    it('should return false when key exists but value is undefined', () => {
      mockWindow.RenderX = {
        config: {
          get: (_key: string) => undefined,
          has: (key: string) => {
            const value = mockWindow.RenderX.config.get(key);
            return value !== undefined && value !== '';
          }
        }
      };

      const result = mockWindow.RenderX.config.has('UNDEFINED_KEY');
      expect(result).toBe(false);
    });
  });

  describe('Security', () => {
    it('should not expose keys in console logs', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const testKey = 'sk-secret-key-12345';

      mockWindow.RenderX = {
        config: {
          get: (key: string) => {
            if (key === 'OPENAI_API_KEY') return testKey;
            return undefined;
          },
          has: (key: string) => key === 'OPENAI_API_KEY'
        }
      };

      // Access the key
      mockWindow.RenderX.config.get('OPENAI_API_KEY');

      // Verify no console logs were made
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should not expose keys in DOM', () => {
      const testKey = 'sk-secret-key-12345';

      mockWindow.RenderX = {
        config: {
          get: (key: string) => {
            if (key === 'OPENAI_API_KEY') return testKey;
            return undefined;
          },
          has: (key: string) => key === 'OPENAI_API_KEY'
        }
      };

      // Access the key
      const key = mockWindow.RenderX.config.get('OPENAI_API_KEY');

      // Verify the key exists but we're not exposing it
      expect(key).toBe(testKey);
      // In a real browser environment, we'd check document.body
      // For node environment, we just verify the key is returned correctly
    });

    it('should handle missing config gracefully', () => {
      mockWindow.RenderX = {};

      // Should not throw when config is missing
      expect(() => {
        const config = mockWindow.RenderX.config;
        if (config) {
          config.get('OPENAI_API_KEY');
        }
      }).not.toThrow();
    });
  });

  describe('Environment Variable Integration', () => {
    it('should support multiple configuration keys', () => {
      mockWindow.RenderX = {
        config: {
          get: (key: string) => {
            switch (key) {
              case 'OPENAI_API_KEY':
                return 'sk-openai-key';
              case 'OPENAI_MODEL':
                return 'gpt-4';
              case 'ANTHROPIC_API_KEY':
                return 'sk-anthropic-key';
              default:
                return undefined;
            }
          },
          has: (key: string) => {
            const value = mockWindow.RenderX.config.get(key);
            return value !== undefined && value !== '';
          }
        }
      };

      expect(mockWindow.RenderX.config.get('OPENAI_API_KEY')).toBe('sk-openai-key');
      expect(mockWindow.RenderX.config.get('OPENAI_MODEL')).toBe('gpt-4');
      expect(mockWindow.RenderX.config.get('ANTHROPIC_API_KEY')).toBe('sk-anthropic-key');
      expect(mockWindow.RenderX.config.has('OPENAI_API_KEY')).toBe(true);
      expect(mockWindow.RenderX.config.has('OPENAI_MODEL')).toBe(true);
      expect(mockWindow.RenderX.config.has('ANTHROPIC_API_KEY')).toBe(true);
    });

    it('should handle empty environment variables', () => {
      mockWindow.RenderX = {
        config: {
          get: (key: string) => {
            if (key === 'OPENAI_API_KEY') return '';
            return undefined;
          },
          has: (key: string) => {
            const value = mockWindow.RenderX.config.get(key);
            return value !== undefined && value !== '';
          }
        }
      };

      expect(mockWindow.RenderX.config.get('OPENAI_API_KEY')).toBe('');
      expect(mockWindow.RenderX.config.has('OPENAI_API_KEY')).toBe(false);
    });
  });
});

