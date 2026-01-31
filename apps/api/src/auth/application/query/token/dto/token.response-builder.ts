import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as dayjs from 'dayjs';
import { TokenResponseDto } from './token.response-dto';
import { TokenRepositoryInterface } from '~/auth/domain/model/token/token-repository.interface';
import { ItemResponseDtoInterface } from '~/common/application/query/dto/item-response-dto.interface';
import { TokenHashRepositoryInterface } from '~/auth/domain/model/token/token-hash-repository.interface';
import { EntityNotFoundException } from '~/common/domain/exception/entity-not-found.exception';
import { TokenModel } from '~/auth/domain/model/token/token.model';
import { Id } from '~/common/domain/model/value-object/id';

@Injectable()
export class TokenResponseBuilder {
  constructor(
    private jwt: JwtService,
    @Inject('TokenRepositoryInterface') private repository: TokenRepositoryInterface,
    @Inject('TokenHashRepositoryInterface') private hashRepository: TokenHashRepositoryInterface,
    private config: ConfigService,
  ) {}

  async build(id: string, email: string): Promise<ItemResponseDtoInterface<TokenResponseDto>> {
    const actionResponse: ItemResponseDtoInterface<TokenResponseDto> = {
      item: {
        action: 'CHECK_EMAIL',
      },
    };

    let token: TokenModel;
    try {
      token = await this.repository.findById(new Id(id));
    } catch (error: unknown) {
      if (error instanceof EntityNotFoundException) {
        return actionResponse;
      }
      throw error;
    }

    if (token.type !== 'LOGIN') {
      return actionResponse;
    }

    const accessTokenTtlSeconds = Number(this.config.get<number>('ACCESS_TOKEN_TTL')!);
    const accessTokenExpiresAt = dayjs().add(accessTokenTtlSeconds, 'seconds');

    const payload = { sub: token.userId.toString(), email };
    const secret = this.config.get('JWT_SECRET');
    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: accessTokenTtlSeconds,
      secret,
    });

    return {
      item: {
        accessToken: accessToken,
        ttlSeconds: accessTokenTtlSeconds,
        expiresAt: accessTokenExpiresAt.toDate(),
        refreshToken: this.hashRepository.findByTokenHash(token.tokenHash),
      },
    };
  }
}
