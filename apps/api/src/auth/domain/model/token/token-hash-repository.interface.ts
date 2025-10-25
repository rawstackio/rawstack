export interface TokenHashRepositoryInterface {
  findByTokenHash(tokenHash: string): string;
  persist(tokenHash: string, value: string): void;
}
