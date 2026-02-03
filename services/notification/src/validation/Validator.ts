import { ValidationException } from '../exception/ValidationException';

export class Validator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly PHONE_REGEX = /^\+?[1-9]\d{1,14}$/; // E.164 format

  /**
   * Validates that a value is present (not null, undefined, or empty string)
   */
  static required(value: unknown, fieldName: string): void {
    if (value === null || value === undefined || value === '') {
      throw new ValidationException(`${fieldName} is required`, fieldName);
    }
  }

  /**
   * Validates that a string is a valid email address
   */
  static email(value: string, fieldName: string): void {
    this.required(value, fieldName);
    if (!this.EMAIL_REGEX.test(value)) {
      throw new ValidationException(`${fieldName} must be a valid email address`, fieldName);
    }
  }

  /**
   * Validates that a string is a valid phone number (E.164 format)
   */
  static phone(value: string, fieldName: string): void {
    this.required(value, fieldName);
    if (!this.PHONE_REGEX.test(value)) {
      throw new ValidationException(`${fieldName} must be a valid phone number in E.164 format`, fieldName);
    }
  }

  /**
   * Validates that a string has a minimum length
   */
  static minLength(value: string, minLength: number, fieldName: string): void {
    this.required(value, fieldName);
    if (value.length < minLength) {
      throw new ValidationException(`${fieldName} must be at least ${minLength} characters`, fieldName);
    }
  }

  /**
   * Validates that a string has a maximum length
   */
  static maxLength(value: string, maxLength: number, fieldName: string): void {
    if (value && value.length > maxLength) {
      throw new ValidationException(`${fieldName} must be at most ${maxLength} characters`, fieldName);
    }
  }
}
