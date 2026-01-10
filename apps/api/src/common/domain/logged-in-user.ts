import { Id } from '~/common/domain/model/value-object/id';

export class LoggedInUser {
  constructor(
    public id: Id,
    public roles: string[] = [],
  ) {}
}
