import * as dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import { UserModel } from '~/user/domain/model/user/user.model';
import { UserWasCreated } from '~/user/domain/model/user/event/user-was-created';
import { UserRoles } from '~/common/domain/enum/user-roles';

describe('UserModel', () => {
  describe('Methods', () => {
    describe('create', () => {
      test('it should create a new instance of UserModel', () => {
        const now = dayjs();
        const id = randomUUID();
        const email = 'test@rawstack.io';
        const password = 'test123ABC;';
        const roles: UserRoles[] = [];
        const model = UserModel.create(now, id, email, password, roles);

        expect(model).toBeInstanceOf(UserModel);
        expect(model.id).toBe(id);
        expect(model.email).toBe(email);
        expect(model.password).toBe(password);
        expect(model.createdAt).toBe(now);
      });

      test('should add an EventWasCreatedEvent', () => {
        const now = dayjs();
        const id = randomUUID();
        const email = 'test@rawstack.io';
        const password = 'test123ABC;';
        const roles: UserRoles[] = [];
        const model = UserModel.create(now, id, email, password, roles);

        const events = model.pullEvents();
        expect(events).toHaveLength(1);
        expect(events[0]).toBeInstanceOf(UserWasCreated);
      });
    });
  });
});
