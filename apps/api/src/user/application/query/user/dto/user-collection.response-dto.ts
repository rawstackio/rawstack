import { UserDto } from '../../../../../common/application/query/user/dto/user.dto';
import { CollectionResponseDtoInterface } from '../../../../../common/application/query/dto/collection-response-dto.interface';

export type UserCollectionResponseDto = CollectionResponseDtoInterface<UserDto>;
