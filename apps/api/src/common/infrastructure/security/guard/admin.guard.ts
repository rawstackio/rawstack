import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserRoles } from '../../../domain/enum/user-roles';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    return !!user?.roles?.includes(UserRoles.Admin);
  }
}
