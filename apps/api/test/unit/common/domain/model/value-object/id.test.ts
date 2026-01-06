import { randomUUID } from 'crypto';
import { Id } from '~/common/domain/model/value-object/id';
import { ValidationException } from '~/common/domain/exception/validation.exception';

describe('Id', () => {
  describe('constructor', () => {
    test('should create a valid Id with UUID', () => {
      const uuid = randomUUID();
      const id = new Id(uuid);
      expect(id.toString()).toBe(uuid);
    });

    test('should accept UUID in uppercase', () => {
      const uuid = randomUUID().toUpperCase();
      const id = new Id(uuid);
      expect(id.toString()).toBe(uuid);
    });

    test('should accept UUID in lowercase', () => {
      const uuid = randomUUID().toLowerCase();
      const id = new Id(uuid);
      expect(id.toString()).toBe(uuid);
    });

    test('should trim whitespace from UUID', () => {
      const uuid = randomUUID();
      const id = new Id(`  ${uuid}  `);
      expect(id.toString()).toBe(uuid);
    });

    test('should throw ValidationException for empty string', () => {
      expect(() => new Id('')).toThrow(ValidationException);
      expect(() => new Id('')).toThrow('ID cannot be empty');
    });

    test('should throw ValidationException for whitespace only', () => {
      expect(() => new Id('   ')).toThrow(ValidationException);
      expect(() => new Id('   ')).toThrow('ID cannot be empty');
    });

    test('should throw ValidationException for null', () => {
      expect(() => new Id(null as any)).toThrow(ValidationException);
      expect(() => new Id(null as any)).toThrow('ID cannot be empty');
    });

    test('should throw ValidationException for undefined', () => {
      expect(() => new Id(undefined as any)).toThrow(ValidationException);
      expect(() => new Id(undefined as any)).toThrow('ID cannot be empty');
    });

    test('should throw ValidationException for non-UUID string', () => {
      expect(() => new Id('not-a-uuid')).toThrow(ValidationException);
      expect(() => new Id('not-a-uuid')).toThrow('ID must be a valid UUID');
    });

    test('should throw ValidationException for invalid UUID format', () => {
      expect(() => new Id('12345678-1234-1234-1234-123456789012x')).toThrow(ValidationException);
      expect(() => new Id('12345678-1234-1234-1234-123456789012x')).toThrow('ID must be a valid UUID');
    });

    test('should throw ValidationException for incomplete UUID', () => {
      expect(() => new Id('12345678-1234-1234-1234')).toThrow(ValidationException);
      expect(() => new Id('12345678-1234-1234-1234')).toThrow('ID must be a valid UUID');
    });

    test('should accept valid UUID formats', () => {
      const validUUIDs = [
        '550e8400-e29b-41d4-a716-446655440000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      ];
      validUUIDs.forEach((uuid) => {
        expect(() => new Id(uuid)).not.toThrow();
      });
    });
  });

  describe('equals', () => {
    test('should return true for equal Ids', () => {
      const uuid = randomUUID();
      const id1 = new Id(uuid);
      const id2 = new Id(uuid);
      expect(id1.equals(id2)).toBe(true);
    });

    test('should return false for Ids with different casing', () => {
      const uuid = randomUUID();
      const id1 = new Id(uuid.toLowerCase());
      const id2 = new Id(uuid.toUpperCase());
      // UUIDs are case-insensitive in validation but stored as-is, making comparison case-sensitive
      expect(id1.equals(id2)).toBe(false);
    });

    test('should return false for different Ids', () => {
      const id1 = new Id(randomUUID());
      const id2 = new Id(randomUUID());
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('toString', () => {
    test('should return the UUID as a string', () => {
      const uuid = randomUUID();
      const id = new Id(uuid);
      expect(id.toString()).toBe(uuid);
    });
  });
});
