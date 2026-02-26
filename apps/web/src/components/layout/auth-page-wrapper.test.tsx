import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import AuthPageWrapper from './auth-page-wrapper'
import { useAuth } from '@/lib/context/auth-context'
import { useRouter } from 'next/navigation'

// Mock dependencies
vi.mock('@/lib/context/auth-context')
vi.mock('next/navigation')

describe('AuthPageWrapper', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof useRouter>)
  })

  it('should not redirect when user is not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: undefined,
      login: vi.fn(),
      logout: vi.fn(),
      authModalIsOpen: false,
      openAuthModal: vi.fn(),
      closeAuthModal: vi.fn(),
      refreshUser: vi.fn(),
      getAuthItems: vi.fn(),
    })

    render(
      <AuthPageWrapper title="Test Page">
        <div>Test Content</div>
      </AuthPageWrapper>
    )

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should redirect to home when user is authenticated and skipRedirect is false', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com', roles: [], unverifiedEmail: undefined },
      login: vi.fn(),
      logout: vi.fn(),
      authModalIsOpen: false,
      openAuthModal: vi.fn(),
      closeAuthModal: vi.fn(),
      refreshUser: vi.fn(),
      getAuthItems: vi.fn(),
    })

    render(
      <AuthPageWrapper title="Test Page">
        <div>Test Content</div>
      </AuthPageWrapper>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('should redirect to home when user is authenticated and skipRedirect is not provided', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com', roles: [], unverifiedEmail: undefined },
      login: vi.fn(),
      logout: vi.fn(),
      authModalIsOpen: false,
      openAuthModal: vi.fn(),
      closeAuthModal: vi.fn(),
      refreshUser: vi.fn(),
      getAuthItems: vi.fn(),
    })

    render(
      <AuthPageWrapper title="Test Page" skipRedirect={false}>
        <div>Test Content</div>
      </AuthPageWrapper>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('should NOT redirect when user is authenticated but skipRedirect is true', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com', roles: [], unverifiedEmail: undefined },
      login: vi.fn(),
      logout: vi.fn(),
      authModalIsOpen: false,
      openAuthModal: vi.fn(),
      closeAuthModal: vi.fn(),
      refreshUser: vi.fn(),
      getAuthItems: vi.fn(),
    })

    render(
      <AuthPageWrapper title="Test Page" skipRedirect={true}>
        <div>Test Content</div>
      </AuthPageWrapper>
    )

    expect(mockPush).not.toHaveBeenCalled()
  })
})
