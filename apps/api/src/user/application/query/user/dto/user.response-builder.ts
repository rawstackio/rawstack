import { Injectable } from '@nestjs/common';
import UserDtoProvider from '../../../../../common/application/query/user/user.dto-provider';
import { UserResponseDto } from './user.response-dto';

@Injectable()
export class UserResponseBuilder {
  constructor(private dtoProvider: UserDtoProvider) {}

  async build(id: string): Promise<UserResponseDto> {
    const dto = await this.dtoProvider.getById(id);

    return {
      item: dto,
    };
  }
}
