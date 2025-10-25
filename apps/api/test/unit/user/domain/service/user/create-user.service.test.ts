import * as dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import { CreateUserService } from '~/user/domain/service/user/create-user.service';
import { UserRepositoryInterface } from '~/user/domain/model/user/user-repository.interface';
import { UserModel } from '~/user/domain/model/user/user.model';

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

  it('creates a UserModel', async () => {
    const id = randomUUID();
    const email = 'test@rawstack.io';
    const password = 'test123ABC;';

    await service.invoke(id, email, password, []);

    expect(UserModel.create).toHaveBeenCalledWith(expect.any(dayjs), id, email, 'mockedHashedPassword', []);
    expect(mockRepository.persist).toHaveBeenCalledWith(mockUser);
  });
});
