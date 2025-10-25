import { DtoInterface } from '../../dto/dto.interface';
import DeserializationException from '../../../exception/deserialization.exception';

export class UserDto implements DtoInterface {
  public static readonly version = 1;

  constructor(
    public id: string,
    public email: string,
    public roles: string[],
    public createdAt: Date,
    public updatedAt: Date,
    public unverifiedEmail?: string,
  ) {}

  getId(): string {
    return this.id;
  }

  getVersion(): number {
    return UserDto.version;
  }
}

export function objectToUserDto(obj: object): UserDto {
  if (
    'id' in obj &&
    typeof obj.id === 'string' &&
    'email' in obj &&
    typeof obj.email === 'string' &&
    (('unverifiedEmail' in obj && typeof obj.unverifiedEmail === 'string') || !('unverifiedEmail' in obj)) &&
    'roles' in obj &&
    Array.isArray(obj.roles) &&
    'createdAt' in obj &&
    typeof obj.createdAt === 'string' &&
    'updatedAt' in obj &&
    typeof obj.updatedAt === 'string'
  ) {
    return new UserDto(
      obj.id,
      obj.email,
      obj.roles,
      new Date(obj.createdAt),
      new Date(obj.updatedAt),
      'unverifiedEmail' in obj ? (obj.unverifiedEmail as string) : undefined,
    );
  }

  throw new DeserializationException(`the provided object cannot be converted to a UserDto`);
}
