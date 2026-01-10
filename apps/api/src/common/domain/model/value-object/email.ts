import { ValidationException } from '~/common/domain/exception/validation.exception';

export class Email {
  private readonly value: string;

  constructor(email: string) {
    this.validate(email);
    this.value = email.toLowerCase().trim();
  }

  private validate(email: string): void {
    if (!email || typeof email !== 'string') {
      throw new ValidationException('Email cannot be empty');
    }

    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0) {
      throw new ValidationException('Email cannot be empty');
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      throw new ValidationException('Invalid email format');
    }

    if (trimmedEmail.length > 255) {
      throw new ValidationException('Email cannot exceed 255 characters');
    }
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }
}
