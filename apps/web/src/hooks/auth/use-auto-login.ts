import { useAuth } from '@/lib/context/auth-context';
import { useMutationWithCallbacks, type UseMutationWithCallbacksOptions } from '@/hooks/use-mutation-with-callbacks';

interface AutoLoginParams {
  email: string;
  token: string;
}

export function useAutoLogin(options?: UseMutationWithCallbacksOptions<AutoLoginParams>) {
  const { login } = useAuth();

  const { mutate, isPending } = useMutationWithCallbacks(
    (data: AutoLoginParams) => login({ email: data.email, refreshToken: data.token }),
    options,
  );

  return { autoLogin: mutate, isBusy: isPending };
}
