import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserCommandHandler } from './application/command/user/create-user.command-handler';
import { CreateUserService } from './domain/service/user/create-user.service';
import { UserRepositoryPrisma } from '~/user/infrastructure/persistence/user/prisma/user-repository-prisma';
import { CreateUserAction } from './infrastructure/controller/user/create-user.action';
import { UpdateUserAction } from './infrastructure/controller/user/update-user.action';
import { GetUserAction } from './infrastructure/controller/user/get-user.action';
import { UpdateUserCommandHandler } from './application/command/user/update-user.command-handler';
import { GetUserQueryHandler } from './application/query/user/get-user.query-handler';
import { GetCurrentUserAction } from './infrastructure/controller/user/get-current-user.action';
import { DeleteUserCommandHandler } from './application/command/user/delete-user.command-handler';
import { DeleteUserService } from './domain/service/user/delete-user.service';
import { DeleteUserAction } from './infrastructure/controller/user/delete-user.action';
import { ListUsersAction } from './infrastructure/controller/user/list-users.action';
import { ListUsersQueryHandler } from './application/query/user/list-users.query-handler';
import { UserResponseBuilder } from './application/query/user/dto/user.response-builder';
import { UserCollectionResponseBuilder } from './application/query/user/dto/user-collection.response-builder';
import { UserSaga } from './infrastructure/saga/user/saga';
import { UpdateUserService } from './domain/service/user/update-user.service';
import { VerifyUserEmailCommandHandler } from '~/user/application/command/user/verify-user-email.command-handler';
import { VerifyUserEmailService } from '~/user/domain/service/user/verify-user-email.service';
import { UserRepositoryInterface } from '~/user/domain/model/user/user-repository.interface';

const commandHandlers = [
  CreateUserCommandHandler,
  UpdateUserCommandHandler,
  DeleteUserCommandHandler,
  VerifyUserEmailCommandHandler,
];
const queryHandlers = [GetUserQueryHandler, ListUsersQueryHandler];
const controllers = [
  GetCurrentUserAction,
  CreateUserAction,
  UpdateUserAction,
  GetUserAction,
  DeleteUserAction,
  ListUsersAction,
];

@Module({
  controllers,
  providers: [
    UserResponseBuilder,
    UserCollectionResponseBuilder,
    ...commandHandlers,
    ...queryHandlers,
    {
      provide: 'UserRepositoryInterface',
      useClass: UserRepositoryPrisma,
    },
    {
      provide: 'UserResponseBuilderInterface',
      useClass: UserResponseBuilder,
    },
    {
      provide: 'UserCollectionResponseBuilderInterface',
      useClass: UserCollectionResponseBuilder,
    },
    // Domain services need a little special treatment to define them without
    // using nestjs decorators
    {
      provide: CreateUserService,
      useFactory: (repo: UserRepositoryInterface) => new CreateUserService(repo),
      inject: ['UserRepositoryInterface'],
    },
    {
      provide: DeleteUserService,
      useFactory: (repo: UserRepositoryInterface) => new DeleteUserService(repo),
      inject: ['UserRepositoryInterface'],
    },
    {
      provide: UpdateUserService,
      useFactory: (repo: UserRepositoryInterface) => new UpdateUserService(repo),
      inject: ['UserRepositoryInterface'],
    },
    {
      provide: VerifyUserEmailService,
      useFactory: (repo: UserRepositoryInterface) => new VerifyUserEmailService(repo),
      inject: ['UserRepositoryInterface'],
    },
    // Saga
    UserSaga,
  ],
  imports: [CqrsModule],
  exports: ['UserRepositoryInterface'],
})
export class UserModule {}
