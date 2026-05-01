import { User } from '@rawstack/api-client';

export type UserDTO = {
  id: string;
  email: string;
  roles: string[];
  unverifiedEmail: string | undefined;
};

export default class UserModel {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly roles: string[] = [],
    public readonly unverifiedEmail: string | undefined,
  ) {}

  static createFromApiUser(user: User): UserModel {
    return new UserModel(user.id, user.email, user.roles, user.unverifiedEmail);
  }
}
