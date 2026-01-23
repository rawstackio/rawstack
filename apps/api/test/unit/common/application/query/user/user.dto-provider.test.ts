import { UserDtoProvider } from '~/common/application/query/user/user.dto-provider';
import { CacheHandlerInterface } from '~/common/domain/cache-handler.interface';
import { UserRepositoryInterface } from '~/user/domain/model/user/user-repository.interface';
import { UserDto } from '~/common/application/query/user/dto/user.dto';
import { randomUUID } from 'crypto';
import { UserModel } from '~/user/domain/model/user/user.model';
import DeserializationException from '~/common/application/exception/deserialization.exception';
import { EntityNotFoundException } from '~/common/domain/exception/entity-not-found.exception';
import { Logger } from '@nestjs/common';
import { Id } from '~/common/domain/model/value-object/id';

describe('UserDtoProvider', () => {
  let userDtoProvider: UserDtoProvider;
  let cache: jest.Mocked<CacheHandlerInterface>;
  let repository: jest.Mocked<UserRepositoryInterface>;

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      getMany: jest.fn(),
    } as unknown as jest.Mocked<CacheHandlerInterface>;

    repository = {
      findById: jest.fn(),
      listIds: jest.fn(),
      findByIds: jest.fn(),
    } as unknown as jest.Mocked<UserRepositoryInterface>;

    userDtoProvider = new UserDtoProvider(repository, cache);
  });

  describe('methods', () => {
    describe('getById', () => {
      test('it returns dto from the cache if available', async () => {
        const mockUserDto = {};

        cache.get.mockResolvedValue(mockUserDto);

        const id = Id.create();
        const result = await userDtoProvider.getById(id.toString());

        expect(result).toEqual(mockUserDto);
        expect(cache.get).toHaveBeenCalledWith(id.toString(), 'UserDto', UserDto.version, expect.any(Function));
        expect(repository.findById).not.toHaveBeenCalled();
      });

      test('retrieves UserDto from repository if not in cache', async () => {
        const mockUserDto = {};
        const userModel = { dto: mockUserDto } as unknown as UserModel;
        cache.get.mockResolvedValue(null);

        const id = Id.create();

        repository.findById.mockResolvedValue(userModel);

        const result = await userDtoProvider.getById(id.toString());

        expect(result).toEqual(mockUserDto);
        expect(cache.get).toHaveBeenCalledWith(id.toString(), 'UserDto', UserDto.version, expect.any(Function));
        expect(repository.findById).toHaveBeenCalledWith(id);
        expect(cache.set).toHaveBeenCalledWith(mockUserDto);
      });

      test('it logs an error if deserialization fails and fetches user from repo instead', async () => {
        const mockUserDto = {};
        const userModel = { dto: mockUserDto } as unknown as UserModel;

        const logSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

        cache.get.mockRejectedValue(new DeserializationException('Invalid cache data'));
        repository.findById.mockResolvedValue(userModel as unknown as UserModel);

        const id = randomUUID();
        const result = await userDtoProvider.getById(id);

        expect(result).toEqual(mockUserDto);
        expect(cache.get).toHaveBeenCalledWith(id, 'UserDto', UserDto.version, expect.any(Function));
        expect(repository.findById).toHaveBeenCalledWith({ value: id });
        expect(cache.set).toHaveBeenCalledWith(mockUserDto);
        expect(logSpy).toHaveBeenCalledWith(new DeserializationException('Invalid cache data'));
        logSpy.mockRestore();
      });

      test('throws EntityNotFoundException if user not found in repository', async () => {
        cache.get.mockResolvedValue(null);
        repository.findById.mockRejectedValue(new EntityNotFoundException());

        const id = randomUUID();

        await expect(userDtoProvider.getById(id)).rejects.toThrow(EntityNotFoundException);

        expect(cache.get).toHaveBeenCalledWith(id, 'UserDto', UserDto.version, expect.any(Function));
        expect(repository.findById).toHaveBeenCalledWith({ value: id });
      });
    });

    describe('list', () => {
      it('returns empty array if no user ids found', async () => {
        const page = 2;
        const perPage = 12;
        const q = 'yo';

        repository.listIds.mockResolvedValue([]);

        const result = await userDtoProvider.list(page, perPage, q);

        expect(result).toEqual([]);
        expect(repository.listIds).toHaveBeenCalledWith(page, perPage, q, undefined, undefined, undefined);
        expect(cache.getMany).not.toHaveBeenCalled();
      });

      it('returns dtos from cache and repo for ids found', async () => {
        const page = 2;
        const perPage = 12;
        const q = 'yo';

        const id1 = randomUUID();
        const id2 = randomUUID();
        const id3 = randomUUID();

        const userDto1 = { id: id1 } as unknown as UserDto;
        const userDto2 = { id: id2 } as unknown as UserDto;
        const userModel2 = { dto: userDto2 } as unknown as UserModel;
        const userDto3 = { id: id3 } as unknown as UserDto;

        repository.listIds.mockResolvedValue([id1, id2, id3]);
        cache.getMany.mockResolvedValue([userDto1, null, userDto3]);
        repository.findByIds.mockResolvedValue([userModel2]);

        const result = await userDtoProvider.list(page, perPage, q);

        expect(result).toEqual([userDto1, userDto2, userDto3]);
        expect(repository.listIds).toHaveBeenCalledWith(page, perPage, q, undefined, undefined, undefined);
        expect(cache.getMany).toHaveBeenCalledWith([id1, id2, id3], 'UserDto', UserDto.version, expect.any(Function));
        expect(repository.findByIds).toHaveBeenCalledWith([{ value: id2 }]);
        expect(cache.set).toHaveBeenCalledWith(userDto2);
      });
    });
  });
});
