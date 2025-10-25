export class CreateEmailVerificationTokenCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly unverifiedEmail: string,
  ) {}
}
