export class VerifyUserEmailCommand {
  constructor(
    public readonly id: string,
    public readonly email: string,
  ) {}
}
