import { Inject, Injectable, Logger } from '@nestjs/common';
import { CacheHandlerInterface } from '../../../domain/cache-handler.interface';
import { UserRepositoryInterface } from '~/user/domain/model/user/user-repository.interface';
import { objectToUserDto, UserDto } from '~/common/application/query/user/dto/user.dto';
import DeserializationException from '~/common/application/exception/deserialization.exception';
import { UserRoles } from '~/common/domain/enum/user-roles';
import { Id } from '~/common/domain/model/value-object/id';

@Injectable()
export class UserDtoProvider {
  private readonly logger = new Logger('UserDtoProvider');

  constructor(
    @Inject('UserRepositoryInterface') private repository: UserRepositoryInterface,
    @Inject('CacheHandlerInterface') private cache: CacheHandlerInterface,
  ) {}

  async getById(id: string): Promise<UserDto> {
    let dto: UserDto | null = null;
    try {
      dto = await this.cache.get<UserDto>(id, UserDto.name, UserDto.version, objectToUserDto);
    } catch (e: unknown) {
      if (e instanceof DeserializationException) {
        this.logger.error(e);
      } else {
        throw e;
      }
    }

    if (!dto) {
      const model = await this.repository.findById(new Id(id));
      dto = model.dto;

      await this.cache.set(dto);
    }

    return dto;
  }

  async getByIds(ids: string[]): Promise<UserDto[]> {
    if (!ids.length) {
      return [];
    }

    const dtos = await this.cache.getMany<UserDto>(ids, UserDto.name, UserDto.version, objectToUserDto);
    const uncachedIds = ids.filter((_id, index) => !dtos[index]);

    if (uncachedIds.length) {
      const uncachedUsers = await this.repository.findByIds(uncachedIds.map((item) => new Id(item)));

      for (const uncachedUser of uncachedUsers) {
        const dto = uncachedUser.dto;

        await this.cache.set(dto);

        const dtoIndex = ids.indexOf(dto.id);
        dtos[dtoIndex] = dto;
      }
    }

    return dtos as UserDto[];
  }

  async list(
    page: number,
    perPage: number,
    q?: string,
    role?: UserRoles,
    orderBy?: string,
    orderDirection?: string,
  ): Promise<UserDto[]> {
    const ids = await this.repository.listIds(page, perPage, q, role, orderBy, orderDirection);
    return await this.getByIds(ids);
  }
}
