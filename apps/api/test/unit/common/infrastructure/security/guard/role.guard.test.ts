import { ExecutionContext } from '@nestjs/common';
import { RoleGuard } from '~/common/infrastructure/security/guard/role.guard';
import { UserRoles } from '~/common/domain/enum/user-roles';

const mockExecutionContext = (user: any) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        user,
      }),
    }),
  }) as unknown as ExecutionContext;

describe('RoleGuard', () => {
  it('returns true if user has required role', () => {
    const Guard = RoleGuard(UserRoles.Admin);
    const guard = new Guard();
    const context = mockExecutionContext({ roles: [UserRoles.Admin, UserRoles.VerifiedUser] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('returns false if user does not have required role', () => {
    const Guard = RoleGuard(UserRoles.Admin);
    const guard = new Guard();
    const context = mockExecutionContext({ roles: [UserRoles.VerifiedUser] });
    expect(guard.canActivate(context)).toBe(false);
  });

  it('returns false if user is missing', () => {
    const Guard = RoleGuard(UserRoles.Admin);
    const guard = new Guard();
    const context = mockExecutionContext(undefined);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('returns false if roles property is missing', () => {
    const Guard = RoleGuard(UserRoles.Admin);
    const guard = new Guard();
    const context = mockExecutionContext({});
    expect(guard.canActivate(context)).toBe(false);
  });

  it('returns false if roles is an empty array', () => {
    const Guard = RoleGuard(UserRoles.Admin);
    const guard = new Guard();
    const context = mockExecutionContext({ roles: [] });
    expect(guard.canActivate(context)).toBe(false);
  });
});
