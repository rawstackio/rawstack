export class CreateActionRequestCommand {
  constructor(
    public readonly id: string,
    public readonly token: string,
  ) {}
}
