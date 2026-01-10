import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import * as argon from 'argon2';
import { AppModule } from '~/app.module';
import { UserRepositoryPrisma } from '~/user/infrastructure/persistence/user/prisma/user-repository-prisma';
import { UserModel } from '~/user/domain/model/user/user.model';
import { PrismaService } from '~/common/infrastructure/persistence/prisma/prisma.service';
import { InMemoryAdaptor } from '~/common/infrastructure/event/adaptor/in-memory.adaptor';
import { InMemoryCacheHandler } from '~/common/infrastructure/cache/inMemory/in-memory.cache-handler';
import { UserRoles } from '~/common/domain/enum/user-roles';
import { UserDto } from '~/common/application/query/user/dto/user.dto';
import { Id } from '~/common/domain/model/value-object/id';
import { Email } from '~/common/domain/model/value-object/email';

describe('UserRepositoryPrisma Integration Tests', () => {
  let app: INestApplication;
  let repository: UserRepositoryPrisma;
  let prisma: PrismaService;
  let eventAdaptor: InMemoryAdaptor;
  let cacheHandler: InMemoryCacheHandler;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    repository = app.get('UserRepositoryInterface');
    prisma = app.get(PrismaService);
    eventAdaptor = app.get(InMemoryAdaptor);
    cacheHandler = app.get('CacheHandlerInterface');
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    eventAdaptor.clear();
  });

  describe('persist - create new user', () => {
    const testEmail = `integration-test-create-${randomUUID()}@rawstack.io`;
    let userId: string;
    let user: UserModel;

    afterEach(async () => {
      // Cleanup: delete test user
      if (userId) {
        await prisma.user.deleteMany({
          where: { id: userId },
        });
      }
    });

    it('should persist user to database', async () => {
      // Arrange
      userId = randomUUID();
      const password = await argon.hash('testpassword123');
      const createdAt = dayjs();
      const roles: UserRoles[] = [];

      user = UserModel.create(createdAt, new Id(userId), new Email(testEmail), password, roles);

      // Act
      await repository.persist(user);

      // Assert - Check database
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      expect(dbUser).toBeDefined();
      expect(dbUser?.email).toBe(testEmail);
      expect(dbUser?.id).toBe(userId);
      expect(dbUser?.hash).toBe(password);
      expect(dbUser?.roles).toEqual([]);
      expect(dbUser?.unverifiedEmail).toBe(testEmail);
    });

    it('should cache the DTO after persisting', async () => {
      // Arrange
      userId = randomUUID();
      const password = await argon.hash('testpassword123');
      const createdAt = dayjs();
      const roles: UserRoles[] = [];

      user = UserModel.create(createdAt, new Id(userId), new Email(testEmail), password, roles);

      // Act
      await repository.persist(user);

      // Assert - Check cache
      const cachedDto = await cacheHandler.get<UserDto>(userId, 'UserDto', UserDto.version);

      expect(cachedDto).toBeDefined();
      expect(cachedDto?.id).toBe(userId);
      expect(cachedDto?.email).toBe(testEmail);
      expect(cachedDto?.unverifiedEmail).toBe(testEmail);
      expect(cachedDto?.roles).toEqual([]);
    });

    it('should dispatch UserWasCreated event to event bridge', async () => {
      // Arrange
      userId = randomUUID();
      const password = await argon.hash('testpassword123');
      const createdAt = dayjs();
      const roles: UserRoles[] = [];

      user = UserModel.create(createdAt, new Id(userId), new Email(testEmail), password, roles);

      // Act
      await repository.persist(user);

      // Add a small delay to allow event processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Assert - Check events
      const events = eventAdaptor.getEvents();
      const userCreatedEvent = events.find(
        (e) => e.DetailType === 'user.user.wasCreated' && JSON.parse(e.Detail).aggregateId === userId,
      );

      expect(userCreatedEvent).toBeDefined();
      expect(userCreatedEvent?.Source).toBe('api');

      const eventDetail = JSON.parse(userCreatedEvent!.Detail);
      expect(eventDetail.aggregateId).toBe(userId);
      expect(eventDetail.entity.email).toBe(testEmail);
      expect(eventDetail.entity.id).toBe(userId);
      expect(eventDetail.data.email).toBe(testEmail);
      expect(eventDetail.data.roles).toEqual([]);
    });
  });

  describe('persist - update existing user', () => {
    const testEmail = `integration-test-update-${randomUUID()}@rawstack.io`;
    const updatedEmail = `integration-test-updated-${randomUUID()}@rawstack.io`;
    let userId: string;
    let user: UserModel;

    beforeEach(async () => {
      // Create initial user
      userId = randomUUID();
      const password = await argon.hash('testpassword123');
      const createdAt = dayjs();

      user = UserModel.create(createdAt, new Id(userId), new Email(testEmail), password, []);
      await repository.persist(user);

      // Clear events from initial creation
      eventAdaptor.clear();
    });

    afterEach(async () => {
      // Cleanup
      if (userId) {
        await prisma.user.deleteMany({
          where: { id: userId },
        });
      }
    });

    it('should update user in database', async () => {
      // Arrange
      const updatedAt = dayjs();
      user.setUnverifiedEmail(updatedAt, new Email(updatedEmail));

      // Act
      await repository.persist(user);

      // Assert - Check database
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      expect(dbUser).toBeDefined();
      expect(dbUser?.email).toBe(testEmail);
      expect(dbUser?.unverifiedEmail).toBe(updatedEmail);
      expect(dbUser?.updatedAt.getTime()).toBeGreaterThanOrEqual(updatedAt.toDate().getTime() - 1000);
    });

    it('should update cache after persisting', async () => {
      // Arrange
      const updatedAt = dayjs();
      user.setUnverifiedEmail(updatedAt, new Email(updatedEmail));

      // Act
      await repository.persist(user);

      // Assert - Check cache
      const cachedDto = await cacheHandler.get<UserDto>(userId, 'UserDto', UserDto.version);

      expect(cachedDto).toBeDefined();
      expect(cachedDto?.id).toBe(userId);
      expect(cachedDto?.email).toBe(testEmail);
      expect(cachedDto?.unverifiedEmail).toBe(updatedEmail);
    });

    it('should dispatch UserUnverifiedEmailWasSet event to event bridge', async () => {
      // Arrange
      const updatedAt = dayjs();
      user.setUnverifiedEmail(updatedAt, new Email(updatedEmail));

      // Act
      await repository.persist(user);

      // Add a small delay to allow event processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Assert - Check events
      const events = eventAdaptor.getEvents();
      const unverifiedEmailEvent = events.find(
        (e) => e.DetailType === 'user.user.unverifiedEmailWasSet' && JSON.parse(e.Detail).aggregateId === userId,
      );

      expect(unverifiedEmailEvent).toBeDefined();
      expect(unverifiedEmailEvent?.Source).toBe('api');

      const eventDetail = JSON.parse(unverifiedEmailEvent!.Detail);
      expect(eventDetail.aggregateId).toBe(userId);
      expect(eventDetail.entity.unverifiedEmail).toBe(updatedEmail);
      expect(eventDetail.data.unverifiedEmail).toBe(updatedEmail);
    });
  });

  describe('persist - update with role changes', () => {
    const testEmail = `integration-test-roles-${randomUUID()}@rawstack.io`;
    let userId: string;
    let user: UserModel;

    beforeEach(async () => {
      // Create initial user
      userId = randomUUID();
      const password = await argon.hash('testpassword123');
      const createdAt = dayjs();

      user = UserModel.create(createdAt, new Id(userId), new Email(testEmail), password, []);
      await repository.persist(user);

      // Clear events from initial creation
      eventAdaptor.clear();
    });

    afterEach(async () => {
      // Cleanup
      if (userId) {
        await prisma.user.deleteMany({
          where: { id: userId },
        });
      }
    });

    it('should persist role changes and dispatch event', async () => {
      // Arrange
      const updatedAt = dayjs();
      user.addRoles(updatedAt, [UserRoles.VerifiedUser]);

      // Act
      await repository.persist(user);

      // Add a small delay to allow event processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Assert - Check database
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      expect(dbUser?.roles).toContain(UserRoles.VerifiedUser);

      // Assert - Check cache
      const cachedDto = await cacheHandler.get<UserDto>(userId, 'UserDto', UserDto.version);
      expect(cachedDto?.roles).toContain(UserRoles.VerifiedUser);

      // Assert - Check events
      const events = eventAdaptor.getEvents();
      const roleEvent = events.find(
        (e) => e.DetailType === 'user.user.rolesWereUpdated' && JSON.parse(e.Detail).aggregateId === userId,
      );

      expect(roleEvent).toBeDefined();
      const eventDetail = JSON.parse(roleEvent!.Detail);
      expect(eventDetail.data.roles).toContain(UserRoles.VerifiedUser);
    });
  });
});
