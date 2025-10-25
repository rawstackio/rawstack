import { ExecutionContext } from '@nestjs/common';
import { UserUserGuard } from '~/common/infrastructure/security/guard/user.user.guard';

const mockExecutionContext = (user: any, params: any = {}) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        user,
        params,
      }),
    }),
  }) as unknown as ExecutionContext;

describe('UserUserGuard', () => {
  it('returns false if user is missing', () => {
    const Guard = UserUserGuard({ action: 'UPDATE_USER' });
    const guard = new Guard();
    const context = mockExecutionContext(undefined, { userId: '123' });
    expect(guard.canActivate(context)).toBe(false);
  });

  it('returns false if userId is missing', () => {
    const Guard = UserUserGuard({ action: 'UPDATE_USER' });
    const guard = new Guard();
    const context = mockExecutionContext({ id: '123', roles: [] }, {});
    expect(guard.canActivate(context)).toBe(false);
  });

  it('returns true if user is admin regardless of userId', () => {
    const Guard = UserUserGuard({ action: 'UPDATE_USER' });
    const guard = new Guard();
    const context = mockExecutionContext({ id: '123', roles: ['ADMIN'] }, { userId: '456' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('returns true if user id matches userId param for UPDATE_USER', () => {
    const Guard = UserUserGuard({ action: 'UPDATE_USER' });
    const guard = new Guard();
    const context = mockExecutionContext({ id: '123', roles: [] }, { userId: '123' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('returns false if user id does not match userId param for UPDATE_USER', () => {
    const Guard = UserUserGuard({ action: 'UPDATE_USER' });
    const guard = new Guard();
    const context = mockExecutionContext({ id: '123', roles: [] }, { userId: '456' });
    expect(guard.canActivate(context)).toBe(false);
  });

  it('returns true if user id matches userId param for DELETE_USER', () => {
    const Guard = UserUserGuard({ action: 'DELETE_USER' });
    const guard = new Guard();
    const context = mockExecutionContext({ id: '789', roles: [] }, { userId: '789' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('returns false for unknown action', () => {
    const Guard = UserUserGuard({ action: 'UNKNOWN_ACTION' });
    const guard = new Guard();
    const context = mockExecutionContext({ id: '123', roles: [] }, { userId: '123' });
    expect(guard.canActivate(context)).toBe(false);
  });

  it('uses custom userIdFrom function', () => {
    const Guard = UserUserGuard({
      action: 'UPDATE_USER',
      userIdFrom: (req) => req.customId,
    });
    const guard = new Guard();
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'abc', roles: [] },
          customId: 'abc',
        }),
      }),
    } as unknown as ExecutionContext;
    expect(guard.canActivate(context)).toBe(true);
  });
});
