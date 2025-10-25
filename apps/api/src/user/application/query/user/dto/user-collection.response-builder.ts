import { Inject, Injectable } from '@nestjs/common';
import UserDtoProvider from '../../../../../common/application/query/user/user.dto-provider';
import { UserCollectionResponseDto } from './user-collection.response-dto';
import { UserRepositoryInterface } from '../../../../domain/model/user/user-repository.interface';
import {
  PAGINATION_DEFAULT_PAGE,
  PAGINATION_DEFAULT_PER_PAGE,
} from '../../../../../common/application/query/dto/pagination-dto.interface';

@Injectable()
export class UserCollectionResponseBuilder {
  constructor(
    @Inject('UserRepositoryInterface') private repository: UserRepositoryInterface,
    private dtoProvider: UserDtoProvider,
  ) {}

  async build(page?: number, perPage?: number, q?: string): Promise<UserCollectionResponseDto> {
    page = page || PAGINATION_DEFAULT_PAGE;
    const take = perPage || PAGINATION_DEFAULT_PER_PAGE;

    const users = await this.dtoProvider.list(page, take, q);
    const count = await this.repository.count(q);

    const meta = {
      pagination: {
        page,
        perPage: take,
        totalItems: count,
      },
    };

    return {
      items: users,
      meta,
    };
  }
}
