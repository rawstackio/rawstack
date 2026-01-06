import { describe, it, expect } from 'vitest'
import { AuthenticationError, ValidationError, ApiError } from './errors'

describe('AuthenticationError', () => {
  it('should create an AuthenticationError with INVALID_CREDENTIALS type', () => {
    const error = new AuthenticationError('Invalid credentials', 'INVALID_CREDENTIALS')
    
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AuthenticationError)
    expect(error.message).toBe('Invalid credentials')
    expect(error.type).toBe('INVALID_CREDENTIALS')
  })

  it('should create an AuthenticationError with USER_NOT_FOUND type', () => {
    const error = new AuthenticationError('User not found', 'USER_NOT_FOUND')
    
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('User not found')
    expect(error.type).toBe('USER_NOT_FOUND')
  })

  it('should have correct error name', () => {
    const error = new AuthenticationError('Test error', 'INVALID_CREDENTIALS')
    expect(error.name).toBe('Error')
  })
})

describe('ValidationError', () => {
  it('should create a ValidationError with message and details', () => {
    const details = {
      email: 'Email is required',
      password: 'Password must be at least 8 characters',
    }
    const error = new ValidationError('Validation failed', details)
    
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(ValidationError)
    expect(error.message).toBe('Validation failed')
    expect(error.details).toEqual(details)
  })

  it('should create a ValidationError with empty details', () => {
    const error = new ValidationError('Validation failed', {})
    
    expect(error.message).toBe('Validation failed')
    expect(error.details).toEqual({})
  })

  describe('fromApiResponse', () => {
    it('should create ValidationError from API response', () => {
      const apiResponse = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: [
          { field: 'email', message: 'Email is required' },
          { field: 'password', message: 'Password must be at least 8 characters' },
        ],
      }

      const error = ValidationError.fromApiResponse(apiResponse)
      
      expect(error).toBeInstanceOf(ValidationError)
      expect(error.message).toBe('Validation failed')
      expect(error.details).toEqual({
        email: 'Email is required',
        password: 'Password must be at least 8 characters',
      })
    })

    it('should handle empty details array', () => {
      const apiResponse = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: [],
      }

      const error = ValidationError.fromApiResponse(apiResponse)
      
      expect(error.message).toBe('Validation failed')
      expect(error.details).toEqual({})
    })

    it('should handle single detail', () => {
      const apiResponse = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: [
          { field: 'username', message: 'Username already exists' },
        ],
      }

      const error = ValidationError.fromApiResponse(apiResponse)
      
      expect(error.details).toEqual({
        username: 'Username already exists',
      })
    })

    it('should convert multiple details for same field (last one wins)', () => {
      const apiResponse = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: [
          { field: 'email', message: 'Email is required' },
          { field: 'email', message: 'Email format is invalid' },
        ],
      }

      const error = ValidationError.fromApiResponse(apiResponse)
      
      // The last message for the same field should be used
      expect(error.details.email).toBe('Email format is invalid')
    })
  })
})

describe('ApiError', () => {
  it('should create an ApiError with UNKNOWN type', () => {
    const error = new ApiError('Something went wrong', 'UNKNOWN')
    
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.message).toBe('Something went wrong')
    expect(error.type).toBe('UNKNOWN')
  })

  it('should have correct error name', () => {
    const error = new ApiError('Test error', 'UNKNOWN')
    expect(error.name).toBe('Error')
  })
})
