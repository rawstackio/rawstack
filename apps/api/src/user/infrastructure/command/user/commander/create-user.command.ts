import { Command, CommandRunner, InquirerService } from 'nest-commander';
import { CommandBus } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { CreateUserCommand as CQRSCommand } from '../../../../application/command/user/create-user.command';
import { UserRoles } from '~/common/domain/enum/user-roles';

@Command({
  name: 'user:create',
  description: 'a command to create a user',
})
export class CreateUserCommand extends CommandRunner {
  constructor(
    private commandBus: CommandBus,
    private readonly inquirer: InquirerService,
  ) {
    super();
  }

  async run(): Promise<void> {
    const id = randomUUID();

    const values = await this.inquirer.ask<{
      password: string;
      email: string;
      isAdmin?: boolean;
    }>('create-user-questions', undefined);

    console.log({ values });

    // @TODO: add admin role
    const roles = values.isAdmin ? [UserRoles.Admin] : [];
    const command = new CQRSCommand(id, values.email, values.password, roles);
    return await this.commandBus.execute(command);
  }
}
