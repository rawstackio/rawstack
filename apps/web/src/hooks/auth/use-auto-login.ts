import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/context/auth-context';

interface AutoLoginParams {
  email: string;
  token: string;
}

interface UseAutoLoginOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useAutoLogin(options?: UseAutoLoginOptions) {
  const { login } = useAuth();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: AutoLoginParams) => {
      return login({ email: data.email, refreshToken: data.token });
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return { autoLogin: mutate, isBusy: isPending };
}
