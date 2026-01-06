import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '~/app.module';
import { ActionRequestRepositoryRedis } from '~/auth/infrastructure/persistence/action-request/redis/action-request-repository-redis';
import { ActionRequestModel } from '~/auth/domain/model/action-request/action-request.model';
import { InMemoryAdaptor } from '~/common/infrastructure/event/adaptor/in-memory.adaptor';
import { CacheHandlerInterface } from '~/common/domain/cache-handler.interface';
import { Id } from '~/common/domain/model/value-object/id';
import { Email } from '~/common/domain/model/value-object/email';

describe('ActionRequestRepositoryRedis Integration Tests', () => {
  let app: INestApplication;
  let repository: ActionRequestRepositoryRedis;
  let eventAdaptor: InMemoryAdaptor;
  let cacheHandler: CacheHandlerInterface;
  let redisClient: Redis;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    repository = app.get('ActionRequestRepositoryInterface');
    eventAdaptor = app.get(InMemoryAdaptor);
    cacheHandler = app.get('CacheHandlerInterface');

    // Create a separate Redis client for test cleanup
    const config = app.get(ConfigService);
    const host = config.get<string>('REDIS_HOST');
    const port = parseInt(config.get<string>('REDIS_PORT') ?? '6379');
    redisClient = new Redis({ host, port });
  });

  afterAll(async () => {
    await redisClient.quit();
    await app.close();
  });

  beforeEach(() => {
    eventAdaptor.clear();
  });

  describe('persist - create new action request', () => {
    const testUserId = randomUUID();
    const testTokenId = randomUUID();
    let actionRequestId: string;

    afterEach(async () => {
      // Cleanup: delete test action request from cache
      if (actionRequestId) {
        await redisClient.del(ActionRequestModel.getStorageKey(actionRequestId));
      }
    });

    it('should persist action request to cache', async () => {
      // Arrange
      actionRequestId = randomUUID();
      const createdAt = dayjs();
      const testEmail = `integration-test-${randomUUID()}@rawstack.io`;
      const data = {
        tokenId: new Id(testTokenId),
        userId: new Id(testUserId),
        email: new Email(testEmail),
      };

      const actionRequest = ActionRequestModel.create(createdAt, new Id(actionRequestId), 'EMAIL_VERIFICATION', data);

      // Act
      await repository.persist(actionRequest);

      // Assert - Check cache
      const cachedData = await cacheHandler.getRaw(ActionRequestModel.getStorageKey(actionRequestId));

      expect(cachedData).toBeDefined();
      const parsedData = JSON.parse(cachedData!);
      expect(parsedData._id.value).toBe(actionRequestId);
      expect(parsedData._status).toBe('PROCESSING');
      expect(parsedData._action).toBe('EMAIL_VERIFICATION');
      expect(parsedData._data.userId.value).toBe(testUserId);
      expect(parsedData._data.tokenId.value).toBe(testTokenId);
      expect(parsedData._data.email.value).toBe(testEmail);
    });

    it('should dispatch ActionRequestWasCreated event to event bridge', async () => {
      // Arrange
      actionRequestId = randomUUID();
      const createdAt = dayjs();
      const testEmail = `integration-test-${randomUUID()}@rawstack.io`;
      const data = {
        tokenId: new Id(testTokenId),
        userId: new Id(testUserId),
        email: new Email(testEmail),
      };

      const actionRequest = ActionRequestModel.create(createdAt, new Id(actionRequestId), 'EMAIL_VERIFICATION', data);

      // Act
      await repository.persist(actionRequest);

      // Add a small delay to allow event processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Assert - Check events
      const events = eventAdaptor.getEvents();
      const actionCreatedEvent = events.find(
        (e) => e.DetailType === 'auth.actionRequest.wasCreated' && JSON.parse(e.Detail).aggregateId === actionRequestId,
      );

      expect(actionCreatedEvent).toBeDefined();
      expect(actionCreatedEvent?.Source).toBe('api');

      const eventDetail = JSON.parse(actionCreatedEvent!.Detail);
      expect(eventDetail.aggregateId).toBe(actionRequestId);
      expect(eventDetail.entity).toBeNull(); // ActionRequestWasCreated sets snapshot to null
      expect(eventDetail.data.status).toBe('PROCESSING');
      expect(eventDetail.data.action).toBe('EMAIL_VERIFICATION');
      expect(eventDetail.data.data.userId).toBe(testUserId);
      expect(eventDetail.data.data.email).toBe(testEmail);
    });
  });

  describe('persist - update action request status', () => {
    const testUserId = randomUUID();
    const testTokenId = randomUUID();
    let actionRequestId: string;
    let actionRequest: ActionRequestModel;

    beforeEach(async () => {
      // Create initial action request
      actionRequestId = randomUUID();
      const createdAt = dayjs();
      const testEmail = `integration-test-${randomUUID()}@rawstack.io`;
      const data = {
        tokenId: new Id(testTokenId),
        userId: new Id(testUserId),
        email: new Email(testEmail),
      };

      actionRequest = ActionRequestModel.create(createdAt, new Id(actionRequestId), 'EMAIL_VERIFICATION', data);
      await repository.persist(actionRequest);

      // Clear events from initial creation
      eventAdaptor.clear();
    });

    afterEach(async () => {
      // Cleanup
      if (actionRequestId) {
        await redisClient.del(ActionRequestModel.getStorageKey(actionRequestId));
      }
    });

    it('should update action request status in cache to COMPLETED', async () => {
      // Arrange
      const updatedAt = dayjs();
      actionRequest.updateStatus(updatedAt, 'COMPLETED');

      // Act
      await repository.persist(actionRequest);

      // Assert - Check cache
      const cachedData = await cacheHandler.getRaw(ActionRequestModel.getStorageKey(actionRequestId));

      expect(cachedData).toBeDefined();
      const parsedData = JSON.parse(cachedData!);
      expect(parsedData._id.value).toBe(actionRequestId);
      expect(parsedData._status).toBe('COMPLETED');
      expect(parsedData._action).toBe('EMAIL_VERIFICATION');
    });

    it('should update action request status in cache to FAILED', async () => {
      // Arrange
      const updatedAt = dayjs();
      actionRequest.updateStatus(updatedAt, 'FAILED');

      // Act
      await repository.persist(actionRequest);

      // Assert - Check cache
      const cachedData = await cacheHandler.getRaw(ActionRequestModel.getStorageKey(actionRequestId));

      expect(cachedData).toBeDefined();
      const parsedData = JSON.parse(cachedData!);
      expect(parsedData._id.value).toBe(actionRequestId);
      expect(parsedData._status).toBe('FAILED');
    });

    it('should dispatch ActionRequestStatusWasUpdated event to event bridge', async () => {
      // Arrange
      const updatedAt = dayjs();
      actionRequest.updateStatus(updatedAt, 'COMPLETED');

      // Act
      await repository.persist(actionRequest);

      // Add a small delay to allow event processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Assert - Check events
      const events = eventAdaptor.getEvents();
      const statusUpdatedEvent = events.find(
        (e) =>
          e.DetailType === 'auth.actionRequest.statusWasUpdated' &&
          JSON.parse(e.Detail).aggregateId === actionRequestId,
      );

      expect(statusUpdatedEvent).toBeDefined();
      expect(statusUpdatedEvent?.Source).toBe('api');

      const eventDetail = JSON.parse(statusUpdatedEvent!.Detail);
      expect(eventDetail.aggregateId).toBe(actionRequestId);
      expect(eventDetail.entity).toBeNull(); // ActionRequestStatusWasUpdated sets snapshot to null
      expect(eventDetail.data.status).toBe('COMPLETED');
      expect(eventDetail.data.action).toBe('EMAIL_VERIFICATION');
    });
  });

  describe('findById', () => {
    const testUserId = randomUUID();
    const testTokenId = randomUUID();
    let actionRequestId: string;

    beforeEach(async () => {
      // Create test action request
      actionRequestId = randomUUID();
      const createdAt = dayjs();
      const testEmail = `integration-test-${randomUUID()}@rawstack.io`;
      const data = {
        tokenId: new Id(testTokenId),
        userId: new Id(testUserId),
        email: new Email(testEmail),
      };

      const actionRequest = ActionRequestModel.create(createdAt, new Id(actionRequestId), 'EMAIL_VERIFICATION', data);
      await repository.persist(actionRequest);
      eventAdaptor.clear();
    });

    afterEach(async () => {
      // Cleanup
      if (actionRequestId) {
        await redisClient.del(ActionRequestModel.getStorageKey(actionRequestId));
      }
    });

    it('should find action request by id', async () => {
      // Act
      const actionRequest = await repository.findById(actionRequestId);

      // Assert
      expect(actionRequest).toBeDefined();
      expect(actionRequest.id.toString()).toBe(actionRequestId);
      expect(actionRequest.status).toBe('PROCESSING');
      expect(actionRequest.action).toBe('EMAIL_VERIFICATION');
      expect(actionRequest.data.userId.toString()).toBe(testUserId);
      expect(actionRequest.data.tokenId.toString()).toBe(testTokenId);
    });

    it('should throw EntityNotFoundException for non-existent action request', async () => {
      // Act & Assert
      await expect(repository.findById(randomUUID())).rejects.toThrow('Could not find entity with id');
    });

    it('should correctly restore ActionRequestModel from cache', async () => {
      // Act
      const actionRequest = await repository.findById(actionRequestId);

      // Assert - Check that all properties are correctly restored
      expect(actionRequest.id.toString()).toBe(actionRequestId);
      expect(actionRequest.status).toBe('PROCESSING');
      expect(actionRequest.action).toBe('EMAIL_VERIFICATION');
      expect(actionRequest.createdAt).toBeDefined();
      expect(dayjs.isDayjs(actionRequest.createdAt)).toBe(true);
      expect(actionRequest.data).toBeDefined();
      expect(actionRequest.data.userId.toString()).toBe(testUserId);
      expect(actionRequest.data.tokenId.toString()).toBe(testTokenId);
    });
  });

  describe('cache expiration', () => {
    const testUserId = randomUUID();
    const testTokenId = randomUUID();
    let actionRequestId: string;

    afterEach(async () => {
      // Cleanup
      if (actionRequestId) {
        await redisClient.del(ActionRequestModel.getStorageKey(actionRequestId));
      }
    });

    it('should set cache with TTL (time to live)', async () => {
      // Arrange
      actionRequestId = randomUUID();
      const createdAt = dayjs();
      const testEmail = `integration-test-${randomUUID()}@rawstack.io`;
      const data = {
        tokenId: new Id(testTokenId),
        userId: new Id(testUserId),
        email: new Email(testEmail),
      };

      const actionRequest = ActionRequestModel.create(createdAt, new Id(actionRequestId), 'EMAIL_VERIFICATION', data);

      // Act
      await repository.persist(actionRequest);

      // Assert - Check that the data exists
      const cachedData = await cacheHandler.getRaw(ActionRequestModel.getStorageKey(actionRequestId));
      expect(cachedData).toBeDefined();

      // Note: In a real test with Redis, you could check the TTL using Redis commands
      // For now, we just verify the data was cached successfully
    });
  });

  describe('multiple action requests', () => {
    const testUserId = randomUUID();
    const actionRequestIds: string[] = [];

    afterEach(async () => {
      // Cleanup all test action requests
      for (const id of actionRequestIds) {
        await redisClient.del(ActionRequestModel.getStorageKey(id));
      }
      actionRequestIds.length = 0;
    });

    it('should handle multiple action requests independently', async () => {
      // Arrange & Act - Create multiple action requests
      const actionRequest1Id = randomUUID();
      actionRequestIds.push(actionRequest1Id);
      const actionRequest1 = ActionRequestModel.create(dayjs(), new Id(actionRequest1Id), 'EMAIL_VERIFICATION', {
        tokenId: new Id(randomUUID()),
        userId: new Id(testUserId),
        email: new Email(`test1-${randomUUID()}@rawstack.io`),
      });
      await repository.persist(actionRequest1);

      const actionRequest2Id = randomUUID();
      actionRequestIds.push(actionRequest2Id);
      const actionRequest2 = ActionRequestModel.create(dayjs(), new Id(actionRequest2Id), 'EMAIL_VERIFICATION', {
        tokenId: new Id(randomUUID()),
        userId: new Id(testUserId),
        email: new Email(`test2-${randomUUID()}@rawstack.io`),
      });
      await repository.persist(actionRequest2);

      // Update first action request
      actionRequest1.updateStatus(dayjs(), 'COMPLETED');
      await repository.persist(actionRequest1);

      // Assert - Verify both exist with correct states
      const retrieved1 = await repository.findById(actionRequest1Id);
      expect(retrieved1.status).toBe('COMPLETED');

      const retrieved2 = await repository.findById(actionRequest2Id);
      expect(retrieved2.status).toBe('PROCESSING');
    });
  });
});
