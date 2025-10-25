import { Injectable } from '@nestjs/common';
import { DtoInterface } from '~/common/application/query/dto/dto.interface';
import { CacheHandlerInterface } from '~/common/domain/cache-handler.interface';

@Injectable()
export class InMemoryCacheHandler implements CacheHandlerInterface {
  getRaw(key: string): Promise<string | null> {
    throw new Error('Method not implemented.');
  }
  setRaw(key: string, value: string, ttl: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
  private cache: Map<string, any> = new Map();

  get<T extends object>(
    id: string,
    className: string,
    version: number,
    transformer?: ((data: object) => T) | undefined,
  ): Promise<T | null> {
    const key = this.getKey(id, className, version);
    const data = this.cache.get(key);
    if (!data) {
      return Promise.resolve(null);
    }
    if (transformer) {
      return Promise.resolve(transformer(data));
    }
    return Promise.resolve(data as T);
  }

  getMany<T extends DtoInterface>(
    ids: string[],
    className: string,
    version: number,
    transformer?: ((data: object) => T) | undefined,
  ): Promise<(T | null)[]> {
    throw new Error('Method not implemented.');
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
