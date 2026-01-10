import { describe, it, expect, beforeEach, vi } from 'vitest'
import LocalStorageProvider from './localStorage'

// Mock universal-cookie
vi.mock('universal-cookie', () => {
  const mockCookies = new Map<string, string>()
  
  return {
    default: class Cookies {
      get(key: string) {
        const value = mockCookies.get(key)
        if (value) {
          try {
            return JSON.parse(value)
          } catch {
            return value
          }
        }
        return undefined
      }
      
      set(key: string, value: string) {
        mockCookies.set(key, value)
      }
      
      remove(key: string) {
        mockCookies.delete(key)
      }
    }
  }
})

describe('LocalStorageProvider', () => {
  beforeEach(() => {
    // Clear all cookies before each test
    vi.clearAllMocks()
  })

  describe('setData', () => {
    it('should store data as JSON string', () => {
      const testData = { name: 'test', value: 123 }
      LocalStorageProvider.setData('testKey', testData)
      
      const retrieved = LocalStorageProvider.getData<typeof testData>('testKey')
      expect(retrieved).toEqual(testData)
    })

    it('should handle nested objects', () => {
      const testData = {
        user: {
          id: '123',
          email: 'test@example.com',
          roles: ['admin']
        }
      }
      
      LocalStorageProvider.setData('nestedKey', testData)
      const retrieved = LocalStorageProvider.getData<typeof testData>('nestedKey')
      expect(retrieved).toEqual(testData)
    })

    it('should remove data when value is undefined', () => {
      LocalStorageProvider.setData('removeKey', { test: 'data' })
      LocalStorageProvider.setData('removeKey', undefined)
      
      const retrieved = LocalStorageProvider.getData('removeKey')
      expect(retrieved).toBeUndefined()
    })
  })

  describe('getData', () => {
    it('should return undefined for non-existent key', () => {
      const result = LocalStorageProvider.getData('nonExistentKey')
      expect(result).toBeUndefined()
    })

    it('should retrieve stored data with correct type', () => {
      const testData = { count: 42, active: true }
      LocalStorageProvider.setData('typedKey', testData)
      
      const retrieved = LocalStorageProvider.getData<typeof testData>('typedKey')
      expect(retrieved).toEqual(testData)
      expect(retrieved?.count).toBe(42)
      expect(retrieved?.active).toBe(true)
    })
  })
})
