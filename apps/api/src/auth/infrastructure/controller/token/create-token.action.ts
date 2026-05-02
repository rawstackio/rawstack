import { Body, Controller, Post, Headers, Res } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { Cookie } from '~/common/infrastructure/decorator/cookie.decorator';
import { randomUUID } from 'crypto';
import { CreateTokenRequest } from '~/auth/infrastructure/controller/token/request/create-token.request';
import { CreateTokenCommand } from '~/auth/application/command/token/create-token.command';
import { TokenResponseDto } from '~/auth/application/query/token/dto/token.response-dto';
import { GetTokenQuery } from '~/auth/application/query/token/get-token.query';
import { ItemResponseDtoInterface } from '~/common/application/query/dto/item-response-dto.interface';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class CreateTokenAction {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private configService: ConfigService,
  ) {}

  @Post('tokens')
  async invoke(
    @Body() request: CreateTokenRequest,
    @Headers('auth-context') authContext?: 'browser',
    @Res({ passthrough: true }) res?: Response,
    @Cookie('refresh-token') refreshToken?: string,
  ): Promise<ItemResponseDtoInterface<TokenResponseDto>> {
    const id = randomUUID();

    const command = CreateTokenCommand.fromRequest(id, request, refreshToken);
    await this.commandBus.execute(command);

    const query = new GetTokenQuery(id, request.email);
    let response = await this.queryBus.execute<GetTokenQuery, ItemResponseDtoInterface<TokenResponseDto>>(query);

    if (authContext === 'browser' && 'accessToken' in response.item) {
      const refreshTokenTtlSeconds = this.configService.get<number>('REFRESH_TOKEN_TTL');
      res!.cookie('refresh-token', response.item.refreshToken, {
        httpOnly: true,
        path: '/v1/auth/tokens',
        maxAge: refreshTokenTtlSeconds ? refreshTokenTtlSeconds * 1000 - 60 : response.item.ttlSeconds * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      response.item.refreshToken = undefined;
    }

    return response;
  }
}
