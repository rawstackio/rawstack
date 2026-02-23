import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth, UserCredentials } from '../../lib/context/AuthContext.tsx';
import { AuthenticationError } from '../../lib/api/exception/errors.ts';

interface UseLoginOptions {
  onSuccess?: () => void;
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AuthenticationError) {
    return error.type === 'USER_NOT_FOUND' ? 'User not found' : 'Invalid email or password';
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('401') || message.includes('unauthorized')) {
      return 'Invalid email or password';
    }
    if (message.includes('network') || message.includes('timeout')) {
      return 'Network error. Please check your connection and try again.';
    }
  }

  return 'An unexpected error occurred. Please try again.';
};

export function useLogin(options?: UseLoginOptions) {
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const { mutate, isPending } = useMutation({
    mutationFn: (credentials: UserCredentials) => login(credentials),
    onSuccess: () => {
      setErrorMessage(undefined);
      options?.onSuccess?.();
    },
    onError: error => {
      setErrorMessage(getErrorMessage(error));
    },
  });

  return { login: mutate, isBusy: isPending, errorMessage };
}
