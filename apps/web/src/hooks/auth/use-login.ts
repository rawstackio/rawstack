import { useMutation } from '@tanstack/react-query';
import { useAuth, UserCredentials } from '@/lib/context/auth-context';

interface UseLoginOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useLogin(options?: UseLoginOptions) {
  const { login } = useAuth();

  const { mutate, isPending } = useMutation({
    mutationFn: (credentials: UserCredentials) => {
      return login(credentials);
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return { login: mutate, isBusy: isPending };
}
