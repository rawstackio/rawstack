import * as dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import { UserRepositoryInterface } from '~/user/domain/model/user/user-repository.interface';
import { LoggedInUser } from '~/common/domain/logged-in-user';
import { ForbiddenException } from '~/common/domain/exception/forbidden.exception';
import { UpdateUserService } from '~/user/domain/service/user/update-user.service';
import { ValidationException } from '~/common/domain/exception/validation.exception';

describe('UpdateUserService', () => {
  let service: UpdateUserService;
  let mockRepository: jest.Mocked<UserRepositoryInterface>;
  let mockUser: any;

  beforeEach(async () => {
    mockUser = {
      id: 123,
      setUnverifiedEmail: jest.fn(),
      updatePassword: jest.fn(),
    };

    mockRepository = {
      findById: jest.fn(),
      persist: jest.fn().mockResolvedValue(undefined),
      existsByEmail: jest.fn(),
    } as unknown as jest.Mocked<UserRepositoryInterface>;

    service = new UpdateUserService(mockRepository);
  });

  it('updates own email via setUnverifiedEmail', async () => {
    const id = randomUUID();
    const actor = new LoggedInUser(id, []);

    mockRepository.findById.mockResolvedValue(mockUser);

    const email = 'hi@rawstack.io';

    await service.invoke(actor, id, email);

    expect(mockRepository.persist).toHaveBeenCalledWith(mockUser);
    expect(mockUser.setUnverifiedEmail).toHaveBeenCalledWith(expect.any(dayjs), email);
  });

  it('can update own password', async () => {
    const id = randomUUID();
    const actor = new LoggedInUser(id, []);

    mockRepository.findById.mockResolvedValue(mockUser);

    const password = 'asdasdasd';

    await service.invoke(actor, id, undefined, password);

    expect(mockRepository.persist).toHaveBeenCalledWith(mockUser);
    expect(mockUser.setUnverifiedEmail).not.toHaveBeenCalled();
    expect(mockUser.updatePassword).toHaveBeenCalledWith(expect.any(dayjs), expect.any(String));
  });

  it('throws error if no values provided', async () => {
    const actorId = randomUUID();
    const id = randomUUID();
    const actor = new LoggedInUser(actorId, ['ADMIN']);

    mockRepository.findById.mockResolvedValue(mockUser);

    await expect(service.invoke(actor, id)).rejects.toThrow(ValidationException);

    expect(mockRepository.persist).not.toHaveBeenCalledWith(mockUser);
  });

  it('cannot update another user', async () => {
    const actorId = randomUUID();
    const id = randomUUID();
    const actor = new LoggedInUser(actorId, []);
    const email = 'hi@rawstack.io';

    mockRepository.findById.mockResolvedValue(mockUser);

    await expect(service.invoke(actor, id, email)).rejects.toThrow(ForbiddenException);

    expect(mockRepository.persist).not.toHaveBeenCalledWith(mockUser);
  });

  it('admins can update users', async () => {
    const actorId = randomUUID();
    const id = randomUUID();
    const actor = new LoggedInUser(actorId, ['ADMIN']);
    const email = 'hi@rawstack.io';

    mockRepository.findById.mockResolvedValue(mockUser);

    await service.invoke(actor, id, email);

    expect(mockRepository.persist).toHaveBeenCalledWith(mockUser);
  });
});
