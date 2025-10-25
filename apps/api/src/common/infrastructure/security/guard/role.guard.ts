import { CanActivate, ExecutionContext, Injectable, mixin, Type } from '@nestjs/common';
import { UserRoles } from '~/common/domain/enum/user-roles';

export const RoleGuard = (role: UserRoles): Type<CanActivate> => {
  @Injectable()
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      return !!user?.roles?.includes(role);
    }
  }

  return mixin(RoleGuardMixin);
};
