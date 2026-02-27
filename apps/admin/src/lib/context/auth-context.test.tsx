import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import AuthProvider, { useAuth } from './auth-context'
import Api from '../api/api.ts'
import LocalStorageProvider from '../storage/local-storage.ts'
import { AuthenticationError } from '../api/exception/errors.ts'
import UserModel from '../model/user-model.ts'

vi.mock('../api/api.ts', () => ({
  default: {
    auth: { createToken: vi.fn() },
    user: { getCurrentUser: vi.fn() },
    init: vi.fn(),
  },
}))

vi.mock('../storage/local-storage.ts', () => ({
  default: {
    getData: vi.fn(),
    setData: vi.fn(),
  },
}))

const mockApi = Api as {
  auth: { createToken: ReturnType<typeof vi.fn> }
  user: { getCurrentUser: ReturnType<typeof vi.fn> }
  init: ReturnType<typeof vi.fn>
}
const mockStorage = LocalStorageProvider as {
  getData: ReturnType<typeof vi.fn>
  setData: ReturnType<typeof vi.fn>
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

const tokenResponse = {
  status: 201,
  data: {
    item: {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
    },
  },
}

const adminUserResponse = {
  status: 200,
  data: {
    item: {
      id: 'user-1',
      email: 'admin@example.com',
      roles: ['ADMIN', 'VERIFIED_USER'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  },
}

const nonAdminUserResponse = {
  status: 200,
  data: {
    item: {
      id: 'user-2',
      email: 'user@example.com',
      roles: ['VERIFIED_USER'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  mockStorage.getData.mockResolvedValue(undefined)
  mockStorage.setData.mockResolvedValue(undefined)
})

describe('login', () => {
  it('logs in an admin user with email and password', async () => {
    mockApi.auth.createToken.mockResolvedValue(tokenResponse)
    mockApi.user.getCurrentUser.mockResolvedValue(adminUserResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login({ email: 'admin@example.com', password: 'Password1!' })
    })

    expect(mockApi.auth.createToken).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'Password1!',
    })
    expect(result.current.user?.email).toBe('admin@example.com')
  })

  it('logs in with a refresh token', async () => {
    mockApi.auth.createToken.mockResolvedValue(tokenResponse)
    mockApi.user.getCurrentUser.mockResolvedValue(adminUserResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login({ email: 'admin@example.com', refreshToken: 'my-refresh' })
    })

    expect(mockApi.auth.createToken).toHaveBeenCalledWith({
      email: 'admin@example.com',
      refreshToken: 'my-refresh',
    })
  })

  it('throws AuthenticationError when the user is not an admin', async () => {
    mockApi.auth.createToken.mockResolvedValue(tokenResponse)
    mockApi.user.getCurrentUser.mockResolvedValue(nonAdminUserResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await expect(
        result.current.login({ email: 'user@example.com', password: 'Password1!' }),
      ).rejects.toThrow('User does not have admin access')
    })
  })

  it('does not set user state when a non-admin login is rejected', async () => {
    mockApi.auth.createToken.mockResolvedValue(tokenResponse)
    mockApi.user.getCurrentUser.mockResolvedValue(nonAdminUserResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      try {
        await result.current.login({ email: 'user@example.com', password: 'Password1!' })
      } catch {
        // expected rejection
      }
    })

    expect(result.current.user).toBeUndefined()
  })

  it('throws AuthenticationError when credentials are invalid (status !== 201)', async () => {
    mockApi.auth.createToken.mockResolvedValue({ status: 401, data: { item: {} } })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await expect(
        result.current.login({ email: 'admin@example.com', password: 'wrong' }),
      ).rejects.toBeInstanceOf(AuthenticationError)
    })
  })

  it('skips fetchUser when a user model is pre-supplied', async () => {
    mockApi.auth.createToken.mockResolvedValue(tokenResponse)
    const preSupplied = new UserModel(
      'user-1',
      'admin@example.com',
      ['ADMIN', 'VERIFIED_USER'],
      '2024-01-01T00:00:00Z',
      '2024-01-01T00:00:00Z',
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login(
        { email: 'admin@example.com', password: 'Password1!' },
        preSupplied,
      )
    })

    expect(mockApi.user.getCurrentUser).not.toHaveBeenCalled()
    expect(result.current.user).toBe(preSupplied)
  })

  it('clears stored auth data when a refresh token login fails', async () => {
    mockApi.auth.createToken.mockResolvedValue({ status: 401, data: { item: {} } })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await expect(
        result.current.login({ email: 'admin@example.com', refreshToken: 'expired' }),
      ).rejects.toThrow()
    })

    expect(mockStorage.setData).toHaveBeenCalledWith('authData', undefined)
  })
})

describe('logout', () => {
  it('clears user state and wipes auth storage', async () => {
    mockApi.auth.createToken.mockResolvedValue(tokenResponse)
    mockApi.user.getCurrentUser.mockResolvedValue(adminUserResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login({ email: 'admin@example.com', password: 'Password1!' })
    })

    await act(async () => {
      await result.current.logout()
    })

    await waitFor(() => expect(result.current.user).toBeUndefined())
    expect(mockStorage.setData).toHaveBeenCalledWith('authData', undefined)
  })
})

describe('requestPasswordReset', () => {
  it('calls the auth API with the provided email', async () => {
    mockApi.auth.createToken.mockResolvedValue({})

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.requestPasswordReset('user@example.com')
    })

    expect(mockApi.auth.createToken).toHaveBeenCalledWith({ email: 'user@example.com' })
  })
})

describe('refreshUser', () => {
  it('re-fetches the current user and updates state', async () => {
    mockApi.user.getCurrentUser.mockResolvedValue(adminUserResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.refreshUser()
    })

    expect(result.current.user?.email).toBe('admin@example.com')
  })
})

describe('loaded state', () => {
  it('becomes true after the initial auth check completes with no stored credentials', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.loaded).toBe(true))
  })

  it('auto-logs in and is loaded when valid credentials are stored', async () => {
    const stored = {
      accessToken: 'tok',
      refreshToken: 'ref',
      expiresAt: '2099-01-01T00:00:00Z',
      userEmail: 'admin@example.com',
    }
    mockStorage.getData.mockResolvedValue(stored)
    mockApi.auth.createToken.mockResolvedValue(tokenResponse)
    mockApi.user.getCurrentUser.mockResolvedValue(adminUserResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.loaded).toBe(true)
      expect(result.current.user?.email).toBe('admin@example.com')
    })
  })
})
