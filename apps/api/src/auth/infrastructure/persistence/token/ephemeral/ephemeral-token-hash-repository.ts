import { Injectable } from '@nestjs/common';
import { TokenHashRepositoryInterface } from '~/auth/domain/model/token/token-hash-repository.interface';

@Injectable()
export class EphemeralTokenHashRepository implements TokenHashRepositoryInterface {
  private store: Map<string, string> = new Map();

  findByTokenHash(tokenHash: string): string {
    const value = this.store.get(tokenHash);
    if (!value) {
      throw new Error('Token hash value not found');
    }

    this.store.delete(tokenHash);

    return value;
  }

  persist(tokenHash: string, value: string): void {
    this.store.set(tokenHash, value);
  }
}
