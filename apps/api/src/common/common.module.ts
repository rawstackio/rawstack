import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AsyncLocalStorage } from 'async_hooks';
import { Global, Module } from '@nestjs/common';
import { JwtStrategy } from './infrastructure/security/strategy/jwt.strategy';
import UserDtoProvider from './application/query/user/user.dto-provider';
import { UserModule } from '~/user/user.module';
import { PrismaService } from './infrastructure/persistence/prisma/prisma.service';
import RedisCacheHandler from './infrastructure/cache/redis/redis.cache-handler';
import { EventBusAdaptor, ExternalEventBus } from './infrastructure/event/external.event-bus';
import { EventBridgeAdaptor } from './infrastructure/event/adaptor/event-bridge.adaptor';
import { LoggedInUserProvider } from './infrastructure/security/provider/logged-in-user.provider';
import { RequestIdProvider } from './infrastructure/logging/request-id-provider';
import { Encoder } from '~/common/infrastructure/jwt/encoder';
// import { InMemoryCacheHandler } from '~/common/infrastructure/cache/inMemory/in-memory.cache-handler';
import { NestJwtTokenVerifier } from '~/common/infrastructure/security/jwt/NestJwtTokenVerifier';
import { InMemoryAdaptor } from '~/common/infrastructure/event/adaptor/in-memory.adaptor';

export const isTestEnvironment = () => {
  return process.env.NODE_ENV === 'test';
};

@Global()
@Module({
  providers: [
    {
      provide: 'JWT_SECRET',
      useFactory: (configService: ConfigService) => configService.get<string>('JWT_SECRET'),
      inject: [ConfigService],
    },
    {
      provide: 'CacheHandlerInterface',
      //useClass: isTestEnvironment() ? InMemoryCacheHandler : RedisCacheHandler,
      useClass: RedisCacheHandler,
    },
    RequestIdProvider,
    Encoder,
    LoggedInUserProvider,
    PrismaService,
    JwtStrategy,
    UserDtoProvider,
    EventBridgeAdaptor,
    InMemoryAdaptor,
    {
      provide: 'EventBusAdaptors',
      useFactory: (...adaptor: EventBusAdaptor[]) => adaptor,
      inject: isTestEnvironment() ? [InMemoryAdaptor] : [EventBridgeAdaptor],
    },
    ExternalEventBus,
    {
      provide: 'CacheHandlerInterface',
      useClass: RedisCacheHandler,
    },
    {
      provide: AsyncLocalStorage,
      useValue: new AsyncLocalStorage(),
    },
    {
      provide: 'TokenVerifierInterface',
      useClass: NestJwtTokenVerifier,
    },
  ],
  imports: [CqrsModule, UserModule, JwtModule.register({})],
  exports: [
    'JWT_SECRET',
    AsyncLocalStorage,
    'CacheHandlerInterface',
    'TokenVerifierInterface',
    LoggedInUserProvider,
    RequestIdProvider,
    UserDtoProvider,
    PrismaService,
    Encoder,
  ],
})
export class CommonModule {}
