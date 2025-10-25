import { UserDto } from '../../../../../common/application/query/user/dto/user.dto';
import { ItemResponseDtoInterface } from '../../../../../common/application/query/dto/item-response-dto.interface';

export type UserResponseDto = ItemResponseDtoInterface<UserDto>;
