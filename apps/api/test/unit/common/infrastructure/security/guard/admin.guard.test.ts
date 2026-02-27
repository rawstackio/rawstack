import { ExecutionContext } from '@nestjs/common';
import { AdminGuard } from '~/common/infrastructure/security/guard/admin.guard';
import { UserRoles } from '~/common/domain/enum/user-roles';

const mockExecutionContext = (user: any) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        user,
      }),
    }),
  }) as unknown as ExecutionContext;

describe('AdminGuard', () => {
  it('returns true if user has Admin role', () => {
    const guard = new AdminGuard();
    const context = mockExecutionContext({ roles: [UserRoles.Admin, UserRoles.VerifiedUser] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('returns false if user does not have Admin role', () => {
    const guard = new AdminGuard();
    const context = mockExecutionContext({ roles: [UserRoles.VerifiedUser] });
    expect(guard.canActivate(context)).toBe(false);
  });

  it('returns false if user is missing', () => {
    const guard = new AdminGuard();
    const context = mockExecutionContext(undefined);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('returns false if roles property is missing', () => {
    const guard = new AdminGuard();
    const context = mockExecutionContext({});
    expect(guard.canActivate(context)).toBe(false);
  });

  it('returns false if roles is an empty array', () => {
    const guard = new AdminGuard();
    const context = mockExecutionContext({ roles: [] });
    expect(guard.canActivate(context)).toBe(false);
  });
});
