import { CanActivate, ExecutionContext, Injectable, mixin, Type } from '@nestjs/common';

type UserUserGuardOptions = {
  action: string;
  userIdFrom?: (req: any) => string;
};

export const UserUserGuard = (options: UserUserGuardOptions): Type<CanActivate> => {
  const { action, userIdFrom = (req) => req?.params?.userId } = options;

  @Injectable()
  class UserUserGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      const userId = userIdFrom(request);

      if (!user || !userId) {
        return false;
      }

      if (user.roles.includes('ADMIN')) {
        return true;
      }

      switch (action) {
        case 'UPDATE_USER':
        case 'DELETE_USER':
          return user.id === userId;
        default:
          return false;
      }
    }
  }

  return mixin(UserUserGuardMixin);
};
