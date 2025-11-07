import { User } from '@rawstack/api-client';

export default class UserModel {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly roles: string[] = [],
    public readonly unverifiedEmail?: string,
  ) {}

  static createFromApiUser(user: User): UserModel {
    return new UserModel(user.id, user.email, user.roles, user.unverifiedEmail);
  }

  get isVerified(): boolean {
    if (!this.unverifiedEmail) {
      return true;
    } else {
      return this.email !== this.unverifiedEmail;
    }
  }
}
