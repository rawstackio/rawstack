import { Injectable } from '@nestjs/common';
import { DtoInterface } from '~/common/application/query/dto/dto.interface';
import { CacheHandlerInterface } from '~/common/domain/cache-handler.interface';

@Injectable()
export class InMemoryCacheHandler implements CacheHandlerInterface {
  private cache: Map<string, unknown> = new Map();
  private rawCache: Map<string, { value: string; expiresAt: number | null }> = new Map();

  getRaw(key: string): Promise<string | null> {
    const entry = this.rawCache.get(key);
    if (!entry) {
      return Promise.resolve(null);
    }
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.rawCache.delete(key);
      return Promise.resolve(null);
    }
    return Promise.resolve(entry.value);
  }

  setRaw(key: string, value: string, ttl: number): Promise<void> {
    const expiresAt = ttl > 0 ? Date.now() + ttl * 1000 : null;
    this.rawCache.set(key, { value, expiresAt });
    return Promise.resolve();
  }

  get<T extends object>(
    id: string,
    className: string,
    version: number,
    transformer?: ((data: object) => T) | undefined,
  ): Promise<T | null> {
    const key = this.getKey(id, className, version);
    const data = this.cache.get(key) as T | undefined;
    if (!data) {
      return Promise.resolve(null);
    }
    if (transformer) {
      return Promise.resolve(transformer(data as object));
    }
    return Promise.resolve(data);
  }

  getMany<T extends DtoInterface>(
    ids: string[],
    className: string,
    version: number,
    transformer?: ((data: object) => T) | undefined,
  ): Promise<(T | null)[]> {
    return Promise.all(ids.map((id) => this.get<T>(id, className, version, transformer)));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  set(dto: DtoInterface, _ttl?: number | undefined): Promise<void> {
    const key = this.getKey(dto.getId(), dto.constructor.name, dto.getVersion());

    this.cache.set(key, dto);
    return Promise.resolve();
  }

  async delete(id: string, className: string, version: number): Promise<void> {
    const key = this.getKey(id, className, version);

    this.cache.delete(key);
  }

  private getKey(id: string, className: string, version: number): string {
    return `${className}:${version}:${id}`;
  }
}
