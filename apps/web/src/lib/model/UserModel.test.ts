import { describe, it, expect } from 'vitest';
import UserModel from './UserModel';
import { User } from '@rawstack/api-client';

describe('UserModel', () => {
  describe('constructor', () => {
    it('should create a UserModel instance with all properties', () => {
      const user = new UserModel('user-123', 'test@example.com', ['ADMIN', 'VERIFIED_USER'], true);

      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.roles).toEqual(['ADMIN', 'VERIFIED_USER']);
      expect(user.unverifiedEmail).toBe(true);
    });

    it('should work without unverifiedEmail', () => {
      const user = new UserModel('user-123', 'test@example.com', [], false);

      expect(user.unverifiedEmail).toBe(false);
    });

    it('should work with empty roles', () => {
      const user = new UserModel('user-123', 'test@example.com', [], false);

      expect(user.roles).toEqual([]);
    });
  });

  describe('createFromApiUser', () => {
    it('should create a UserModel from API User object', () => {
      const apiUser = {
        id: 'user-456',
        email: 'api@example.com',
        roles: ['ADMIN', 'VERIFIED_USER'],
        unverifiedEmail: 'pending@example.com',
      } as User;

      const user = UserModel.createFromApiUser(apiUser);

      expect(user.id).toBe('user-456');
      expect(user.email).toBe('api@example.com');
      expect(user.roles).toEqual(['ADMIN', 'VERIFIED_USER']);
      expect(user.unverifiedEmail).toBe(true);
    });

    it('should handle API User without unverifiedEmail', () => {
      const apiUser = {
        id: 'user-456',
        email: 'api@example.com',
        roles: ['VERIFIED_USER'],
      } as User;

      const user = UserModel.createFromApiUser(apiUser);

      expect(user.id).toBe('user-456');
      expect(user.email).toBe('api@example.com');
      expect(user.unverifiedEmail).toBe(false);
    });

    it('should handle empty roles array', () => {
      const apiUser = {
        id: 'user-789',
        email: 'test@example.com',
        roles: [],
      } as unknown as User;

      const user = UserModel.createFromApiUser(apiUser);

      expect(user.roles).toEqual([]);
    });
  });
});
