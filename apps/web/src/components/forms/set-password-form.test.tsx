import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SetPasswordForm } from './set-password-form';
import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from 'next/navigation';
import Api from '@/lib/api/Api';

// Wrapper component that provides QueryClient for tests
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock dependencies
vi.mock('@/lib/context/auth-context');
vi.mock('next/navigation');
vi.mock('@/lib/api/Api', () => ({
  default: {
    user: {
      updateUser: vi.fn(),
    },
  },
}));
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('SetPasswordForm', () => {
  const mockPush = vi.fn();
  const mockUpdateUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof useRouter>);
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com', roles: [], unverifiedEmail: undefined },
      login: vi.fn(),
      logout: vi.fn(),
      authModalIsOpen: false,
      openAuthModal: vi.fn(),
      closeAuthModal: vi.fn(),
      refreshUser: vi.fn(),
      getAuthItems: vi.fn(),
    });
    Api.user.updateUser = mockUpdateUser;
  });

  it('should render password input fields', () => {
    render(<SetPasswordForm />, { wrapper: createTestWrapper() });

    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
  });

  it('should show validation error when password is too short', async () => {
    const user = userEvent.setup();
    render(<SetPasswordForm />, { wrapper: createTestWrapper() });

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    await user.type(passwordInput, 'short');
    await user.type(confirmInput, 'short');

    const submitButton = screen.getByRole('button', { name: /update password/i });

    // Button should be disabled when form is invalid
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('should show validation error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<SetPasswordForm />, { wrapper: createTestWrapper() });

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);

    await user.type(passwordInput, 'password123');
    await user.type(confirmInput, 'different123');

    const submitButton = screen.getByRole('button', { name: /update password/i });

    // Button should be disabled when passwords don't match
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    mockUpdateUser.mockResolvedValue({ data: { success: true } });

    render(<SetPasswordForm />, { wrapper: createTestWrapper() });

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmInput, 'newpassword123');

    const submitButton = screen.getByRole('button', { name: /update password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith('user-123', {
        password: 'newpassword123',
      });
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('should show error toast if user is not authenticated', async () => {
    const { toast } = await import('sonner');
    vi.mocked(useAuth).mockReturnValue({
      user: undefined,
      login: vi.fn(),
      logout: vi.fn(),
      authModalIsOpen: false,
      openAuthModal: vi.fn(),
      closeAuthModal: vi.fn(),
      refreshUser: vi.fn(),
      getAuthItems: vi.fn(),
    });

    const user = userEvent.setup();
    render(<SetPasswordForm />, { wrapper: createTestWrapper() });

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmInput, 'newpassword123');

    const submitButton = screen.getByRole('button', { name: /update password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('User not authenticated');
    });
  });

  it('should disable submit button while form is submitting', async () => {
    const user = userEvent.setup();
    // Use a promise that we can control
    let resolveUpdate: ((value: unknown) => void) | undefined;
    const updatePromise = new Promise((resolve) => {
      resolveUpdate = resolve;
    });
    mockUpdateUser.mockReturnValue(updatePromise);

    render(<SetPasswordForm />, { wrapper: createTestWrapper() });

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmInput, 'newpassword123');

    const submitButton = screen.getByRole('button', { name: /update password/i });
    await user.click(submitButton);

    // Check button is disabled during submission
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    // Resolve the promise to prevent hanging
    if (resolveUpdate) resolveUpdate({ data: { success: true } });
  });
});
