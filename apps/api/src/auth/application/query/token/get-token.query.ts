export class GetTokenQuery {
  constructor(
    public readonly id: string,
    public readonly email: string,
  ) {}
}
