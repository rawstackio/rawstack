import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import * as argon from 'argon2';
import { AppModule } from '~/app.module';
import { TokenRepositoryPrisma } from '~/auth/infrastructure/persistence/token/prisma/token-repository-prisma';
import { TokenModel } from '~/auth/domain/model/token/token.model';
import { PrismaService } from '~/common/infrastructure/persistence/prisma/prisma.service';
import { InMemoryAdaptor } from '~/common/infrastructure/event/adaptor/in-memory.adaptor';
import { UserRepositoryPrisma } from '~/user/infrastructure/persistence/user/prisma/user-repository-prisma';
import { UserModel } from '~/user/domain/model/user/user.model';
import { Id } from '~/common/domain/model/value-object/id';
import { Email } from '~/common/domain/model/value-object/email';

describe('TokenRepositoryPrisma Integration Tests', () => {
  let app: INestApplication;
  let repository: TokenRepositoryPrisma;
  let userRepository: UserRepositoryPrisma;
  let prisma: PrismaService;
  let eventAdaptor: InMemoryAdaptor;
  let testUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    repository = app.get('TokenRepositoryInterface');
    userRepository = app.get('UserRepositoryInterface');
    prisma = app.get(PrismaService);
    eventAdaptor = app.get(InMemoryAdaptor);

    // Create a test user for token tests
    testUserId = randomUUID();
    const testEmail = `integration-test-token-${testUserId}@rawstack.io`;
    const password = await argon.hash('testpassword123');
    const createdAt = dayjs();
    const user = UserModel.create(createdAt, new Id(testUserId), new Email(testEmail), password, []);
    await userRepository.persist(user);
  });

  afterAll(async () => {
    // Cleanup: delete test user
    if (testUserId) {
      await prisma.user.deleteMany({
        where: { id: testUserId },
      });
    }
    await app.close();
  });

  beforeEach(() => {
    eventAdaptor.clear();
  });

  describe('persist - create new token', () => {
    let tokenId: Id;
    let tokenHash: string;

    afterEach(async () => {
      // Cleanup: delete test token
      if (tokenId) {
        await prisma.token.deleteMany({
          where: { id: tokenId.toString() },
        });
      }
    });

    it('should persist token to database', async () => {
      // Arrange
      tokenId = new Id(randomUUID());
      tokenHash = await argon.hash(randomUUID());
      const createdAt = dayjs();
      const expiresAt = dayjs().add(1, 'hour');

      const token = TokenModel.create(tokenId, tokenHash, new Id(testUserId), tokenId, createdAt, expiresAt, 'LOGIN');

      // Act
      await repository.persist(token);

      // Assert - Check database
      const dbToken = await prisma.token.findUnique({
        where: { id: tokenId.toString() },
      });

      expect(dbToken).toBeDefined();
      expect(dbToken?.id).toBe(tokenId.toString());
      expect(dbToken?.tokenHash).toBe(tokenHash);
      expect(dbToken?.userId).toBe(testUserId);
      expect(dbToken?.rootTokenId).toBe(tokenId.toString());
      expect(dbToken?.type).toBe('LOGIN');
      expect(dbToken?.usedAt).toBeNull();
    });

    it('should dispatch TokenWasCreated event to event bridge', async () => {
      // Arrange
      tokenId = new Id(randomUUID());
      tokenHash = await argon.hash(randomUUID());
      const createdAt = dayjs();
      const expiresAt = dayjs().add(1, 'hour');

      const token = TokenModel.create(tokenId, tokenHash, new Id(testUserId), tokenId, createdAt, expiresAt, 'LOGIN');

      // Act
      await repository.persist(token);

      // Add a small delay to allow event processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Assert - Check events
      const events = eventAdaptor.getEvents();
      const tokenCreatedEvent = events.find(
        (e) => e.DetailType === 'auth.token.wasCreated' && JSON.parse(e.Detail).aggregateId === tokenId.toString(),
      );

      expect(tokenCreatedEvent).toBeDefined();
      expect(tokenCreatedEvent?.Source).toBe('api');

      const eventDetail = JSON.parse(tokenCreatedEvent!.Detail);
      expect(eventDetail.aggregateId).toBe(tokenId.toString());
      expect(eventDetail.entity).toBeNull(); // TokenWasCreated sets snapshot to null
      expect(eventDetail.data.id).toBe(tokenId.toString());
      expect(eventDetail.data.userId).toBe(testUserId);
      expect(eventDetail.data.type).toBe('LOGIN');
    });
  });

  describe('persist - update existing token (mark as used)', () => {
    let tokenId: string;
    let tokenHash: string;
    let token: TokenModel;

    beforeEach(async () => {
      // Create initial token
      tokenId = randomUUID();
      tokenHash = await argon.hash(randomUUID());
      const createdAt = dayjs();
      const expiresAt = dayjs().add(1, 'hour');

      token = TokenModel.create(
        new Id(tokenId),
        tokenHash,
        new Id(testUserId),
        new Id(tokenId),
        createdAt,
        expiresAt,
        'LOGIN',
      );
      await repository.persist(token);

      // Clear events from initial creation
      eventAdaptor.clear();
    });

    afterEach(async () => {
      // Cleanup
      if (tokenId) {
        await prisma.token.deleteMany({
          where: { id: tokenId },
        });
      }
    });

    it('should update token in database when marked as used', async () => {
      // Arrange
      const usedAt = dayjs();
      token.use(usedAt);

      // Act
      await repository.persist(token);

      // Assert - Check database
      const dbToken = await prisma.token.findUnique({
        where: { id: tokenId },
      });

      expect(dbToken).toBeDefined();
      expect(dbToken?.usedAt).toBeDefined();
      expect(dbToken?.usedAt?.getTime()).toBeGreaterThanOrEqual(usedAt.toDate().getTime() - 1000);
    });

    it('should dispatch TokenWasUsed event to event bridge', async () => {
      // Arrange
      const usedAt = dayjs();
      token.use(usedAt);

      // Act
      await repository.persist(token);

      // Add a small delay to allow event processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Assert - Check events
      const events = eventAdaptor.getEvents();
      const tokenUsedEvent = events.find(
        (e) => e.DetailType === 'auth.token.wasUsed' && JSON.parse(e.Detail).aggregateId === tokenId,
      );

      expect(tokenUsedEvent).toBeDefined();
      expect(tokenUsedEvent?.Source).toBe('api');

      const eventDetail = JSON.parse(tokenUsedEvent!.Detail);
      expect(eventDetail.aggregateId).toBe(tokenId);
      expect(eventDetail.entity).toBeNull(); // TokenWasUsed sets snapshot to null
      expect(eventDetail.data.userId).toBe(testUserId);
      expect(eventDetail.data.type).toBe('LOGIN');
    });
  });

  describe('findById', () => {
    let tokenId: Id;

    beforeEach(async () => {
      // Create test token
      tokenId = new Id(randomUUID());
      const tokenHash = await argon.hash(randomUUID());
      const createdAt = dayjs();
      const expiresAt = dayjs().add(1, 'hour');

      const token = TokenModel.create(tokenId, tokenHash, new Id(testUserId), tokenId, createdAt, expiresAt, 'LOGIN');
      await repository.persist(token);
      eventAdaptor.clear();
    });

    afterEach(async () => {
      // Cleanup
      if (tokenId) {
        await prisma.token.deleteMany({
          where: { id: tokenId.toString() },
        });
      }
    });

    it('should find token by id', async () => {
      // Act
      const token = await repository.findById(tokenId);

      // Assert
      expect(token).toBeDefined();
      expect(token.id).toEqual(tokenId);
      expect(token.userId.toString()).toBe(testUserId);
      expect(token.type).toBe('LOGIN');
    });

    it('should throw EntityNotFoundException for non-existent token', async () => {
      // Act & Assert
      await expect(repository.findById(new Id(randomUUID()))).rejects.toThrow('Token with id');
    });

    it('should throw EntityNotFoundException for expired token', async () => {
      // Arrange - Create an already expired token
      const expiredTokenId = randomUUID();
      const tokenHash = await argon.hash(randomUUID());

      await prisma.token.create({
        data: {
          id: expiredTokenId,
          tokenHash: tokenHash,
          userId: testUserId,
          rootTokenId: expiredTokenId,
          createdAt: dayjs().subtract(2, 'hour').toDate(),
          expiresAt: dayjs().subtract(1, 'hour').toDate(),
          type: 'LOGIN',
        },
      });

      // Act & Assert
      await expect(repository.findById(new Id(expiredTokenId))).rejects.toThrow('Token with id');

      // Cleanup
      await prisma.token.deleteMany({
        where: { id: expiredTokenId },
      });
    });
  });

  describe('findByTokenHash', () => {
    let tokenId: string;
    let tokenHash: string;

    beforeEach(async () => {
      // Create test token
      tokenId = randomUUID();
      tokenHash = await argon.hash(randomUUID());
      const createdAt = dayjs();
      const expiresAt = dayjs().add(1, 'hour');

      const token = TokenModel.create(
        new Id(tokenId),
        tokenHash,
        new Id(testUserId),
        new Id(tokenId),
        createdAt,
        expiresAt,
        'LOGIN',
      );
      await repository.persist(token);
      eventAdaptor.clear();
    });

    afterEach(async () => {
      // Cleanup
      if (tokenId) {
        await prisma.token.deleteMany({
          where: { id: tokenId },
        });
      }
    });

    it('should find token by token hash', async () => {
      // Act
      const token = await repository.findByTokenHash(tokenHash);

      // Assert
      expect(token).toBeDefined();
      expect(token.id.toString()).toEqual(tokenId);
      expect(token.tokenHash).toBe(tokenHash);
      expect(token.userId.toString()).toBe(testUserId);
    });

    it('should throw EntityNotFoundException for non-existent token hash', async () => {
      // Act & Assert
      await expect(repository.findByTokenHash('non-existent-hash')).rejects.toThrow(
        'Token with provided hashed token not found',
      );
    });
  });

  describe('deleteAllByRootTokenId', () => {
    let rootTokenId: string;
    let childToken1Id: string;
    let childToken2Id: string;

    beforeEach(async () => {
      // Create root token and child tokens
      rootTokenId = randomUUID();
      const rootTokenHash = await argon.hash(randomUUID());
      const createdAt = dayjs();
      const expiresAt = dayjs().add(1, 'hour');

      const rootToken = TokenModel.create(
        new Id(rootTokenId),
        rootTokenHash,
        new Id(testUserId),
        new Id(rootTokenId),
        createdAt,
        expiresAt,
        'LOGIN',
      );
      await repository.persist(rootToken);

      // Create child tokens with same rootTokenId
      childToken1Id = randomUUID();
      const childToken1Hash = await argon.hash(randomUUID());
      const childToken1 = TokenModel.create(
        new Id(childToken1Id),
        childToken1Hash,
        new Id(testUserId),
        new Id(rootTokenId),
        createdAt,
        expiresAt,
        'LOGIN',
      );
      await repository.persist(childToken1);

      childToken2Id = randomUUID();
      const childToken2Hash = await argon.hash(randomUUID());
      const childToken2 = TokenModel.create(
        new Id(childToken2Id),
        childToken2Hash,
        new Id(testUserId),
        new Id(rootTokenId),
        createdAt,
        expiresAt,
        'LOGIN',
      );
      await repository.persist(childToken2);

      eventAdaptor.clear();
    });

    afterEach(async () => {
      // Cleanup - delete any remaining tokens
      await prisma.token.deleteMany({
        where: { rootTokenId: rootTokenId },
      });
    });

    it('should delete all tokens with matching rootTokenId', async () => {
      // Act
      await repository.deleteAllByRootTokenId(new Id(rootTokenId));

      // Assert - Check that all tokens are deleted
      const remainingTokens = await prisma.token.findMany({
        where: { rootTokenId: rootTokenId },
      });

      expect(remainingTokens).toHaveLength(0);
    });

    it('should delete all tokens with different rootTokenId when whereNotId is true', async () => {
      // Act - When whereNotId is true, it deletes tokens where rootTokenId does NOT equal the provided id
      // This deletes tokens from OTHER token families (where rootTokenId != id)
      await repository.deleteAllByRootTokenId(new Id(rootTokenId), true);

      // Assert - Check that tokens with our rootTokenId still exist (they weren't deleted)
      const remainingTokens = await prisma.token.findMany({
        where: { rootTokenId: rootTokenId },
      });

      // All tokens with rootTokenId should remain because we deleted where rootTokenId != id
      expect(remainingTokens.length).toBeGreaterThan(0);
      expect(remainingTokens.every((t) => t.rootTokenId === rootTokenId)).toBe(true);
    });
  });

  describe('token types', () => {
    afterEach(async () => {
      // Cleanup all test tokens
      await prisma.token.deleteMany({
        where: { userId: testUserId },
      });
    });

    it('should persist EMAIL_VERIFICATION token type', async () => {
      // Arrange
      const tokenId = randomUUID();
      const tokenHash = await argon.hash(randomUUID());
      const createdAt = dayjs();
      const expiresAt = dayjs().add(1, 'hour');
      const testEmail = `test-${randomUUID()}@rawstack.io`;

      const token = TokenModel.create(
        new Id(tokenId),
        tokenHash,
        new Id(testUserId),
        new Id(tokenId),
        createdAt,
        expiresAt,
        'EMAIL_VERIFICATION',
        new Email(testEmail),
      );

      // Act
      await repository.persist(token);

      // Assert
      const dbToken = await prisma.token.findUnique({
        where: { id: tokenId },
      });

      expect(dbToken?.type).toBe('EMAIL_VERIFICATION');
    });

    it('should persist PASSWORD_RESET token type', async () => {
      // Arrange
      const tokenId = randomUUID();
      const tokenHash = await argon.hash(randomUUID());
      const createdAt = dayjs();
      const expiresAt = dayjs().add(1, 'hour');

      const token = TokenModel.create(
        new Id(tokenId),
        tokenHash,
        new Id(testUserId),
        new Id(tokenId),
        createdAt,
        expiresAt,
        'PASSWORD_RESET',
      );

      // Act
      await repository.persist(token);

      // Assert
      const dbToken = await prisma.token.findUnique({
        where: { id: tokenId },
      });

      expect(dbToken?.type).toBe('PASSWORD_RESET');
    });
  });
});
