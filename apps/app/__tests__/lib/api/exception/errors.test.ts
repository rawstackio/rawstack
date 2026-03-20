import { AuthenticationError, ApiError } from '../../../../src/lib/api/exception/errors';

describe('AuthenticationError', () => {
  it('sets message and type for INVALID_CREDENTIALS', () => {
    const error = new AuthenticationError('Invalid email or password', 'INVALID_CREDENTIALS');
    expect(error.message).toBe('Invalid email or password');
    expect(error.type).toBe('INVALID_CREDENTIALS');
    expect(error).toBeInstanceOf(Error);
  });

  it('sets message and type for USER_NOT_FOUND', () => {
    const error = new AuthenticationError('User not found', 'USER_NOT_FOUND');
    expect(error.message).toBe('User not found');
    expect(error.type).toBe('USER_NOT_FOUND');
    expect(error).toBeInstanceOf(Error);
  });

  it('is throwable and catchable', () => {
    expect(() => {
      throw new AuthenticationError('Test error', 'INVALID_CREDENTIALS');
    }).toThrow('Test error');
  });
});

describe('ApiError', () => {
  it('sets all fields', () => {
    const data = { field: { detail: 'bad value' } };
    const error = new ApiError(404, 'NOT_FOUND', 'Resource not found', data);
    expect(error.statusCode).toBe(404);
    expect(error.type).toBe('NOT_FOUND');
    expect(error.message).toBe('Resource not found');
    expect(error.data).toEqual(data);
    expect(error).toBeInstanceOf(Error);
  });

  it('leaves data undefined when not provided', () => {
    const error = new ApiError(500, 'SERVER_ERROR', 'Internal error');
    expect(error.data).toBeUndefined();
  });

  it('is throwable and catchable', () => {
    expect(() => {
      throw new ApiError(401, 'UNAUTHORIZED', 'Not authorised');
    }).toThrow('Not authorised');
  });
});
