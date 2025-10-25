import { AsyncLocalStorage } from 'async_hooks';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { APP_PIPE } from '@nestjs/core';
import { LoggedInUser } from './common/domain/logged-in-user';
import { randomUUID } from 'crypto';
import { NextFunction, Request } from 'express';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    CqrsModule.forRoot(),
    UserModule,
    AuthModule,
    CommonModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(
    private readonly als: AsyncLocalStorage<{ requestId: string; actor: LoggedInUser | null }>, // or any other type you want to use for the store
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: Request, res: Response, next: NextFunction) => {
        const store = {
          requestId: randomUUID(),
          actor: null,
        };
        this.als.run(store, () => {
          next();
        });
      })
      .forRoutes('*');
  }
}
