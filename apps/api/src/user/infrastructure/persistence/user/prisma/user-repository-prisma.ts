import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { Prisma, Roles, User } from '@prisma/client';
import { UserRepositoryInterface } from '~/user/domain/model/user/user-repository.interface';
import { UserModel } from '~/user/domain/model/user/user.model';
import BaseRepositoryPrisma from '~/common/infrastructure/persistence/prisma/base-repository-prisma';
import { EntityNotFoundException } from '~/common/domain/exception/entity-not-found.exception';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConflictException } from '~/common/domain/exception/conflict.exception';
import { UserRoles } from '~/common/domain/enum/user-roles';

@Injectable()
export class UserRepositoryPrisma extends BaseRepositoryPrisma implements UserRepositoryInterface {
  async persist(user: UserModel): Promise<UserModel> {
    return await this.saveAndPublish<UserModel>(user, async (user) => {
      try {
        // update
        if (user.internalId) {
          const data: Prisma.UserUpdateInput = {
            id: user.id,
            email: user.email,
            unverifiedEmail: user.unverifiedEmail,
            roles: user.roles as Roles[],
            createdAt: user.createdAt.toDate(),
            updatedAt: user.updatedAt.toDate(),
            deletedAt: user.deletedAt?.toDate(),
            hash: user.password,
          };

          await this.prisma.user.update({
            where: { id: user.id },
            data,
          });
        }
        // create
        else {
          if (!user.password) {
            throw new Error('User password is required for creation'); // @todo: INfrastructureException ??
          }

          const data: Prisma.UserCreateInput = {
            id: user.id,
            email: user.email,
            unverifiedEmail: user.unverifiedEmail,
            hash: user.password,
            roles: user.roles as Roles[],
            createdAt: user.createdAt.toDate(),
            updatedAt: user.updatedAt.toDate(),
          };

          const prismaUser = await this.prisma.user.create({
            data,
          });

          user.internalId = prismaUser.internalId;
        }

        return user;
      } catch (error: unknown) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ConflictException(`a user with the email "${user.email}" already exists`);
          }
        }
        throw error;
      }
    });
  }

  async findById(id: string): Promise<UserModel> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.deletedAt) {
      throw new EntityNotFoundException(`User with id ${id} not found`);
    }

    return this.modelFromPrisma(user);
  }

  async findByIds(ids: string[]): Promise<UserModel[]> {
    const rows = await this.prisma.user.findMany({ where: { id: { in: ids } } });

    if (rows.length !== ids.length) {
      const foundIds = rows.map((device) => device.id);
      const missingIds = ids.filter((id) => !foundIds.includes(id));
      throw new EntityNotFoundException(`Users with ids "${missingIds.join(', ')}" not found`);
    }

    return rows.map((row) => this.modelFromPrisma(row));
  }

  async listIds(page: number, perPage: number, q?: string): Promise<string[]> {
    let where: Prisma.UserWhereInput = { deletedAt: null };

    if (q) {
      where = {
        deletedAt: null,
        email: {
          contains: q,
          mode: 'insensitive',
        },
      };
    }

    const users = await this.prisma.user.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      where,
      select: {
        id: true,
      },
    });

    return users.map((image) => image.id);
  }

  async count(q?: string): Promise<number> {
    let where: Prisma.UserWhereInput = { deletedAt: null };
    if (q) {
      where = {
        deletedAt: null,
        email: {
          contains: q,
          mode: 'insensitive',
        },
      };
    }

    return this.prisma.user.count({
      where,
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.prisma.user
      .count({
        where: { email },
      })
      .then((count) => count > 0);
  }

  protected modelFromPrisma(prismaUser: User): UserModel {
    const user = new UserModel(prismaUser.id, prismaUser.email, prismaUser.roles as UserRoles[]);

    user.unverifiedEmail = prismaUser.unverifiedEmail ?? undefined;
    user.createdAt = dayjs(prismaUser.createdAt);
    user.updatedAt = dayjs(prismaUser.updatedAt);
    user.deletedAt = prismaUser.deletedAt ? dayjs(prismaUser.deletedAt) : undefined;
    user.internalId = prismaUser.internalId;

    return user;
  }
}
