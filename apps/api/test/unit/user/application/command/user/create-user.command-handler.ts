import { randomUUID } from 'crypto';
import { CreateUserCommandHandler } from '~/user/application/command/user/create-user.command-handler';
import { CreateUserService } from '~/user/domain/service/user/create-user.service';
import { CreateUserCommand } from '~/user/application/command/user/create-user.command';

describe('CreateUserCommandHandler', () => {
  let handler: CreateUserCommandHandler;
  let createService: jest.Mocked<CreateUserService>;

  beforeEach(() => {
    createService = {
      invoke: jest.fn(),
    } as unknown as jest.Mocked<CreateUserService>;

    handler = new CreateUserCommandHandler(createService);
  });

  describe('execute', () => {
    test('it invokes the Create user service', async () => {
      const id = randomUUID();
      const email = 'test@rawstack.io';
      const password = 'test123ABC;';

      const command = new CreateUserCommand(id, email, password);

      await handler.execute(command);

      expect(createService.invoke).toHaveBeenCalledWith(id, email, password);
    });

    // test('it handles known DuplicateEventException errors', async () => {
    //   const id = randomUUID();
    //   const name = 'song listen progress 25%';
    //   const playbackId = randomUUID();
    //   const userId = randomUUID();
    //   const songId = randomUUID();
    //
    //   const command = new CreateEventCommand(id, playbackId, name, userId, songId);
    //
    //   createService.invoke.mockRejectedValue(new DuplicateEventException('duplicate event'));
    //
    //   await expect(handler.execute(command)).rejects.toThrow(ConflictException);
    // });

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
