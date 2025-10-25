import { Inject, Injectable } from '@nestjs/common';
import { Prisma, Roles, Token } from '@prisma/client';
import * as dayjs from 'dayjs';
import { TokenRepositoryInterface } from '~/auth/domain/model/token/token-repository.interface';
import { TokenModel } from '~/auth/domain/model/token/token.model';
import BaseRepositoryPrisma from '~/common/infrastructure/persistence/prisma/base-repository-prisma';
import { EntityNotFoundException } from '~/common/domain/exception/entity-not-found.exception';
import { Encoder } from '~/common/infrastructure/jwt/encoder';
import { DomainEventInterface } from '~/common/domain/model/event/domain-event.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenRepositoryPrisma extends BaseRepositoryPrisma implements TokenRepositoryInterface {
  @Inject(Encoder)
  protected readonly encoder!: Encoder;

  @Inject(ConfigService)
  protected readonly config!: ConfigService;

  protected async eventPrePublishHook(event: DomainEventInterface): Promise<void> {
    await super.eventPrePublishHook(event);
    if (event.eventName === 'auth.token.wasCreated' && event.data.type === 'EMAIL_VERIFICATION') {
      const payload = {
        type: 'EMAIL_VERIFICATION',
        id: event.entityId,
        userId: event.data.userId,
        email: event.data.email,
      };

      const validity = this.config.get<number>('EMAIL_VERIFICATION_TOKEN_TTL');
      const token = await this.encoder.encode(validity ?? 300, payload);
      event.data.token = token.token;
    }
  }

  async persist(token: TokenModel): Promise<TokenModel> {
    return await this.saveAndPublish<TokenModel>(token, async (token) => {
      if (!token.internalId) {
        const data: Prisma.TokenCreateInput = {
          id: token.id,
          tokenHash: token.tokenHash,
          userId: token.userId,
          rootTokenId: token.rootTokenId,
          createdAt: token.createdAt.toDate(),
          expiresAt: token.expiresAt.toDate(),
          type: token.type,
        };

        const prismaToken = await this.prisma.token.create({ data });

        token.internalId = prismaToken.internalId;
      } else {
        const data: Prisma.TokenUpdateInput = {
          id: token.id,
          userId: token.userId,
          rootTokenId: token.rootTokenId,
          createdAt: token.createdAt.toDate(),
          expiresAt: token.expiresAt.toDate(),
          type: token.type,
        };

        if (token.usedAt) {
          data.usedAt = token.usedAt.toDate();
        }

        await this.prisma.token.update({
          where: { id: token.id },
          data,
        });
      }

      return token;
    });
  }

  async findById(id: string): Promise<TokenModel> {
    const token = await this.prisma.token.findUnique({
      where: { id },
    });

    if (!token || token.expiresAt < new Date()) {
      throw new EntityNotFoundException(`Token with id ${id} not found`);
    }

    return this.modelFromPrisma(token);
  }

  async findByTokenHash(hash: string): Promise<TokenModel> {
    const token = await this.prisma.token.findUnique({
      where: { tokenHash: hash },
    });

    if (!token || token.expiresAt < new Date()) {
      throw new EntityNotFoundException(`Token with provided hashed token not found`);
    }

    return this.modelFromPrisma(token);
  }

  async deleteAllByRootTokenId(id: string, whereNotId?: boolean): Promise<void> {
    const where = whereNotId ? { rootTokenId: { not: id } } : { rootTokenId: id };

    await this.prisma.token.deleteMany({
      where,
    });
  }

  async findTokenUserByEmail(email: string, role?: string): Promise<{ hash: string; id: string }> {
    let where: Prisma.UserWhereUniqueInput = { email };
    if (role) {
      where = {
        ...where,
        roles: { has: role as Roles },
      };
    }
    const user = await this.prisma.user.findUnique({
      where,
    });

    if (!user) {
      throw new EntityNotFoundException(`User with email ${email} not found`);
    }

    return { hash: user.hash, id: user.id };
  }

  protected modelFromPrisma(token: Token): TokenModel {
    const model = new TokenModel(
      token.id,
      token.tokenHash,
      token.userId,
      token.rootTokenId,
      dayjs(token.createdAt),
      dayjs(token.expiresAt),
      token.type,
    );
    model.internalId = token.internalId;
    model.usedAt = token.usedAt ? dayjs(token.usedAt) : undefined;

    return model;
  }
}
