import { randomUUID } from 'crypto';
import { CreateUserCommandHandler } from '~/user/application/command/user/create-user.command-handler';
import { CreateUserService } from '~/user/domain/service/user/create-user.service';
import { CreateUserCommand } from '~/user/application/command/user/create-user.command';
import { LoggedInUserProvider } from '~/common/infrastructure/security/provider/logged-in-user.provider';
import { LoggedInUser } from '~/common/domain/logged-in-user';
import { UserRoles } from '~/common/domain/enum/user-roles';

describe('CreateUserCommandHandler', () => {
  let handler: CreateUserCommandHandler;
  let createService: jest.Mocked<CreateUserService>;
  let actorProvider: jest.Mocked<LoggedInUserProvider>;

  beforeEach(() => {
    createService = {
      invoke: jest.fn(),
    } as unknown as jest.Mocked<CreateUserService>;

    actorProvider = {
      getLoggedInUser: jest.fn(),
    } as unknown as jest.Mocked<LoggedInUserProvider>;

    handler = new CreateUserCommandHandler(createService, actorProvider);
  });

  describe('execute', () => {
    test('it invokes the Create user service with password', async () => {
      const id = randomUUID();
      const email = 'test@rawstack.io';
      const password = 'test123ABC;';
      const actor = null;

      actorProvider.getLoggedInUser.mockReturnValue(actor);

      const command = new CreateUserCommand(id, email, password);

      await handler.execute(command);

      expect(createService.invoke).toHaveBeenCalledWith(actor, id, email, password, [], true);
    });

    test('it generates random UUID password when password is not provided', async () => {
      const id = randomUUID();
      const email = 'test@rawstack.io';
      const actor = new LoggedInUser('admin-id', [UserRoles.Admin]);

      actorProvider.getLoggedInUser.mockReturnValue(actor);

      const command = new CreateUserCommand(id, email, undefined);

      await handler.execute(command);

      expect(createService.invoke).toHaveBeenCalledWith(
        actor,
        id,
        email,
        expect.any(String), // The generated UUID password
        [],
        false, // passwordWasProvided = false
      );

      // Verify the generated password is a valid UUID format
      const generatedPassword = (createService.invoke as jest.Mock).mock.calls[0][3];
      expect(generatedPassword).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });
});
