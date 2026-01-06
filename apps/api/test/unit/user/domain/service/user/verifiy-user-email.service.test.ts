import * as dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import { UserRepositoryInterface } from '~/user/domain/model/user/user-repository.interface';
import { VerifyUserEmailService } from '~/user/domain/service/user/verify-user-email.service';
import { Id } from '~/common/domain/model/value-object/id';
import { Email } from '~/common/domain/model/value-object/email';

describe('VerifyUserEmailService', () => {
  let service: VerifyUserEmailService;
  let mockRepository: jest.Mocked<UserRepositoryInterface>;
  let mockUser: any;

  beforeEach(async () => {
    mockUser = {
      id: 123,
      verifyEmail: jest.fn(),
    };

    mockRepository = {
      findById: jest.fn(),
      persist: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<UserRepositoryInterface>;

    service = new VerifyUserEmailService(mockRepository);
  });

  it('verifies a User email', async () => {
    mockRepository.findById.mockResolvedValue(mockUser);

    const email = 'hi@rawstack.io';
    const id = randomUUID();
    await service.invoke(new Id(id), new Email(email));

    expect(mockRepository.persist).toHaveBeenCalledWith(mockUser);
    expect(mockUser.verifyEmail).toHaveBeenCalledWith(expect.any(dayjs), expect.any(Email));
  });
});
