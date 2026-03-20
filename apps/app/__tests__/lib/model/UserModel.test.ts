import UserModel from '../../../src/lib/model/UserModel';

describe('UserModel', () => {
  describe('constructor', () => {
    it('sets all fields', () => {
      const model = new UserModel('id-1', 'test@example.com', ['user'], 'new@example.com');
      expect(model.id).toBe('id-1');
      expect(model.email).toBe('test@example.com');
      expect(model.roles).toEqual(['user']);
      expect(model.unverifiedEmail).toBe('new@example.com');
    });

    it('defaults roles to an empty array', () => {
      const model = new UserModel('id-1', 'test@example.com');
      expect(model.roles).toEqual([]);
    });

    it('leaves unverifiedEmail undefined when not provided', () => {
      const model = new UserModel('id-1', 'test@example.com');
      expect(model.unverifiedEmail).toBeUndefined();
    });
  });

  describe('createFromApiUser', () => {
    it('maps all fields from the api user', () => {
      const apiUser = {
        id: 'id-1',
        email: 'test@example.com',
        roles: ['VERIFIED_USER'],
        unverifiedEmail: 'new@example.com',
      };
      const model = UserModel.createFromApiUser(apiUser as any);
      expect(model.id).toBe('id-1');
      expect(model.email).toBe('test@example.com');
      expect(model.roles).toEqual(['VERIFIED_USER']);
      expect(model.unverifiedEmail).toBe('new@example.com');
    });

    it('handles a missing unverifiedEmail', () => {
      const apiUser = { id: 'id-1', email: 'test@example.com', roles: [] };
      const model = UserModel.createFromApiUser(apiUser as any);
      expect(model.unverifiedEmail).toBeUndefined();
    });
  });

  describe('isVerified', () => {
    it('returns true when unverifiedEmail is not set', () => {
      const model = new UserModel('id-1', 'test@example.com');
      expect(model.isVerified).toBe(true);
    });

    it('returns false when email equals unverifiedEmail (initial verification pending)', () => {
      const model = new UserModel('id-1', 'test@example.com', [], 'test@example.com');
      expect(model.isVerified).toBe(false);
    });

    it('returns true when email differs from unverifiedEmail (email change in progress)', () => {
      const model = new UserModel('id-1', 'current@example.com', [], 'new@example.com');
      expect(model.isVerified).toBe(true);
    });
  });
});
