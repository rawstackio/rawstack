import * as dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import { TokenRepositoryInterface } from '~/auth/domain/model/token/token-repository.interface';
import { TokenModel } from '~/auth/domain/model/token/token.model';
import { CreateEmailVerificationTokenService } from '~/auth/domain/service/token/create-email-verification-token.service';
import { Id } from '~/common/domain/model/value-object/id';
import { Email } from '~/common/domain/model/value-object/email';

describe('CreateEmailVerificationTokenService', () => {
  let service: CreateEmailVerificationTokenService;
  let mockRepository: jest.Mocked<TokenRepositoryInterface>;
  let mockEvent: any;

  beforeEach(() => {
    mockEvent = { id: 123 };
    jest.spyOn(TokenModel, 'create').mockReturnValue(mockEvent);

    mockRepository = {
      persist: jest.fn().mockResolvedValue(undefined),
      findByTokenHash: jest.fn(),
      findTokenUserByEmail: jest.fn(),
      deleteAllByRootTokenId: jest.fn(),
    } as unknown as jest.Mocked<TokenRepositoryInterface>;

    service = new CreateEmailVerificationTokenService(mockRepository, 12345);
  });

  it('creates an email verification token for a valid user', async () => {
    const id = randomUUID();
    const userId = randomUUID();
    const email = 'test@rawstack.io';

    await service.invoke(new Id(id), new Id(userId), new Email(email));

    expect(TokenModel.create).toHaveBeenCalledWith(
      expect.any(Id),
      expect.any(String),
      expect.any(Id),
      expect.any(Id),
      expect.any(dayjs),
      expect.any(dayjs),
      'EMAIL_VERIFICATION',
      expect.any(Email),
      expect.any(String),
    );
    expect(mockRepository.persist).toHaveBeenCalledWith(mockEvent);
  });

  it('throws if repository.persist throws', async () => {
    mockRepository.persist.mockRejectedValue(new Error('persist failed'));
    const id = randomUUID();
    const userId = randomUUID();
    const email = 'test@rawstack.io';

    await expect(service.invoke(new Id(id), new Id(userId), new Email(email))).rejects.toThrow('persist failed');
  });
});
