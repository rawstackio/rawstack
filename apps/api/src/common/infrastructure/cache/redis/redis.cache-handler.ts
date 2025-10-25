import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CacheHandlerInterface } from '../../../domain/cache-handler.interface';
import { DtoInterface } from '../../../application/query/dto/dto.interface';
import DeserializationException from '~/common/application/exception/deserialization.exception';

@Injectable()
class RedisCacheHandler implements CacheHandlerInterface, OnModuleDestroy {
  protected redis: Redis;
  private readonly logger = new Logger('CacheHandler');

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('REDIS_HOST');
    const port = parseInt(this.config.get<string>('REDIS_PORT') ?? '6379');

    this.redis = new Redis({
      host,
      port,
    });

    this.redis.on('connect', () => {
      this.logger.log(`Redis: Connected; Host: ${host} Port: ${port}`);
    });

    this.redis.on('ready', async () => {
      this.logger.log('Redis: Ready');
    });

    this.redis.on('reconnecting', () => {
      this.logger.log('Redis: Reconnecting');
    });

    this.redis.on('end', () => {
      this.logger.log('Redis: Disconnected');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis: Error:', `Host: ${host} Port: ${port}`, error.message);
    });
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }

  async delete(id: string, className: string, version: number): Promise<void> {
    const key = this.getKey(id, className, version);
    this.redis.del(key);
  }

  async get<T extends object>(
    id: string,
    className: string,
    version: number,
    transformer?: (data: object) => T,
  ): Promise<T | null> {
    const key = this.getKey(id, className, version);
    let data = await this.redis.get(key);

    // if the data is an alias, get the actual data...
    if (typeof data === 'string' && data.startsWith('#')) {
      data = await this.redis.get(data.slice(1));
    }

    if (!data) {
      return null;
    }

    const obj: T = JSON.parse(data);

    if (obj && transformer) {
      return transformer(obj);
    }

    return obj;
  }

  async getMany<T extends DtoInterface>(
    ids: string[],
    className: string,
    version: number,
    transformer?: (data: object) => T,
  ): Promise<(T | null)[]> {
    const keys = ids.map((id) => this.getKey(id + '', className, version));
    const data = await this.redis.mget(...keys);

    return data.map((item) => {
      if (!item) {
        return null;
      }
      const obj = JSON.parse(item);

      if (transformer) {
        try {
          return transformer(obj);
        } catch (e: unknown) {
          if (e instanceof DeserializationException) {
            this.logger.error('Error transforming data', e);
            return null;
          }
          throw e;
        }
      }

      return obj as T;
    });
  }

  async set(dto: DtoInterface): Promise<void> {
    const key = this.getKey(dto.getId(), dto.constructor.name, dto.getVersion());

    // if not set in configt set a default ttl 120 days in seconds
    let ttl = this.config.get<number>('CACHE_TTL');
    if (!ttl) {
      ttl = 60 * 60 * 24 * 120;
    }

    await this.redis.set(key, JSON.stringify(dto), 'EX', ttl);
  }

  private getKey(id: string, className: string, version: number): string {
    return `${className}:${version}:${id}`;
  }

  async setRaw(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, value, 'EX', ttlSeconds);
  }

  async getRaw(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }
}

export default RedisCacheHandler;
