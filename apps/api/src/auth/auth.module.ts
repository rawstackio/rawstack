import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { TokenSaga } from '~/auth/infrastructure/saga/token/token.saga';
import { CreateTokenAction } from './infrastructure/controller/token/create-token.action';
import { TokenRepositoryPrisma } from '~/auth/infrastructure/persistence/token/prisma/token-repository-prisma';
import { GetTokenQueryHandler } from '~/auth/application/query/token/get-token.query-handler';
import { CreateTokenCommandHandler } from '~/auth/application/command/token/create-token.command-handler';
import { CreateRefreshTokenService } from './domain/service/token/create-refresh-token.service';
import { TokenResponseBuilder } from '~/auth/application/query/token/dto/token.response-builder';
import { CreatePasswordResetTokenService } from './domain/service/token/create-password-reset-token.service';
import { CreateEmailVerificationTokenService } from './domain/service/token/create-email-verification-token.service';
import { CreateEmailVerificationTokenCommandHandler } from '~/auth/application/command/token/create-email-verification-token.command-handler';
import { CreateActionRequestAction } from '~/auth/infrastructure/controller/action-request/create-action-request.action';
import { CreateActionRequestCommandHandler } from '~/auth/application/command/action-request/create-action-request.command-handler';
import { CreateActionRequestService } from '~/auth/domain/service/action-request/create-action-request.service';
import { EphemeralTokenHashRepository } from '~/auth/infrastructure/persistence/token/ephemeral/ephemeral-token-hash-repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenRepositoryInterface } from '~/auth/domain/model/token/token-repository.interface';
import { TokenHashRepositoryInterface } from '~/auth/domain/model/token/token-hash-repository.interface';
import { TokenVerifierInterface } from '~/common/domain/token-verifier.interface';
import { ActionRequestSaga } from '~/auth/infrastructure/saga/action-request/action-request.saga';
import { GetActionRequestAction } from '~/auth/infrastructure/controller/action-request/get-action-request.action';
import { UpdateTokenActionStatusCommandHandler } from '~/auth/application/command/token/update-token-action-status.command-handler';
import { ActionRequestRepositoryInterface } from '~/auth/domain/model/action-request/action-request-repository.interface';
import { VerifyAndUseTokenService } from '~/auth/domain/service/token/verify-and-use-token.service';
import { ActionRequestRepositoryRedis } from '~/auth/infrastructure/persistence/action-request/redis/action-request-repository-redis';
import { GetActionRequestQueryHandler } from '~/auth/application/query/action-request/get-action-request.query-handler';
import { ExtractActionRequestDataService } from '~/auth/domain/service/action-request/extract-action-request-data.service';
import { UpdateActionRequestService } from '~/auth/domain/service/action-request/update-action-request.service';
import { ActionRequestResponseBuilder } from '~/auth/application/query/action-request/dto/action-request.response-builder';

@Module({
  imports: [JwtModule.register({}), CqrsModule, ConfigModule],
  controllers: [CreateTokenAction, CreateActionRequestAction, GetActionRequestAction],
  providers: [
    // Command Handler
    CreateTokenCommandHandler,
    CreateEmailVerificationTokenCommandHandler,
    CreateActionRequestCommandHandler,
    UpdateTokenActionStatusCommandHandler,
    // Query Handler
    GetTokenQueryHandler,
    GetActionRequestQueryHandler,
    // Response Builder
    ActionRequestResponseBuilder,
    TokenResponseBuilder,
    // Saga
    TokenSaga,
    ActionRequestSaga,
    {
      provide: 'TokenRepositoryInterface',
      useClass: TokenRepositoryPrisma,
    },
    {
      provide: 'TokenHashRepositoryInterface',
      useClass: EphemeralTokenHashRepository,
    },
    {
      provide: 'ActionRequestRepositoryInterface',
      useClass: ActionRequestRepositoryRedis,
    },
    {
      provide: 'PASSWORD_RESET_TOKEN_TTL',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get<string>('PASSWORD_RESET_TOKEN_TTL'),
    },
    // Domain services:
    // these need a little special treatment to define them without
    // using nestjs decorators
    {
      provide: CreateRefreshTokenService,
      useFactory: (repo: TokenRepositoryInterface, hashRepo: TokenHashRepositoryInterface) =>
        new CreateRefreshTokenService(repo, hashRepo, parseInt(process.env.REFRESH_TOKEN_TTL ?? '3600', 10)),
      inject: ['TokenRepositoryInterface', 'TokenHashRepositoryInterface'],
    },
    {
      provide: CreateEmailVerificationTokenService,
      useFactory: (repo: TokenRepositoryInterface) =>
        new CreateEmailVerificationTokenService(repo, parseInt(process.env.EMAIL_VERIFICATION_TOKEN_TTL ?? '3600', 10)),
      inject: ['TokenRepositoryInterface'],
    },
    {
      provide: CreatePasswordResetTokenService,
      useFactory: (repo: TokenRepositoryInterface, hashRepo: TokenHashRepositoryInterface) =>
        new CreatePasswordResetTokenService(
          repo,
          hashRepo,
          parseInt(process.env.PASWORD_RESET_TOKEN_TTL ?? '3600', 10),
        ),
      inject: ['TokenRepositoryInterface', 'TokenHashRepositoryInterface'],
    },
    {
      provide: ExtractActionRequestDataService,
      useFactory: (verifier: TokenVerifierInterface) => new ExtractActionRequestDataService(verifier),
      inject: ['TokenVerifierInterface'],
    },
    {
      provide: CreateActionRequestService,
      useFactory: (repo: ActionRequestRepositoryInterface) => new CreateActionRequestService(repo),
      inject: ['ActionRequestRepositoryInterface'],
    },
    {
      provide: UpdateActionRequestService,
      useFactory: (repo: ActionRequestRepositoryInterface) => new UpdateActionRequestService(repo),
      inject: ['ActionRequestRepositoryInterface'],
    },
    {
      provide: VerifyAndUseTokenService,
      useFactory: (repo: TokenRepositoryInterface) => new VerifyAndUseTokenService(repo),
      inject: ['TokenRepositoryInterface'],
    },
  ],
})
export class AuthModule {}
