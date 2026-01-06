import { describe, it, expect } from 'vitest'
import { ApiError, AuthenticationError } from './errors'

describe('ApiError', () => {
  it('should create an ApiError with all properties', () => {
    const error = new ApiError(
      404,
      'NOT_FOUND',
      'Resource not found',
      [{ field: 'id', message: 'Invalid ID' }]
    )

    expect(error.statusCode).toBe(404)
    expect(error.type).toBe('NOT_FOUND')
    expect(error.message).toBe('Resource not found')
    expect(error.details).toEqual([{ field: 'id', message: 'Invalid ID' }])
    expect(error).toBeInstanceOf(Error)
  })

  it('should create an ApiError without details', () => {
    const error = new ApiError(
      500,
      'INTERNAL_ERROR',
      'Something went wrong'
    )

    expect(error.statusCode).toBe(500)
    expect(error.type).toBe('INTERNAL_ERROR')
    expect(error.message).toBe('Something went wrong')
    expect(error.details).toBeUndefined()
  })

  it('should work with multiple field details', () => {
    const details = [
      { field: 'email', message: 'Invalid email' },
      { field: 'password', message: 'Too short' }
    ]
    const error = new ApiError(400, 'VALIDATION_ERROR', 'Validation failed', details)

    expect(error.details).toEqual(details)
    expect(error.details).toHaveLength(2)
  })
})

describe('AuthenticationError', () => {
  it('should create an AuthenticationError with INVALID_CREDENTIALS type', () => {
    const error = new AuthenticationError(
      'Invalid email or password',
      'INVALID_CREDENTIALS'
    )

    expect(error.message).toBe('Invalid email or password')
    expect(error.type).toBe('INVALID_CREDENTIALS')
    expect(error).toBeInstanceOf(Error)
  })

  it('should create an AuthenticationError with USER_NOT_FOUND type', () => {
    const error = new AuthenticationError(
      'User not found',
      'USER_NOT_FOUND'
    )

    expect(error.message).toBe('User not found')
    expect(error.type).toBe('USER_NOT_FOUND')
    expect(error).toBeInstanceOf(Error)
  })

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new AuthenticationError('Test error', 'INVALID_CREDENTIALS')
    }).toThrow('Test error')
  })
})
