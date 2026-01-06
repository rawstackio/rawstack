import { INestApplication } from '@nestjs/common';
import * as argon from 'argon2';
import * as dayjs from 'dayjs';
import { UserModel } from '~/user/domain/model/user/user.model';
import { UserRepositoryInterface } from '~/user/domain/model/user/user-repository.interface';
import { randomUUID } from 'crypto';
import { PrismaService } from '~/common/infrastructure/persistence/prisma/prisma.service';
import { UserRoles } from '~/common/domain/enum/user-roles';
import {Id} from "~/common/domain/model/value-object/id";
import {Email} from "~/common/domain/model/value-object/email";

class UserProvider {
  public ids: string[] = [];
  readonly defaultPassword: string = 'password1';

  async createUser(
    app: INestApplication,
    email: string,
    password: string = this.defaultPassword,
    roles: UserRoles[] = [],
  ): Promise<UserModel> {
    const id = new Id(randomUUID());
    const hashedPassword = await argon.hash(password);
    const dateNow = dayjs();

    const user = UserModel.create(dateNow, id, new Email(email), hashedPassword, roles);

    const repo: UserRepositoryInterface = app.get('UserRepositoryInterface');
    await repo.persist(user);

    this.ids.push(id.toString());

    return user;
  }

  async deleteUsers(app: INestApplication, emails: string[]): Promise<void> {
    const prisma = app.get(PrismaService);

    await prisma.user.deleteMany({
      where: {
        email: { in: emails },
      },
    });
    this.ids = [];
  }
}

export default new UserProvider();
