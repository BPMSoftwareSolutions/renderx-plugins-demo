import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CssRegistryStore } from '../css-registry.store';

// Mock DOM environment
const mockDocument = {
  createElement: vi.fn(() => ({
    id: '',
    setAttribute: vi.fn(),
    textContent: '',
  })),
  getElementById: vi.fn(() => null),
  head: {
    appendChild: vi.fn(),
  },
};

// Mock global document
Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
});

describe('CssRegistryStore', () => {
  let store: CssRegistryStore;

  beforeEach(() => {
    vi.clearAllMocks();
    store = new CssRegistryStore();
  });

  describe('initialization', () => {
    it('should load default CSS classes', () => {
      const classes = store.getAllClasses();
      expect(classes.length).toBeGreaterThan(0);
      
      const buttonClass = store.getClass('rx-button');
      expect(buttonClass).toBeDefined();
      expect(buttonClass?.isBuiltIn).toBe(true);
      expect(buttonClass?.content).toContain('.rx-button');
    });

    it('should mark store as loaded', () => {
      expect(store.isLoaded()).toBe(true);
    });
  });

  describe('createClass', () => {
    it('should create a new CSS class', () => {
      const className = 'test-class';
      const content = '.test-class { color: red; }';
      
      const success = store.createClass(className, content);
      
      expect(success).toBe(true);
      const createdClass = store.getClass(className);
      expect(createdClass).toBeDefined();
      expect(createdClass?.name).toBe(className);
      expect(createdClass?.content).toBe(content);
      expect(createdClass?.isBuiltIn).toBe(false);
    });

    it('should be idempotent: creating same class with identical content succeeds', () => {
      const className = 'test-class';
      const content = '.test-class { color: red; }';

      const first = store.createClass(className, content);
      expect(first).toBe(true);

      // Second create with identical content should succeed (idempotent no-op)
      const second = store.createClass(className, content);
      expect(second).toBe(true);
    });

    it('should fail when creating duplicate with different content', () => {
      const className = 'test-class';
      const content1 = '.test-class { color: red; }';
      const content2 = '.test-class { color: blue; }';

      store.createClass(className, content1);
      const success = store.createClass(className, content2);

      expect(success).toBe(false);
    });

    it('should not allow creating classes with existing names', () => {
      const success = store.createClass('rx-button', '.rx-button { color: blue; }');
      expect(success).toBe(false);
    });
  });

  describe('updateClass', () => {
    it('should update existing CSS class', () => {
      const className = 'test-class';
      const originalContent = '.test-class { color: red; }';
      const updatedContent = '.test-class { color: blue; }';
      
      store.createClass(className, originalContent);
      const success = store.updateClass(className, updatedContent);
      
      expect(success).toBe(true);
      const updatedClass = store.getClass(className);
      expect(updatedClass?.content).toBe(updatedContent);
    });

    it('should upsert: create class if it does not exist', () => {
      const className = 'non-existent';
      const content = '.test { color: red; }';

      const success = store.updateClass(className, content);
      expect(success).toBe(true);

      const created = store.getClass(className);
      expect(created).toBeDefined();
      expect(created?.content).toBe(content);
    });

    it('should update built-in classes', () => {
      const updatedContent = '.rx-button { color: purple; }';
      const success = store.updateClass('rx-button', updatedContent);
      
      expect(success).toBe(true);
      const updatedClass = store.getClass('rx-button');
      expect(updatedClass?.content).toBe(updatedContent);
    });
  });

  describe('removeClass', () => {
    it('should remove custom CSS classes', () => {
      const className = 'test-class';
      const content = '.test-class { color: red; }';
      
      store.createClass(className, content);
      const success = store.removeClass(className);
      
      expect(success).toBe(true);
      expect(store.hasClass(className)).toBe(false);
    });

    it('should not remove built-in classes', () => {
      const success = store.removeClass('rx-button');
      expect(success).toBe(false);
      expect(store.hasClass('rx-button')).toBe(true);
    });

    it('should not remove non-existent classes', () => {
      const success = store.removeClass('non-existent');
      expect(success).toBe(false);
    });
  });

  describe('getClassNames', () => {
    it('should return all class names', () => {
      const classNames = store.getClassNames();
      expect(classNames).toContain('rx-button');
      expect(classNames).toContain('rx-container');
      expect(classNames).toContain('rx-comp-div');
    });

    it('should include custom classes', () => {
      store.createClass('custom-class', '.custom-class { color: red; }');
      const classNames = store.getClassNames();
      expect(classNames).toContain('custom-class');
    });
  });

  describe('hasClass', () => {
    it('should return true for existing classes', () => {
      expect(store.hasClass('rx-button')).toBe(true);
    });

    it('should return false for non-existent classes', () => {
      expect(store.hasClass('non-existent')).toBe(false);
    });
  });

  describe('getLastModified', () => {
    it('should update when classes are modified', () => {
      const initialTime = store.getLastModified();
      
      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        store.createClass('test-class', '.test-class { color: red; }');
        const newTime = store.getLastModified();
        expect(newTime).toBeGreaterThan(initialTime);
      }, 10);
    });
  });
});
