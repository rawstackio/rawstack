import { randomUUID } from 'crypto';
import { Command, InquirerService } from 'nest-commander';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand as CQRSCommand } from '../../../../application/command/user/create-user.command';
import { UserRoles } from '~/common/domain/enum/user-roles';
import { BaseCommandRunner } from '~/common/infrastructure/cli/base.command-runner';

@Command({
  name: 'user:create',
  description: 'a command to create a user',
})
export class CreateUserCommand extends BaseCommandRunner {
  constructor(
    private commandBus: CommandBus,
    private readonly inquirer: InquirerService,
  ) {
    super();
  }

  async execute(): Promise<void> {
    const id = randomUUID();

    const values = await this.inquirer.ask<{
      password?: string;
      email: string;
      isAdmin?: boolean;
    }>('create-user-questions', undefined);

    const roles = values.isAdmin ? [UserRoles.Admin] : [];

    const command = new CQRSCommand(id, values.email, values.password, roles);
    await this.commandBus.execute(command);
  }
}
