import * as dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import { TokenRepositoryInterface } from '~/auth/domain/model/token/token-repository.interface';
import { TokenHashRepositoryInterface } from '~/auth/domain/model/token/token-hash-repository.interface';
import { TokenModel } from '~/auth/domain/model/token/token.model';
import { EntityNotFoundException } from '~/common/domain/exception/entity-not-found.exception';
import { UnauthorizedException } from '~/common/domain/exception/unauthorized.exception';
import { CreatePasswordResetTokenService } from '~/auth/domain/service/token/create-password-reset-token.service';

describe('CreatePasswordResetTokenService', () => {
  let service: CreatePasswordResetTokenService;
  let mockRepository: jest.Mocked<TokenRepositoryInterface>;
  let mockHashRepository: jest.Mocked<TokenHashRepositoryInterface>;
  let mockEvent: any;

  beforeEach(async () => {
    mockEvent = {
      id: 123,
    };

    jest.spyOn(TokenModel, 'create').mockReturnValue(mockEvent);

    mockRepository = {
      persist: jest.fn().mockResolvedValue(undefined),
      findByTokenHash: jest.fn(),
      findTokenUserByEmail: jest.fn(),
      deleteAllByRootTokenId: jest.fn(),
    } as unknown as jest.Mocked<TokenRepositoryInterface>;

    mockHashRepository = {
      persist: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<TokenHashRepositoryInterface>;

    service = new CreatePasswordResetTokenService(mockRepository, mockHashRepository, 12345);
  });

  it('it does not throw Exception if user not found', async () => {
    mockRepository.findTokenUserByEmail.mockRejectedValue(new EntityNotFoundException('No user here'));

    const id = randomUUID();
    const email = 'test@rawstack.io';

    await service.invoke(id, email);

    expect(mockRepository.findTokenUserByEmail).toHaveBeenCalledWith(email);
  });

  it('throws Error if user repo throws ', async () => {
    mockRepository.findTokenUserByEmail.mockRejectedValue(new Error('computer says now'));

    const id = randomUUID();
    const email = 'test@rawstack.io';

    await expect(service.invoke(id, email)).rejects.toThrow('computer says now');

    expect(mockRepository.findTokenUserByEmail).toHaveBeenCalledWith(email);
  });

  it('creates a token for a valid user', async () => {
    const mockUser = {
      id: '123',
      hash: 'hashedPassword',
    } as unknown as { hash: string; id: string };

    const mockToken = {
      id: '456',
    } as unknown as TokenModel;

    mockRepository.findTokenUserByEmail.mockResolvedValue(mockUser);
    jest.spyOn(TokenModel, 'create').mockReturnValue(mockToken);

    const id = randomUUID();
    const email = 'test@rawstack.io';

    await service.invoke(id, email);

    expect(mockRepository.findTokenUserByEmail).toHaveBeenCalledWith(email);
    expect(TokenModel.create).toHaveBeenCalledWith(
      id,
      expect.any(String),
      mockUser.id,
      id,
      expect.any(dayjs),
      expect.any(dayjs),
      'PASSWORD_RESET',
      email,
      expect.any(String),
    );
    expect(mockRepository.persist).toHaveBeenCalledWith(mockToken);
    expect(mockHashRepository.persist).toHaveBeenCalled();
  });
});
