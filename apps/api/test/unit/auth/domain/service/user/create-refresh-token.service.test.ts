import * as dayjs from 'dayjs';
import { createHash, randomUUID } from 'crypto';
import { CreateRefreshTokenService } from '~/auth/domain/service/token/create-refresh-token.service';
import { TokenRepositoryInterface } from '~/auth/domain/model/token/token-repository.interface';
import { TokenHashRepositoryInterface } from '~/auth/domain/model/token/token-hash-repository.interface';
import { TokenModel } from '~/auth/domain/model/token/token.model';
import * as argon2 from 'argon2';
import { EntityNotFoundException } from '~/common/domain/exception/entity-not-found.exception';
import { UnauthorizedException } from '~/common/domain/exception/unauthorized.exception';

jest.mock('argon2', () => ({
  verify: jest.fn(),
}));

describe('CreateRefreshTokenService', () => {
  let service: CreateRefreshTokenService;
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

    service = new CreateRefreshTokenService(mockRepository, mockHashRepository, 12345);
  });

  it('throws exception if user not found', async () => {
    mockRepository.findTokenUserByEmail.mockRejectedValue(new EntityNotFoundException('No user here'));

    const id = randomUUID();
    const email = 'test@rawstack.io';
    const password = 'test123ABC;';

    await expect(service.invoke(id, email, password, undefined, undefined)).rejects.toThrow(UnauthorizedException);

    expect(mockRepository.findTokenUserByEmail).toHaveBeenCalledWith(email, undefined);
  });

  describe('from password', () => {
    it('creates a token for a valid password', async () => {
      const mockUser = {
        id: '123',
        hash: 'hashedPassword',
      } as unknown as { hash: string; id: string };

      const mockToken = {
        id: '456',
      } as unknown as TokenModel;

      mockRepository.findTokenUserByEmail.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      jest.spyOn(TokenModel, 'create').mockReturnValue(mockToken);

      const id = randomUUID();
      const email = 'test@rawstack.io';
      const password = 'test123ABC;';

      await service.invoke(id, email, password, undefined, undefined);

      expect(mockRepository.findTokenUserByEmail).toHaveBeenCalledWith(email, undefined);
      expect(argon2.verify).toHaveBeenCalledWith(mockUser.hash, password);
      expect(TokenModel.create).toHaveBeenCalledWith(
        id,
        expect.any(String),
        mockUser.id,
        expect.any(String),
        expect.any(dayjs),
        expect.any(dayjs),
        'LOGIN',
      );
      expect(mockRepository.persist).toHaveBeenCalledWith(mockToken);
      expect(mockHashRepository.persist).toHaveBeenCalled();
    });

    it('throws exception if passwords do not match', async () => {
      const mockUser = {
        id: '123',
        hash: 'hashedPassword',
      } as unknown as { hash: string; id: string };

      mockRepository.findTokenUserByEmail.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      const id = randomUUID();
      const email = 'test@rawstack.io';
      const password = 'test123ABC;';

      await expect(service.invoke(id, email, password, undefined, undefined)).rejects.toThrow(UnauthorizedException);

      expect(mockRepository.findTokenUserByEmail).toHaveBeenCalledWith(email, undefined);
      expect(argon2.verify).toHaveBeenCalledWith(mockUser.hash, password);
    });
  });

  describe('from refresh token', () => {
    it('creates a token for a valid refresh token', async () => {
      const mockUser = {
        id: '123',
        hash: 'hashedPassword',
      } as unknown as { hash: string; id: string };

      const mockParentToken = {
        id: '456',
        rootTokenId: '789',
        usedAt: undefined,
        isValid: jest.fn().mockReturnValue(true),
        use: jest.fn(),
      } as unknown as TokenModel;

      const mockToken = {
        id: 'abc',
      } as unknown as TokenModel;

      const id = randomUUID();
      const refresh = randomUUID();
      const refreshHash = createHash('sha256').update(refresh, 'utf8').digest('hex');
      const email = 'test@rawstack.io';

      mockRepository.findTokenUserByEmail.mockResolvedValue(mockUser);
      mockRepository.findByTokenHash.mockResolvedValue(mockParentToken);
      jest.spyOn(TokenModel, 'create').mockReturnValue(mockToken);

      await service.invoke(id, email, undefined, refresh, undefined);

      expect(mockRepository.findTokenUserByEmail).toHaveBeenCalledWith(email, undefined);
      expect(mockRepository.findByTokenHash).toHaveBeenCalledWith(refreshHash);
      expect(mockParentToken.use).toHaveBeenCalled();
      expect(mockParentToken.isValid).toHaveBeenCalled();
      expect(TokenModel.create).toHaveBeenCalledWith(
        id,
        expect.any(String),
        mockUser.id,
        mockParentToken.rootTokenId,
        expect.any(dayjs),
        expect.any(dayjs),
        'LOGIN',
      );
      expect(mockRepository.persist).toHaveBeenCalledWith(mockToken);
      expect(mockHashRepository.persist).toHaveBeenCalled();
    });

    it('throws exception for invalid token hash', async () => {
      const mockUser = {
        id: '123',
        hash: 'hashedPassword',
      } as unknown as { hash: string; id: string };

      const id = randomUUID();
      const refresh = randomUUID();
      const refreshHash = createHash('sha256').update(refresh, 'utf8').digest('hex');
      const email = 'test@rawstack.io';

      mockRepository.findTokenUserByEmail.mockResolvedValue(mockUser);
      mockRepository.findByTokenHash.mockRejectedValue(new EntityNotFoundException('No token found for the hash'));

      await expect(service.invoke(id, email, undefined, refresh, undefined)).rejects.toThrow(UnauthorizedException);

      expect(mockRepository.findTokenUserByEmail).toHaveBeenCalledWith(email, undefined);
      expect(mockRepository.findByTokenHash).toHaveBeenCalledWith(refreshHash);
    });

    it('throws exception for invalid token', async () => {
      const mockUser = {
        id: '123',
        hash: 'hashedPassword',
      } as unknown as { hash: string; id: string };

      const mockParentToken = {
        id: '456',
        rootTokenId: '789',
        usedAt: undefined,
        isValid: jest.fn().mockReturnValue(false),
        use: jest.fn(),
      } as unknown as TokenModel;

      const id = randomUUID();
      const refresh = randomUUID();
      const refreshHash = createHash('sha256').update(refresh, 'utf8').digest('hex');
      const email = 'test@rawstack.io';

      mockRepository.findTokenUserByEmail.mockResolvedValue(mockUser);
      mockRepository.findByTokenHash.mockResolvedValue(mockParentToken);

      await expect(service.invoke(id, email, undefined, refresh, undefined)).rejects.toThrow(UnauthorizedException);

      expect(mockRepository.findTokenUserByEmail).toHaveBeenCalledWith(email, undefined);
      expect(mockRepository.findByTokenHash).toHaveBeenCalledWith(refreshHash);
      expect(mockParentToken.use).not.toHaveBeenCalled();
      expect(mockParentToken.isValid).toHaveBeenCalled();
    });

    it('throws exception and deletes the token chain for a used token', async () => {
      const mockUser = {
        id: '123',
        hash: 'hashedPassword',
      } as unknown as { hash: string; id: string };

      const mockParentToken = {
        id: '456',
        rootTokenId: '789',
        usedAt: dayjs(),
        isValid: jest.fn().mockReturnValue(true),
        use: jest.fn(),
      } as unknown as TokenModel;

      const id = randomUUID();
      const refresh = randomUUID();
      const refreshHash = createHash('sha256').update(refresh, 'utf8').digest('hex');
      const email = 'test@rawstack.io';

      mockRepository.findTokenUserByEmail.mockResolvedValue(mockUser);
      mockRepository.findByTokenHash.mockResolvedValue(mockParentToken);

      await expect(service.invoke(id, email, undefined, refresh, undefined)).rejects.toThrow(UnauthorizedException);

      expect(mockRepository.findTokenUserByEmail).toHaveBeenCalledWith(email, undefined);
      expect(mockRepository.findByTokenHash).toHaveBeenCalledWith(refreshHash);
      expect(mockParentToken.use).not.toHaveBeenCalled();
      expect(mockParentToken.isValid).not.toHaveBeenCalled();
      expect(mockRepository.deleteAllByRootTokenId).toHaveBeenCalledWith(mockParentToken.rootTokenId);
    });
  });
});
