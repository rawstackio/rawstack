import { Email } from '~/common/domain/model/value-object/email';
import { ValidationException } from '~/common/domain/exception/validation.exception';

describe('Email', () => {
  describe('constructor', () => {
    test('should create a valid email', () => {
      const email = new Email('test@example.com');
      expect(email.toString()).toBe('test@example.com');
    });

    test('should convert email to lowercase', () => {
      const email = new Email('Test@Example.COM');
      expect(email.toString()).toBe('test@example.com');
    });

    test('should trim whitespace', () => {
      const email = new Email('  test@example.com  ');
      expect(email.toString()).toBe('test@example.com');
    });

    test('should throw ValidationException for empty string', () => {
      expect(() => new Email('')).toThrow(ValidationException);
      expect(() => new Email('')).toThrow('Email cannot be empty');
    });

    test('should throw ValidationException for whitespace only', () => {
      expect(() => new Email('   ')).toThrow(ValidationException);
      expect(() => new Email('   ')).toThrow('Email cannot be empty');
    });

    test('should throw ValidationException for null', () => {
      expect(() => new Email(null as any)).toThrow(ValidationException);
      expect(() => new Email(null as any)).toThrow('Email cannot be empty');
    });

    test('should throw ValidationException for undefined', () => {
      expect(() => new Email(undefined as any)).toThrow(ValidationException);
      expect(() => new Email(undefined as any)).toThrow('Email cannot be empty');
    });

    test('should throw ValidationException for invalid email format - no @', () => {
      expect(() => new Email('notanemail')).toThrow(ValidationException);
      expect(() => new Email('notanemail')).toThrow('Invalid email format');
    });

    test('should throw ValidationException for invalid email format - no domain', () => {
      expect(() => new Email('test@')).toThrow(ValidationException);
      expect(() => new Email('test@')).toThrow('Invalid email format');
    });

    test('should throw ValidationException for invalid email format - no local part', () => {
      expect(() => new Email('@example.com')).toThrow(ValidationException);
      expect(() => new Email('@example.com')).toThrow('Invalid email format');
    });

    test('should throw ValidationException for invalid email format - no TLD', () => {
      expect(() => new Email('test@example')).toThrow(ValidationException);
      expect(() => new Email('test@example')).toThrow('Invalid email format');
    });

    test('should throw ValidationException for email exceeding 255 characters', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(() => new Email(longEmail)).toThrow(ValidationException);
      expect(() => new Email(longEmail)).toThrow('Email cannot exceed 255 characters');
    });

    test('should accept valid emails with various formats', () => {
      expect(() => new Email('user@example.com')).not.toThrow();
      expect(() => new Email('user.name@example.com')).not.toThrow();
      expect(() => new Email('user+tag@example.co.uk')).not.toThrow();
      expect(() => new Email('user_name@sub.example.com')).not.toThrow();
    });
  });

  describe('equals', () => {
    test('should return true for equal emails', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    test('should return true for equal emails with different casing', () => {
      const email1 = new Email('Test@Example.com');
      const email2 = new Email('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    test('should return false for different emails', () => {
      const email1 = new Email('test1@example.com');
      const email2 = new Email('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('toString', () => {
    test('should return the email as a string', () => {
      const email = new Email('test@example.com');
      expect(email.toString()).toBe('test@example.com');
    });
  });
});
