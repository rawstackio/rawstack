import * as dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import { TokenModel } from '~/auth/domain/model/token/token.model';
import { TokenWasCreated } from '~/auth/domain/model/token/event/token-was-created';
import { TokenWasUsed } from '~/auth/domain/model/token/event/token-was-used';
import { Id } from '~/common/domain/model/value-object/id';

describe('TokenModel', () => {
  describe('Methods', () => {
    describe('create', () => {
      test('it should create a new instance of TokenModel', () => {
        const now = dayjs();
        const id = randomUUID();
        const tokenHash = randomUUID();
        const userId = randomUUID();
        const rootTokenId = randomUUID();
        const expiresAt = dayjs().add(2, 'hours');

        const model = TokenModel.create(
          new Id(id),
          tokenHash,
          new Id(userId),
          new Id(rootTokenId),
          now,
          expiresAt,
          'LOGIN',
        );

        expect(model).toBeInstanceOf(TokenModel);
        expect(model.id.toString()).toBe(id);
        expect(model.userId.toString()).toBe(userId);
        expect(model.rootTokenId.toString()).toBe(rootTokenId);
        expect(model.createdAt).toBe(now);
        expect(model.expiresAt).toBe(expiresAt);
        expect(model.type).toBe('LOGIN');
      });

      test('should add an TokenWasCreated', () => {
        const now = dayjs();
        const id = randomUUID();
        const tokenHash = randomUUID();
        const userId = randomUUID();
        const rootTokenId = randomUUID();
        const expiresAt = dayjs().add(2, 'hours');

        const model = TokenModel.create(
          new Id(id),
          tokenHash,
          new Id(userId),
          new Id(rootTokenId),
          now,
          expiresAt,
          'LOGIN',
        );

        const events = model.pullEvents();
        expect(events).toHaveLength(1);
        expect(events[0]).toBeInstanceOf(TokenWasCreated);
      });
    });

    describe('isValid', () => {
      test('it should return true for a valid token', () => {
        const now = dayjs();
        const id = new Id(randomUUID());
        const tokenHash = randomUUID();
        const userId = new Id(randomUUID());
        const rootTokenId = new Id(randomUUID());
        const expiresAt = dayjs().add(2, 'hours');

        const model = TokenModel.create(id, tokenHash, userId, rootTokenId, now, expiresAt, 'LOGIN');

        expect(model.isValid(userId, dayjs())).toBe(true);
      });

      test('it should return false for an expired token', () => {
        const now = dayjs();
        const id = new Id(randomUUID());
        const tokenHash = randomUUID();
        const userId = new Id(randomUUID());
        const rootTokenId = new Id(randomUUID());
        const expiresAt = dayjs().subtract(1, 'hours');

        const model = TokenModel.create(id, tokenHash, userId, rootTokenId, now, expiresAt, 'LOGIN');

        expect(model.isValid(userId, dayjs())).toBe(false);
      });

      test('it should return false for a token with a different userId', () => {
        const now = dayjs();
        const id = new Id(randomUUID());
        const tokenHash = randomUUID();
        const userId = new Id(randomUUID());
        const rootTokenId = new Id(randomUUID());
        const expiresAt = dayjs().add(2, 'hours');

        const model = TokenModel.create(id, tokenHash, userId, rootTokenId, now, expiresAt, 'LOGIN');

        expect(model.isValid(new Id(randomUUID()), dayjs())).toBe(false);
      });

      test('it should return false for a used token', () => {
        const now = dayjs();
        const id = new Id(randomUUID());
        const tokenHash = randomUUID();
        const userId = new Id(randomUUID());
        const rootTokenId = new Id(randomUUID());
        const expiresAt = dayjs().add(2, 'hours');

        const model = TokenModel.create(id, tokenHash, userId, rootTokenId, now, expiresAt, 'LOGIN');
        model.use(dayjs());

        expect(model.isValid(userId, dayjs())).toBe(false);
      });
    });

    describe('use', () => {
      test('it should mark the token as used and add a TokenWasUsed event', () => {
        const now = dayjs();
        const id = randomUUID();
        const tokenHash = randomUUID();
        const userId = randomUUID();
        const rootTokenId = randomUUID();
        const expiresAt = dayjs().add(2, 'hours');

        const model = TokenModel.create(
          new Id(id),
          tokenHash,
          new Id(userId),
          new Id(rootTokenId),
          now,
          expiresAt,
          'LOGIN',
        );
        const usedAt = dayjs().add(1, 'hour');
        model.use(usedAt);

        expect(model.usedAt).toBe(usedAt);

        const events = model.pullEvents();
        expect(events).toHaveLength(2);
        expect(events[1]).toBeInstanceOf(TokenWasUsed);
      });
    });
  });
});
