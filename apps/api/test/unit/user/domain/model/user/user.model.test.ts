import * as dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import { UserModel } from '~/user/domain/model/user/user.model';
import { UserWasCreated } from '~/user/domain/model/user/event/user-was-created';
import { UserRoles } from '~/common/domain/enum/user-roles';
import { UserUnverifiedEmailWasSet } from '~/user/domain/model/user/event/user-unverified-email-was-set';
import { UserEmailWasVerified } from '~/user/domain/model/user/event/user-email-was-verified';
import { UserPasswordWasUpdated } from '~/user/domain/model/user/event/user-password-was-updated';
import { UserRolesWereUpdated } from '~/user/domain/model/user/event/user-roles-were-updated';
import { UserWasDeleted } from '~/user/domain/model/user/event/user-was-deleted';
import { ValidationException } from '~/common/domain/exception/validation.exception';
import { Id } from '~/common/domain/model/value-object/id';
import { Email } from '~/common/domain/model/value-object/email';

describe('UserModel', () => {
  let now: dayjs.Dayjs;
  let id: string;
  let email: string;
  let password: string;
  let roles: UserRoles[];
  let model: UserModel;

  beforeEach(() => {
    now = dayjs();
    id = randomUUID();
    email = 'test@rawstack.io';
    password = 'test123ABC;';
    roles = [];
    model = UserModel.create(now, new Id(id), new Email(email), password, roles);
  });

  describe('create', () => {
    test('should create a new instance of UserModel', () => {
      expect(model).toBeInstanceOf(UserModel);
      expect(model.id.toString()).toBe(id);
      expect(model.email.toString()).toBe(email);
      expect(model.password).toBe(password);
      expect(model.createdAt).toBe(now);
      expect(model.unverifiedEmail?.toString()).toBe(email);
    });

    test('should add a UserWasCreated event', () => {
      const events = model.pullEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserWasCreated);
    });
  });

  describe('setUnverifiedEmail', () => {
    test('should update unverifiedEmail and updatedAt, and add event', () => {
      const newEmail = 'new@rawstack.io';
      const updatedAt = now.add(1, 'day');
      model.setUnverifiedEmail(updatedAt, new Email(newEmail));

      expect(model.unverifiedEmail?.toString()).toBe(newEmail);
      expect(model.updatedAt).toBe(updatedAt);

      const events = model.pullEvents();
      expect(events.some((e) => e instanceof UserUnverifiedEmailWasSet)).toBe(true);
    });
  });

  describe('verifyEmail', () => {
    test('should verify email, clear unverifiedEmail, add role, and add event', () => {
      const updatedAt = now.add(2, 'day');
      model.verifyEmail(updatedAt, new Email(email));

      expect(model.email.toString()).toBe(email);
      expect(model.unverifiedEmail).toBeNull();
      expect(model.roles).toContain(UserRoles.VerifiedUser);
      expect(model.updatedAt).toBe(updatedAt);

      const events = model.pullEvents();
      expect(events.some((e) => e instanceof UserEmailWasVerified)).toBe(true);
    });

    test('should throw if email does not match unverifiedEmail', () => {
      expect(() => model.verifyEmail(now, new Email('wrong@rawstack.io'))).toThrow(ValidationException);
    });
  });

  describe('updatePassword', () => {
    test('should update password and add event', () => {
      const updatedAt = now.add(3, 'day');
      const newPassword = 'newPass123!';
      model.updatePassword(updatedAt, newPassword);

      expect(model.password).toBe(newPassword);
      expect(model.updatedAt).toBe(updatedAt);

      const events = model.pullEvents();
      expect(events.some((e) => e instanceof UserPasswordWasUpdated)).toBe(true);
    });
  });

  describe('addRoles', () => {
    test('should add new roles and add event', () => {
      const updatedAt = now.add(4, 'day');
      model.addRoles(updatedAt, [UserRoles.Admin]);

      expect(model.roles).toContain(UserRoles.Admin);
      expect(model.updatedAt).toBe(updatedAt);

      const events = model.pullEvents();
      expect(events.some((e) => e instanceof UserRolesWereUpdated)).toBe(true);
    });

    test('should not add duplicate roles', () => {
      const updatedAt = now.add(5, 'day');
      model.addRoles(updatedAt, [UserRoles.Admin]);
      model.addRoles(updatedAt, [UserRoles.Admin]);
      expect(model.roles.filter((r) => r === UserRoles.Admin).length).toBe(1);
    });
  });

  describe('removeRoles', () => {
    test('should remove roles and add event', () => {
      const updatedAt = now.add(6, 'day');
      model.addRoles(updatedAt, [UserRoles.Admin]);
      model.removeRoles(updatedAt, [UserRoles.Admin]);
      expect(model.roles).not.toContain(UserRoles.Admin);

      const events = model.pullEvents();
      expect(events.some((e) => e instanceof UserRolesWereUpdated)).toBe(true);
    });
  });

  describe('delete', () => {
    test('should set deletedAt and add event', () => {
      const deletedAt = now.add(7, 'day');
      model.delete(deletedAt);

      expect(model.deletedAt).toBe(deletedAt);
      expect(model.isDeleted()).toBe(true);

      const events = model.pullEvents();
      expect(events.some((e) => e instanceof UserWasDeleted)).toBe(true);
    });
  });

  describe('dto and getDto', () => {
    test('should return correct dto', () => {
      const dto = model.dto;
      expect(dto.id).toBe(model.id.toString());
      expect(dto.email).toBe(model.email.toString());
      expect(dto.roles).toEqual(model.roles);
      expect(dto.createdAt).toEqual(model.createdAt.toDate());
      expect(dto.updatedAt).toEqual(model.updatedAt.toDate());
      expect(dto.unverifiedEmail).toBe(model.unverifiedEmail?.toString() || undefined);
    });

    test('getDto should return dto', () => {
      expect(model.getDto()).toEqual(model.dto);
    });
  });

  describe('isDeleted', () => {
    test('should return false if not deleted', () => {
      expect(model.isDeleted()).toBe(false);
    });

    test('should return true if deleted', () => {
      model.delete(now);
      expect(model.isDeleted()).toBe(true);
    });
  });
});
