import { randomUUID } from 'crypto';
import { CreateTokenCommandHandler } from '~/auth/application/command/token/create-token.command-handler';
import { CreateRefreshTokenService } from '~/auth/domain/service/token/create-refresh-token.service';
import { CreatePasswordResetTokenService } from '~/auth/domain/service/token/create-password-reset-token.service';
import { CreateTokenCommand } from '~/auth/application/command/token/create-token.command';

describe('CreateTokenCommandHandler', () => {
  let handler: CreateTokenCommandHandler;
  let refreshTokenService: jest.Mocked<CreateRefreshTokenService>;
  let passwordResetService: jest.Mocked<CreatePasswordResetTokenService>;

  beforeEach(() => {
    refreshTokenService = {
      invoke: jest.fn(),
    } as unknown as jest.Mocked<CreateRefreshTokenService>;

    passwordResetService = {
      invoke: jest.fn(),
    } as unknown as jest.Mocked<CreatePasswordResetTokenService>;

    handler = new CreateTokenCommandHandler(refreshTokenService, passwordResetService);
  });

  describe('execute', () => {
    test('it invokes the CreateRefreshTokenService with email and password', async () => {
      const id = randomUUID();
      const email = 'test@rawstack.io';
      const password = 'test123ABC;';

      const command = new CreateTokenCommand(id, email, password);

      await handler.execute(command);

      expect(refreshTokenService.invoke).toHaveBeenCalledWith(id, email, password);
    });

    test('it invokes the CreateRefreshTokenService with email and refresh token', async () => {
      const id = randomUUID();
      const email = 'test@rawstack.io';
      const refreshToken = randomUUID();

      const command = new CreateTokenCommand(id, email);

      await handler.execute(command);

      expect(refreshTokenService.invoke).toHaveBeenCalledWith(id, email, undefined, refreshToken);
    });

    // test('it rethrowsun known errors', async () => {
    //   const id = randomUUID();
    //   const name = 'song listen progress 25%';
    //   const playbackId = randomUUID();
    //   const userId = randomUUID();
    //   const songId = randomUUID();
    //
    //   const command = new CreateEventCommand(id, playbackId, name, userId, songId);
    //
    //   createService.invoke.mockRejectedValue(new Error('computer says no'));
    //
    //   await expect(handler.execute(command)).rejects.toThrow('computer says no');
    // });
  });
});
