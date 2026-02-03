import { Validator } from '../../src/validation/Validator';
import { ValidationException } from '../../src/exception/ValidationException';

describe('Validator', () => {
  describe('required', () => {
    it('should pass for non-empty string', () => {
      expect(() => Validator.required('value', 'field')).not.toThrow();
    });

    it('should pass for number zero', () => {
      expect(() => Validator.required(0, 'field')).not.toThrow();
    });

    it('should pass for boolean false', () => {
      expect(() => Validator.required(false, 'field')).not.toThrow();
    });

    it('should throw for null', () => {
      expect(() => Validator.required(null, 'testField')).toThrow(ValidationException);
      expect(() => Validator.required(null, 'testField')).toThrow('testField is required');
    });

    it('should throw for undefined', () => {
      expect(() => Validator.required(undefined, 'testField')).toThrow(ValidationException);
      expect(() => Validator.required(undefined, 'testField')).toThrow('testField is required');
    });

    it('should throw for empty string', () => {
      expect(() => Validator.required('', 'testField')).toThrow(ValidationException);
      expect(() => Validator.required('', 'testField')).toThrow('testField is required');
    });

    it('should include field name in exception', () => {
      try {
        Validator.required(null, 'email');
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationException);
        expect((e as ValidationException).field).toBe('email');
      }
    });
  });

  describe('email', () => {
    it('should pass for valid email', () => {
      expect(() => Validator.email('test@example.com', 'email')).not.toThrow();
    });

    it('should pass for email with subdomain', () => {
      expect(() => Validator.email('user@mail.example.com', 'email')).not.toThrow();
    });

    it('should pass for email with plus sign', () => {
      expect(() => Validator.email('user+tag@example.com', 'email')).not.toThrow();
    });

    it('should throw for invalid email without @', () => {
      expect(() => Validator.email('invalid-email', 'email')).toThrow(ValidationException);
      expect(() => Validator.email('invalid-email', 'email')).toThrow('email must be a valid email address');
    });

    it('should throw for invalid email without domain', () => {
      expect(() => Validator.email('user@', 'email')).toThrow(ValidationException);
    });

    it('should throw for invalid email without user', () => {
      expect(() => Validator.email('@example.com', 'email')).toThrow(ValidationException);
    });

    it('should throw for empty string', () => {
      expect(() => Validator.email('', 'email')).toThrow(ValidationException);
      expect(() => Validator.email('', 'email')).toThrow('email is required');
    });

    it('should include field name in exception', () => {
      try {
        Validator.email('invalid', 'fromAddress');
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationException);
        expect((e as ValidationException).field).toBe('fromAddress');
      }
    });
  });

  describe('phone', () => {
    it('should pass for valid E.164 phone number with plus', () => {
      expect(() => Validator.phone('+14155551234', 'phone')).not.toThrow();
    });

    it('should pass for valid E.164 phone number without plus', () => {
      expect(() => Validator.phone('14155551234', 'phone')).not.toThrow();
    });

    it('should pass for international number', () => {
      expect(() => Validator.phone('+442071234567', 'phone')).not.toThrow();
    });

    it('should throw for phone number starting with 0', () => {
      expect(() => Validator.phone('01onal', 'phone')).toThrow(ValidationException);
    });

    it('should throw for phone number with letters', () => {
      expect(() => Validator.phone('+1415555ABCD', 'phone')).toThrow(ValidationException);
      expect(() => Validator.phone('+1415555ABCD', 'phone')).toThrow(
        'phone must be a valid phone number in E.164 format',
      );
    });

    it('should throw for empty string', () => {
      expect(() => Validator.phone('', 'phone')).toThrow(ValidationException);
      expect(() => Validator.phone('', 'phone')).toThrow('phone is required');
    });

    it('should include field name in exception', () => {
      try {
        Validator.phone('invalid', 'recipient');
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationException);
        expect((e as ValidationException).field).toBe('recipient');
      }
    });
  });

  describe('minLength', () => {
    it('should pass when string length equals minimum', () => {
      expect(() => Validator.minLength('abc', 3, 'field')).not.toThrow();
    });

    it('should pass when string length exceeds minimum', () => {
      expect(() => Validator.minLength('abcd', 3, 'field')).not.toThrow();
    });

    it('should throw when string length is below minimum', () => {
      expect(() => Validator.minLength('ab', 3, 'field')).toThrow(ValidationException);
      expect(() => Validator.minLength('ab', 3, 'field')).toThrow('field must be at least 3 characters');
    });

    it('should throw for empty string when minimum is greater than 0', () => {
      expect(() => Validator.minLength('', 1, 'field')).toThrow(ValidationException);
      expect(() => Validator.minLength('', 1, 'field')).toThrow('field is required');
    });

    it('should include field name in exception', () => {
      try {
        Validator.minLength('a', 5, 'password');
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationException);
        expect((e as ValidationException).field).toBe('password');
      }
    });
  });

  describe('maxLength', () => {
    it('should pass when string length equals maximum', () => {
      expect(() => Validator.maxLength('abc', 3, 'field')).not.toThrow();
    });

    it('should pass when string length is below maximum', () => {
      expect(() => Validator.maxLength('ab', 3, 'field')).not.toThrow();
    });

    it('should pass for empty string', () => {
      expect(() => Validator.maxLength('', 3, 'field')).not.toThrow();
    });

    it('should throw when string length exceeds maximum', () => {
      expect(() => Validator.maxLength('abcd', 3, 'field')).toThrow(ValidationException);
      expect(() => Validator.maxLength('abcd', 3, 'field')).toThrow('field must be at most 3 characters');
    });

    it('should include field name in exception', () => {
      try {
        Validator.maxLength('too long', 3, 'username');
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationException);
        expect((e as ValidationException).field).toBe('username');
      }
    });
  });
});
