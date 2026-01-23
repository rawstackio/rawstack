import * as dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import { UserRepositoryInterface } from '~/user/domain/model/user/user-repository.interface';
import { DeleteUserService } from '~/user/domain/service/user/delete-user.service';
import { LoggedInUser } from '~/common/domain/logged-in-user';
import { ForbiddenException } from '~/common/domain/exception/forbidden.exception';
import { Id } from '~/common/domain/model/value-object/id';

describe('DeleteUserService', () => {
  let service: DeleteUserService;
  let mockRepository: jest.Mocked<UserRepositoryInterface>;
  let mockUser: any;

  beforeEach(async () => {
    mockUser = {
      id: 123,
      delete: jest.fn(),
    };

    mockRepository = {
      findById: jest.fn(),
      persist: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<UserRepositoryInterface>;

    service = new DeleteUserService(mockRepository);
  });

  it('deletes own user', async () => {
    const id = Id.create();
    const actor = new LoggedInUser(id, []);

    mockRepository.findById.mockResolvedValue(mockUser);

    await service.invoke(actor, id);

    expect(mockRepository.persist).toHaveBeenCalledWith(mockUser);
    expect(mockUser.delete).toHaveBeenCalledWith(expect.any(dayjs));
  });

  it('cannot delete another user', async () => {
    const actorId = Id.create();
    const id = Id.create();
    const actor = new LoggedInUser(actorId, []);

    mockRepository.findById.mockResolvedValue(mockUser);

    await expect(service.invoke(actor, id)).rejects.toThrow(ForbiddenException);

    expect(mockRepository.persist).not.toHaveBeenCalledWith(mockUser);
    expect(mockUser.delete).not.toHaveBeenCalledWith(expect.any(dayjs));
  });

  it('can delete another user', async () => {
    const actorId = Id.create();
    const id = Id.create();
    const actor = new LoggedInUser(actorId, ['ADMIN']);

    mockRepository.findById.mockResolvedValue(mockUser);

    await service.invoke(actor, id);

    expect(mockRepository.persist).toHaveBeenCalledWith(mockUser);
    expect(mockUser.delete).toHaveBeenCalledWith(expect.any(dayjs));
  });
});
