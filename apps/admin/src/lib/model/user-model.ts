import dayjs, { Dayjs } from 'dayjs';
import { User } from '@rawstack/api-client';

export default class UserModel {
  public readonly dateCreated: Dayjs;
  public readonly dateUpdated: Dayjs;

  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly roles: string[],
    dateCreated: string,
    dateUpdated: string,
    public readonly unverifiedEmail?: string,
  ) {
    this.dateCreated = dayjs(dateCreated);
    this.dateUpdated = dayjs(dateUpdated);
  }

  get isAdmin(): boolean {
    return this.roles.includes('ADMIN');
  }

  get isVerified(): boolean {
    return this.roles.includes('VERIFIED_USER');
  }

  static createFromApiUser(user: User): UserModel {
    return new UserModel(user.id, user.email, user.roles, user.createdAt, user.updatedAt, user.unverifiedEmail);
  }
}
