import { ValidationException } from '../../src/exception/ValidationException';

describe('ValidationException', () => {
  it('should create an exception with message only', () => {
    const exception = new ValidationException('Test error message');

    expect(exception.message).toBe('Test error message');
    expect(exception.name).toBe('ValidationException');
    expect(exception.field).toBeUndefined();
  });

  it('should create an exception with message and field', () => {
    const exception = new ValidationException('Invalid email', 'email');

    expect(exception.message).toBe('Invalid email');
    expect(exception.name).toBe('ValidationException');
    expect(exception.field).toBe('email');
  });

  it('should be an instance of Error', () => {
    const exception = new ValidationException('Test error');

    expect(exception).toBeInstanceOf(Error);
    expect(exception).toBeInstanceOf(ValidationException);
  });
});
