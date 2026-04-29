import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import AuthProvider, { useAuth } from './auth-context';
import { AuthenticationError, ApiError } from '../api/exception/errors';
import * as authActions from '@/actions/auth';

vi.mock('@/actions/auth', () => ({
  login: vi.fn(),
  autoLogin: vi.fn(),
  logout: vi.fn(),
  getMe: vi.fn(),
  register: vi.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;

const userPayload = {
  id: 'user-1',
  email: 'test@example.com',
  roles: ['VERIFIED_USER'],
  unverifiedEmail: undefined,
};

beforeEach(() => {
  vi.clearAllMocks();
  // Default: no active session
  vi.mocked(authActions.getMe).mockResolvedValue(null);
});

describe('login with email and password', () => {
  it('calls login action, sets user on success', async () => {
    vi.mocked(authActions.login).mockResolvedValue(userPayload as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'Password1!' });
    });

    expect(result.current.user?.email).toBe('test@example.com');
  });

  it('normalises email to lowercase', async () => {
    vi.mocked(authActions.login).mockResolvedValue(userPayload as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({ email: 'TEST@EXAMPLE.COM', password: 'Password1!' });
    });

    expect(authActions.login).toHaveBeenCalledWith('test@example.com', 'Password1!');
  });

  it('throws AuthenticationError on 401', async () => {
    vi.mocked(authActions.login).mockRejectedValue(
      new ApiError(401, 'UNAUTHORIZED', 'Invalid credentials'),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await expect(
        result.current.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toBeInstanceOf(AuthenticationError);
    });
  });
});

describe('login with refresh token (auto-login)', () => {
  it('calls autoLogin action and sets user on success', async () => {
    vi.mocked(authActions.autoLogin).mockResolvedValue(userPayload as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({ email: 'test@example.com', refreshToken: 'my-refresh-token' });
    });

    expect(result.current.user?.email).toBe('test@example.com');
  });

  it('throws AuthenticationError when autoLogin returns 401', async () => {
    vi.mocked(authActions.autoLogin).mockRejectedValue(
      new ApiError(401, 'UNAUTHORIZED', 'Token expired'),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await expect(
        result.current.login({ email: 'test@example.com', refreshToken: 'expired' }),
      ).rejects.toBeInstanceOf(AuthenticationError);
    });
  });
});

describe('logout', () => {
  it('calls logout action and clears user state', async () => {
    vi.mocked(authActions.login).mockResolvedValue(userPayload as never);
    vi.mocked(authActions.logout).mockResolvedValue();

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'Password1!' });
    });

    expect(result.current.user).toBeDefined();

    await act(async () => {
      await result.current.logout();
    });

    await waitFor(() => expect(result.current.user).toBeUndefined());
  });
});

describe('refreshUser', () => {
  it('calls getMe and updates state', async () => {
    vi.mocked(authActions.getMe).mockResolvedValue(userPayload as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(result.current.user?.email).toBe('test@example.com');
  });

  it('clears user if getMe returns null', async () => {
    let callCount = 0;
    vi.mocked(authActions.getMe).mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? (userPayload as never) : null;
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.user).toBeDefined());

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(result.current.user).toBeUndefined();
  });
});

describe('session restore on mount', () => {
  it('sets user when getMe returns a user on init', async () => {
    vi.mocked(authActions.getMe).mockResolvedValue(userPayload as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.user?.email).toBe('test@example.com'));
  });

  it('leaves user undefined when getMe returns null', async () => {
    vi.mocked(authActions.getMe).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.user).toBeUndefined());
  });
});

describe('modal controls', () => {
  it('opens and closes the auth modal', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => result.current.closeAuthModal());
    expect(result.current.authModalIsOpen).toBe(false);

    act(() => result.current.openAuthModal());
    expect(result.current.authModalIsOpen).toBe(true);
  });
});
