import { describe, it, expect } from 'vitest';
import UserModel from './user-model.ts';
import dayjs from 'dayjs';
import { UserRolesEnum } from '@rawstack/api-client';

describe('UserModel', () => {
  describe('constructor', () => {
    it('should create a UserModel instance with all properties', () => {
      const user = new UserModel(
        'user-123',
        'test@example.com',
        ['ADMIN', 'VERIFIED_USER'],
        '2024-01-01T00:00:00Z',
        '2024-01-02T00:00:00Z',
        'unverified@example.com',
      );

      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.roles).toEqual(['ADMIN', 'VERIFIED_USER']);
      expect(user.unverifiedEmail).toBe('unverified@example.com');
      expect(user.dateCreated).toBeDefined();
      expect(user.dateUpdated).toBeDefined();
    });

    it('should parse dates correctly', () => {
      const dateCreated = '2024-01-01T12:30:00Z';
      const dateUpdated = '2024-01-02T14:45:00Z';

      const user = new UserModel('user-123', 'test@example.com', ['ADMIN'], dateCreated, dateUpdated);

      expect(user.dateCreated.toISOString()).toBe(dayjs(dateCreated).toISOString());
      expect(user.dateUpdated.toISOString()).toBe(dayjs(dateUpdated).toISOString());
    });

    it('should work without unverifiedEmail', () => {
      const user = new UserModel('user-123', 'test@example.com', [], '2024-01-01T00:00:00Z', '2024-01-02T00:00:00Z');

      expect(user.unverifiedEmail).toBeUndefined();
    });
  });

  describe('isAdmin getter', () => {
    it('should return true when user has ADMIN role', () => {
      const user = new UserModel(
        'user-123',
        'test@example.com',
        ['ADMIN', 'VERIFIED_USER'],
        '2024-01-01T00:00:00Z',
        '2024-01-02T00:00:00Z',
      );

      expect(user.isAdmin).toBe(true);
    });

    it('should return false when user does not have ADMIN role', () => {
      const user = new UserModel(
        'user-123',
        'test@example.com',
        ['VERIFIED_USER'],
        '2024-01-01T00:00:00Z',
        '2024-01-02T00:00:00Z',
      );

      expect(user.isAdmin).toBe(false);
    });

    it('should return false when user has no roles', () => {
      const user = new UserModel('user-123', 'test@example.com', [], '2024-01-01T00:00:00Z', '2024-01-02T00:00:00Z');

      expect(user.isAdmin).toBe(false);
    });
  });

  describe('isVerified getter', () => {
    it('should return true when user has VERIFIED_USER role', () => {
      const user = new UserModel(
        'user-123',
        'test@example.com',
        ['VERIFIED_USER'],
        '2024-01-01T00:00:00Z',
        '2024-01-02T00:00:00Z',
      );

      expect(user.isVerified).toBe(true);
    });

    it('should return false when user does not have VERIFIED_USER role', () => {
      const user = new UserModel(
        'user-123',
        'test@example.com',
        ['ADMIN'],
        '2024-01-01T00:00:00Z',
        '2024-01-02T00:00:00Z',
      );

      expect(user.isVerified).toBe(false);
    });

    it('should return false when user has no roles', () => {
      const user = new UserModel('user-123', 'test@example.com', [], '2024-01-01T00:00:00Z', '2024-01-02T00:00:00Z');

      expect(user.isVerified).toBe(false);
    });
  });

  describe('createFromApiUser', () => {
    it('should create a UserModel from API User object', () => {
      const apiUser = {
        id: 'user-456',
        email: 'api@example.com',
        roles: [UserRolesEnum.Admin, UserRolesEnum.VerifiedUser],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        unverifiedEmail: 'pending@example.com',
      };

      const user = UserModel.createFromApiUser(apiUser);

      expect(user.id).toBe('user-456');
      expect(user.email).toBe('api@example.com');
      expect(user.roles).toEqual([UserRolesEnum.Admin, UserRolesEnum.VerifiedUser]);
      expect(user.unverifiedEmail).toBe('pending@example.com');
      expect(user.isAdmin).toBe(true);
      expect(user.isVerified).toBe(true);
    });

    it('should handle API User without unverifiedEmail', () => {
      const apiUser = {
        id: 'user-456',
        email: 'api@example.com',
        roles: [UserRolesEnum.VerifiedUser],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      const user = UserModel.createFromApiUser(apiUser);

      expect(user.id).toBe('user-456');
      expect(user.email).toBe('api@example.com');
      expect(user.unverifiedEmail).toBeUndefined();
    });
  });
});
