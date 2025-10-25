export class LoggedInUser {
  constructor(
    public id: string,
    public roles: string[] = [],
  ) {}
}
