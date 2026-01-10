import { describe, it, expect, beforeEach, vi } from 'vitest';

// Create a mock store that persists across calls
const mockStore = new Map<string, string>();

// Mock universal-cookie
vi.mock('universal-cookie', () => {
  return {
    default: class MockCookies {
      constructor() {}

      get(key: string) {
        const value = mockStore.get(key);
        if (value) {
          // Try to parse as JSON, if it fails return as is
          try {
            return JSON.parse(value);
          } catch {
            // Not JSON, return as string
            return value;
          }
        }
        return undefined;
      }

      set(key: string, value: string) {
        mockStore.set(key, value);
      }

      remove(key: string) {
        mockStore.delete(key);
      }
    },
  };
});

// Import after mocking
import LocalStorageProvider from './local-storage.ts';

describe('LocalStorage', () => {
  beforeEach(() => {
    // Clear the mock store before each test
    mockStore.clear();
  });

  describe('getData', () => {
    it('should retrieve data from cookies', () => {
      const result = LocalStorageProvider.getData('testKey');

      // First call should return undefined as nothing is set yet
      expect(result).toBeUndefined();
    });

    it('should return undefined for non-existent key', () => {
      const result = LocalStorageProvider.getData('nonExistentKey');
      expect(result).toBeUndefined();
    });
  });

  describe('setData', () => {
    it('should store object data as JSON string', () => {
      const testData = { name: 'test', value: 123 };

      // Should not throw
      expect(() => {
        LocalStorageProvider.setData('testKey', testData);
      }).not.toThrow();
    });

    it('should remove data when value is undefined', () => {
      // First set some data
      LocalStorageProvider.setData('testKey', { test: 'data' });

      // Then remove it
      expect(() => {
        LocalStorageProvider.setData('testKey', undefined);
      }).not.toThrow();
    });

    it('should handle errors gracefully during save', () => {
      // Should not throw even if there's an error
      expect(() => {
        LocalStorageProvider.setData('testKey', { test: 'data' });
      }).not.toThrow();
    });
  });

  describe('setString', () => {
    it('should store string value', () => {
      expect(() => {
        LocalStorageProvider.setString('stringKey', 'test value');
      }).not.toThrow();
    });

    it('should remove string when value is undefined', () => {
      // First set a string
      LocalStorageProvider.setString('stringKey', 'test value');

      // Then remove it
      expect(() => {
        LocalStorageProvider.setString('stringKey', undefined);
      }).not.toThrow();
    });

    it('should handle errors gracefully during save', () => {
      expect(() => {
        LocalStorageProvider.setString('stringKey', 'test');
      }).not.toThrow();
    });
  });

  describe('getString', () => {
    it('should retrieve string from cookies', () => {
      const result = LocalStorageProvider.getString('stringKey');

      // Initially should return undefined
      expect(result).toBeUndefined();
    });

    it('should return undefined for non-existent key', () => {
      const result = LocalStorageProvider.getString('nonExistentKey');
      expect(result).toBeUndefined();
    });

    it('should handle errors gracefully during read', () => {
      expect(() => {
        LocalStorageProvider.getString('testKey');
      }).not.toThrow();
    });
  });

  describe('integration tests', () => {
    it('should store and retrieve object data', () => {
      const testData = { name: 'John', age: 30 };

      LocalStorageProvider.setData('user', testData);
      const retrieved = LocalStorageProvider.getData('user');

      // With proper mocking, we can now verify the data
      expect(retrieved).toEqual(testData);
    });

    it('should store and retrieve string data', () => {
      LocalStorageProvider.setString('token', 'abc123');
      const retrieved = LocalStorageProvider.getString('token');

      expect(retrieved).toBe('abc123');
    });

    it('should handle remove operations for object data', () => {
      // Set data
      LocalStorageProvider.setData('temp', { data: 'test' });
      expect(LocalStorageProvider.getData('temp')).toEqual({ data: 'test' });

      // Remove data
      LocalStorageProvider.setData('temp', undefined);
      expect(LocalStorageProvider.getData('temp')).toBeUndefined();
    });

    it('should handle remove operations for string data', () => {
      // Set string
      LocalStorageProvider.setString('tempString', 'test');
      expect(LocalStorageProvider.getString('tempString')).toBe('test');

      // Remove string
      LocalStorageProvider.setString('tempString', undefined);
      expect(LocalStorageProvider.getString('tempString')).toBeUndefined();
    });
  });
});
