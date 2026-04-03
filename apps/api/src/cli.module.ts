import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { CreateUserCommand } from '~/user/infrastructure/command/user/commander/create-user.command';
import { UserQuestions } from '~/user/infrastructure/command/user/commander/user.questions';

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
  providers: [UserQuestions, CreateUserCommand],
})
export class CliModule {}
