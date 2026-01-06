import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility function', () => {
  it('should merge single class name', () => {
    const result = cn('text-red-500')
    expect(result).toBe('text-red-500')
  })

  it('should merge multiple class names', () => {
    const result = cn('text-red-500', 'bg-blue-500')
    expect(result).toBe('text-red-500 bg-blue-500')
  })

  it('should handle conditional classes with falsy values', () => {
    const result = cn('text-red-500', false && 'hidden', 'bg-blue-500')
    expect(result).toBe('text-red-500 bg-blue-500')
  })

  it('should handle conditional classes with truthy values', () => {
    const result = cn('text-red-500', true && 'hidden', 'bg-blue-500')
    expect(result).toBe('text-red-500 hidden bg-blue-500')
  })

  it('should merge conflicting Tailwind classes correctly', () => {
    // twMerge should keep the last conflicting class
    const result = cn('p-4', 'p-8')
    expect(result).toBe('p-8')
  })

  it('should handle array of classes', () => {
    const result = cn(['text-red-500', 'bg-blue-500'])
    expect(result).toBe('text-red-500 bg-blue-500')
  })

  it('should handle object with boolean values', () => {
    const result = cn({
      'text-red-500': true,
      'bg-blue-500': false,
      'border-2': true,
    })
    expect(result).toBe('text-red-500 border-2')
  })

  it('should handle mixed input types', () => {
    const result = cn(
      'text-red-500',
      ['bg-blue-500', false && 'hidden'],
      { 'border-2': true, 'p-4': false }
    )
    expect(result).toBe('text-red-500 bg-blue-500 border-2')
  })

  it('should handle undefined and null values', () => {
    const result = cn('text-red-500', undefined, null, 'bg-blue-500')
    expect(result).toBe('text-red-500 bg-blue-500')
  })

  it('should return empty string for no arguments', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle empty strings', () => {
    const result = cn('', 'text-red-500', '', 'bg-blue-500')
    expect(result).toBe('text-red-500 bg-blue-500')
  })

  it('should properly merge overlapping Tailwind variants', () => {
    const result = cn('hover:text-red-500', 'hover:text-blue-500')
    expect(result).toBe('hover:text-blue-500')
  })
})
