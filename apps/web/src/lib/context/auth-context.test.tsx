import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import AuthProvider, { useAuth } from './auth-context'
import Api from '../api/Api'
import LocalStorageProvider from '../storage/localStorage'
import { ApiError } from '../api/exception/errors'
import UserModel from '../model/UserModel'

vi.mock('../api/Api', () => ({
  default: {
    auth: { createToken: vi.fn() },
    user: { getCurrentUser: vi.fn() },
    init: vi.fn(),
  },
}))

vi.mock('../storage/localStorage', () => ({
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
  data: {
    item: {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
    },
  },
}

const userResponse = {
  data: {
    item: {
      id: 'user-1',
      email: 'test@example.com',
      roles: ['VERIFIED_USER'],
    },
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  // Default: no stored auth data so the mount effect is a no-op
  mockStorage.getData.mockResolvedValue(undefined)
  mockStorage.setData.mockResolvedValue(undefined)
})

describe('login', () => {
  it('authenticates with email and password, fetches user, and sets state', async () => {
    mockApi.auth.createToken.mockResolvedValue(tokenResponse)
    mockApi.user.getCurrentUser.mockResolvedValue(userResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'Password1!' })
    })

    expect(mockApi.auth.createToken).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password1!',
    })
    expect(mockApi.user.getCurrentUser).toHaveBeenCalled()
    expect(result.current.user?.email).toBe('test@example.com')
  })

  it('normalises email to lowercase before sending', async () => {
    mockApi.auth.createToken.mockResolvedValue(tokenResponse)
    mockApi.user.getCurrentUser.mockResolvedValue(userResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login({ email: 'TEST@EXAMPLE.COM', password: 'Password1!' })
    })

    expect(mockApi.auth.createToken).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com' }),
    )
  })

  it('authenticates with a refresh token', async () => {
    mockApi.auth.createToken.mockResolvedValue(tokenResponse)
    mockApi.user.getCurrentUser.mockResolvedValue(userResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login({ email: 'test@example.com', refreshToken: 'my-refresh' })
    })

    expect(mockApi.auth.createToken).toHaveBeenCalledWith({
      email: 'test@example.com',
      refreshToken: 'my-refresh',
    })
  })

  it('skips fetchUser when a user model is pre-supplied', async () => {
    mockApi.auth.createToken.mockResolvedValue(tokenResponse)
    const preSupplied = new UserModel('user-1', 'test@example.com', ['VERIFIED_USER'])

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login(
        { email: 'test@example.com', password: 'Password1!' },
        preSupplied,
      )
    })

    expect(mockApi.user.getCurrentUser).not.toHaveBeenCalled()
    expect(result.current.user).toBe(preSupplied)
  })

  it('calls Api.init with the returned tokens on success', async () => {
    mockApi.auth.createToken.mockResolvedValue(tokenResponse)
    mockApi.user.getCurrentUser.mockResolvedValue(userResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'Password1!' })
    })

    expect(mockApi.init).toHaveBeenCalledWith(
      'access-token',
      expect.objectContaining({ token: 'refresh-token', email: 'test@example.com' }),
      expect.any(Function),
    )
  })

  it('throws AuthenticationError when the API returns 401', async () => {
    mockApi.auth.createToken.mockRejectedValue(
      new ApiError(401, 'UNAUTHORIZED', 'Invalid credentials'),
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await expect(
        result.current.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow('Invalid credentials')
    })
  })

  it('clears stored auth data when a refresh token login fails', async () => {
    mockApi.auth.createToken.mockRejectedValue(
      new ApiError(401, 'UNAUTHORIZED', 'Token expired'),
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await expect(
        result.current.login({ email: 'test@example.com', refreshToken: 'expired' }),
      ).rejects.toThrow()
    })

    expect(mockStorage.setData).toHaveBeenCalledWith('authData', undefined)
  })
})

describe('logout', () => {
  it('clears user state, wipes auth storage, and resets Api', async () => {
    mockApi.auth.createToken.mockResolvedValue(tokenResponse)
    mockApi.user.getCurrentUser.mockResolvedValue(userResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'Password1!' })
    })

    await act(async () => {
      await result.current.logout()
    })

    await waitFor(() => expect(result.current.user).toBeUndefined())
    expect(mockStorage.setData).toHaveBeenCalledWith('authData', undefined)
    expect(mockApi.init).toHaveBeenCalledWith(undefined, undefined, undefined)
  })
})

describe('refreshUser', () => {
  it('re-fetches the current user and updates state', async () => {
    mockApi.user.getCurrentUser.mockResolvedValue(userResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.refreshUser()
    })

    expect(result.current.user?.email).toBe('test@example.com')
  })
})

describe('getAuthItems', () => {
  it('returns stored auth data from localStorage', async () => {
    const stored = {
      accessToken: 'tok',
      refreshToken: 'ref',
      expiresAt: '2099-01-01T00:00:00Z',
      userEmail: 'test@example.com',
    }
    mockStorage.getData.mockResolvedValue(stored)

    const { result } = renderHook(() => useAuth(), { wrapper })

    let items: unknown
    await act(async () => {
      items = await result.current.getAuthItems()
    })

    expect(items).toEqual(stored)
  })

  it('returns undefined when nothing is stored', async () => {
    mockStorage.getData.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth(), { wrapper })

    let items: unknown
    await act(async () => {
      items = await result.current.getAuthItems()
    })

    expect(items).toBeUndefined()
  })
})

describe('modal controls', () => {
  it('opens and closes the auth modal', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => result.current.closeAuthModal())
    expect(result.current.authModalIsOpen).toBe(false)

    act(() => result.current.openAuthModal())
    expect(result.current.authModalIsOpen).toBe(true)
  })
})
