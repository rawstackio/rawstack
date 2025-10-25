import { Controller, Delete, HttpCode, Param, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtGuard } from '~/common/infrastructure/security/guard/auth.guard';
import { DeleteUserCommand } from '~/user/application/command/user/delete-user.command';
import { UserUserGuard } from '~/common/infrastructure/security/guard/user.user.guard';

@Controller('user/users')
export class DeleteUserAction {
  constructor(private commandBus: CommandBus) {}

  @UseGuards(JwtGuard, UserUserGuard({ action: 'DELETE_USER' }))
  @Delete(':userId')
  @HttpCode(204)
  async invoke(@Param('userId') id: string): Promise<any> {
    const command = new DeleteUserCommand(id);

    return await this.commandBus.execute(command);
  }
}
