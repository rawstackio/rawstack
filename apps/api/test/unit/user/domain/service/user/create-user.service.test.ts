import * as dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import { CreateUserService } from '~/user/domain/service/user/create-user.service';
import { UserRepositoryInterface } from '~/user/domain/model/user/user-repository.interface';
import { UserModel } from '~/user/domain/model/user/user.model';
import { LoggedInUser } from '~/common/domain/logged-in-user';
import { UserRoles } from '~/common/domain/enum/user-roles';
import { ForbiddenException } from '~/common/domain/exception/forbidden.exception';
import { Id } from '~/common/domain/model/value-object/id';
import { Email } from '~/common/domain/model/value-object/email';

jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('mockedHashedPassword'),
}));

describe('CreateUserService', () => {
  let service: CreateUserService;
  let mockRepository: jest.Mocked<UserRepositoryInterface>;
  let mockUser: any;

  beforeEach(async () => {
    mockUser = {
      id: 123,
    };

    jest.spyOn(UserModel, 'create').mockReturnValue(mockUser);

    mockRepository = {
      persist: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<UserRepositoryInterface>;

    service = new CreateUserService(mockRepository);
  });

  it('creates a UserModel when password is provided', async () => {
    const id = Id.create();
    const email = new Email('test@rawstack.io');
    const password = 'test123ABC;';
    const actor = null; // No actor needed when password is provided

    await service.invoke(actor, id, email, password, [], true);

    expect(UserModel.create).toHaveBeenCalledWith(
      expect.any(dayjs),
      expect.any(Id),
      expect.any(Email),
      'mockedHashedPassword',
      [],
    );
    expect(mockRepository.persist).toHaveBeenCalledWith(mockUser);
  });

  it('creates a UserModel when admin creates user without password', async () => {
    const id = Id.create();
    const email = new Email('test@rawstack.io');
    const password = randomUUID(); // Generated password
    const actor = new LoggedInUser(Id.create(), [UserRoles.Admin]);

    await service.invoke(actor, id, email, password, [], false);

    expect(UserModel.create).toHaveBeenCalledWith(
      expect.any(dayjs),
      expect.any(Id),
      expect.any(Email),
      'mockedHashedPassword',
      [],
    );
    expect(mockRepository.persist).toHaveBeenCalledWith(mockUser);
  });

  it('throws ForbiddenException when non-admin tries to create user without password', async () => {
    const id = Id.create();
    const email = new Email('test@rawstack.io');
    const password = randomUUID();
    const actor = new LoggedInUser(Id.create(), [UserRoles.VerifiedUser]);

    await expect(service.invoke(actor, id, email, password, [], false)).rejects.toThrow(ForbiddenException);
    expect(mockRepository.persist).not.toHaveBeenCalled();
  });

  it('throws ForbiddenException when no actor tries to create user without password', async () => {
    const id = Id.create();
    const email = new Email('test@rawstack.io');
    const password = randomUUID();
    const actor = null;

    await expect(service.invoke(actor, id, email, password, [], false)).rejects.toThrow(ForbiddenException);
    expect(mockRepository.persist).not.toHaveBeenCalled();
  });
});
