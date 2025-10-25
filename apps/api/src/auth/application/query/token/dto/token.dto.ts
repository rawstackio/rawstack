export class TokenDto {
  constructor(
    public readonly id: string,
    public readonly expiresAt: Date,
  ) {}
}
